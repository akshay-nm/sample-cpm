"use client";

import { ReactFlow, Background, Controls, Node, Edge, useReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo, useRef, useLayoutEffect, useState, useEffect } from "react";
import { calculateCPM, CPMActivity, CPMResult } from "./utils/cpm";
import { getLayoutedElements } from "./utils/flowLayout";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import ProjectOverview from "./project-overview";
import WeekBar from "./week-bar";
import CPMContainer from "./cpm-container";
import { assignLanes } from "./utils/assign-vertical-levels";
import { differenceInCalendarDays } from "date-fns";

const mockActivities = [
  // Pre-Construction
  { id: "P1", name: "Site Clearing", duration: 4, dependencies: [] },
  { id: "P2", name: "Soil Testing", duration: 3, dependencies: ["P1"] },
  { id: "P3", name: "Site Marking", duration: 2, dependencies: ["P2"] },

  // Tower A
  { id: "A1", name: "Excavation - Tower A", duration: 5, dependencies: ["P3"] },
  { id: "A2", name: "Foundation - Tower A", duration: 6, dependencies: ["A1"] },
  {
    id: "A3",
    name: "Structure - Tower A (10 floors)",
    duration: 30,
    dependencies: ["A2"],
  },
  {
    id: "A4",
    name: "Internal Works - Tower A",
    duration: 12,
    dependencies: ["A3"],
  },
  {
    id: "A5",
    name: "Finishing & Inspection - A",
    duration: 8,
    dependencies: ["A4"],
  },

  // Tower B
  { id: "B1", name: "Excavation - Tower B", duration: 5, dependencies: ["P3"] },
  { id: "B2", name: "Foundation - Tower B", duration: 6, dependencies: ["B1"] },
  {
    id: "B3",
    name: "Structure - Tower B (12 floors)",
    duration: 36,
    dependencies: ["B2"],
  },
  {
    id: "B4",
    name: "Internal Works - Tower B",
    duration: 12,
    dependencies: ["B3"],
  },
  {
    id: "B5",
    name: "Finishing & Inspection - B",
    duration: 8,
    dependencies: ["B4"],
  },

  // Tower C
  { id: "C1", name: "Excavation - Tower C", duration: 5, dependencies: ["P3"] },
  { id: "C2", name: "Foundation - Tower C", duration: 6, dependencies: ["C1"] },
  {
    id: "C3",
    name: "Structure - Tower C (14 floors)",
    duration: 42,
    dependencies: ["C2"],
  },
  {
    id: "C4",
    name: "Internal Works - Tower C",
    duration: 12,
    dependencies: ["C3"],
  },
  {
    id: "C5",
    name: "Finishing & Inspection - C",
    duration: 8,
    dependencies: ["C4"],
  },

  // Common Infrastructure
  {
    id: "I1",
    name: "Drainage + Water Supply",
    duration: 10,
    dependencies: ["P3"],
  },
  { id: "I2", name: "Road Work", duration: 12, dependencies: ["I1"] },
  {
    id: "I3",
    name: "Clubhouse Construction",
    duration: 20,
    dependencies: ["I1"],
  },
  { id: "I4", name: "Swimming Pool", duration: 12, dependencies: ["I3"] },
  { id: "I5", name: "Park & Landscaping", duration: 14, dependencies: ["I1"] },

  // Final Handover
  {
    id: "H1",
    name: "Final Township Handover",
    duration: 3,
    dependencies: ["A5", "B5", "C5", "I2", "I4", "I5"],
  },
];
const DAY_WIDTH = 20;
const ROW_HEIGHT = 150;

const projectStartDate = new Date("2025-04-01"); // replace with your actual project start
const today = new Date();
const todayIndex = differenceInCalendarDays(today, projectStartDate);
const todayX = todayIndex * DAY_WIDTH;

function CPMFlowInner() {
  const [showOverview, setShowOverview] = useState(true);
  const weekBarRef = useRef<HTMLDivElement>(null);
  type CPMStatus = "completed" | "not-started";
  type CPMResultWithStatus = CPMResult & { status: CPMStatus };
  const result = useMemo<CPMResultWithStatus[]>(() => {
    const base = calculateCPM(mockActivities);
    return base.map((task) => ({
      ...task,
      status: (Math.random() < 0.6 ? "completed" : "not-started") as CPMStatus,
    }));
  }, []);
  console.log(
    result.map((t) => ({
      name: t.name,
      es: t.es,
      ef: t.ef,
      duration: t.duration,
    }))
  );
  const totalDays = Math.max(...result.map((task) => task.ef));
  const totalWeeks = Math.ceil(totalDays / 7);
  const totalWidth = totalWeeks * 7 * DAY_WIDTH;
  console.log("totalWidth:", totalWidth)
  const positionedTasks = assignLanes(result);
  const maxLane = Math.max(...positionedTasks.map((t) => t.lane)) + 1;
  const ROW_HEIGHT = 120;
  const flowHeight = ROW_HEIGHT * maxLane + 200; // Add buffer for padding
  const nodes: Node[] = positionedTasks.map((task) => ({
    id: task.id,
    position: {
      x: task.es * DAY_WIDTH,
      y: task.lane * ROW_HEIGHT,
    },
    data: {
      label: (
        <Tippy
          content={
            <div>
              <strong>{task.name}</strong>
              <br />
              Status: {task.status}
              <br />
              ES: {task.es}, EF: {task.ef}
            </div>
          }
        >
          <div>{task.name}</div>
        </Tippy>
      ),
    },
    style: {
      background: `hsl(${task.lane * 40}, 80%, 85%)`, // temp color
      width: task.duration * DAY_WIDTH,
      padding: 6,
      borderRadius: 6,
      // background: task.isCritical ? "#f87171" : "#d1d5db",
      color: "#1f2937",
      border: "1px solid #ccc",
    },
    draggable: false,
    selectable: false,
  }));

  const edges: Edge[] = result.flatMap((task) =>
    task.dependencies.map((dep) => ({
      id: `e${dep}-${task.id}`,
      source: dep,
      target: task.id,
      animated: true,
      style: { stroke: task.isCritical ? "#f87171" : "#9ca3af" },
    }))
  );
  const layoutedNodes = nodes;
  const layoutedEdges = edges; // or "TB" for top-to-bottom

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewportContainerWidth, setViewportContainerWidth] = useState(0);
  const [zoom, setZoom] = useState(1);

  const { setViewport } = useReactFlow();

  useEffect(() => {
    if (containerWidth && viewportContainerWidth) {
      setViewport({ x: 0, y: 50, zoom: 1 });
    }
  }, [containerWidth, viewportContainerWidth, setViewport]);

  useLayoutEffect(() => {
    function updateWidths() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
      if (viewportContainerRef.current) {
        setViewportContainerWidth(viewportContainerRef.current.offsetWidth);
      }
    }
    updateWidths();
    window.addEventListener('resize', updateWidths);
    return () => window.removeEventListener('resize', updateWidths);
  }, []);

  const maxPanX = containerWidth + viewportContainerWidth / zoom;

  // console.log("containerWidth:", containerWidth, "viewportContainerWidth:", viewportContainerWidth, "maxPanX:", maxPanX);

  useLayoutEffect(() => {
    if (weekBarRef.current) {
      weekBarRef.current.style.transform = `translateX(0px) scaleX(1)`;
    }
  }, [totalDays, DAY_WIDTH]);

  console.log("WeekBar width (totalDays * DAY_WIDTH):", totalDays * DAY_WIDTH);

  return (
    <div className="p-6 space-y-6 overflow-x-auto w-full">
      {/* 🔸 Toggle Button */}
      <button
        onClick={() => setShowOverview(!showOverview)}
        className="px-4 py-2 rounded bg-orange-500 text-white font-semibold hover:brightness-110 transition"
      >
        {showOverview ? "Hide Overview" : "Show Overview"}
      </button>

      {/* 🔹 Grid Layout */}
      <div
        className={`grid gap-8 ${
          showOverview ? "lg:grid-cols-2" : "grid-cols-1"
        } transition-all duration-300`}
      >
        {showOverview && (
          <ProjectOverview
            tasks={result}
            projectStartDate={new Date("2025-04-01")}
          />
        )}
        <div className="overflow-x-hidden w-full" ref={viewportContainerRef}>
          <div
            ref={containerRef}
            style={{ position: "relative", width: totalWidth }}
          >
            <CPMContainer totalWidth={totalWidth}>
              <div
                ref={weekBarRef}
                style={{
                  transition: "transform 0.1s linear",
                  willChange: "transform",
                  transformOrigin: "0 0",
                  width: totalWidth,
                  position: "relative",
                }}
              >
                {/* Orange line for today, spanning WeekBar + React Flow */}
                <div
                  style={{
                    position: "absolute",
                    left: todayX,
                    top: 40,
                    height:  flowHeight, 
                    width: "2px",
                    backgroundColor: "#fb923c",
                    zIndex: 100,
                    pointerEvents: "none",
                  }}
                />
                <WeekBar
                  totalDays={totalDays}
                  dayWidth={DAY_WIDTH}
                  startDate={new Date("2025-04-01")}
                />
              </div>

              <div
                className="relative"
                style={{
                  width: `${totalWidth}px`,
                  height: `${flowHeight}px`,
                }}
              >
                <ReactFlow
                  nodes={layoutedNodes}
                  edges={layoutedEdges}
                  fitView={false}
                  panOnDrag
                  zoomOnScroll={false}
                  defaultViewport={{ x: 0, y: 50, zoom: 1 }}
                  minZoom={0.8}
                  translateExtent={[
                    [0, -50],
                    [maxPanX, 1000000],
                  ]}
                  onMove={(_, viewport) => {
                    setZoom(viewport.zoom);
                    if (weekBarRef.current) {
                      weekBarRef.current.style.transform = `translateX(${viewport.x}px) scaleX(${viewport.zoom})`;
                    }
                  }}
                >
                  <Background />
                  <Controls />
                </ReactFlow>
              </div>
            </CPMContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CPMFlow() {
  return (
    <ReactFlowProvider>
      <CPMFlowInner />
    </ReactFlowProvider>
  );
}
