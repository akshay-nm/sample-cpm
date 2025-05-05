import React, { useMemo, useRef, useLayoutEffect, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  useReactFlow,
} from "@xyflow/react";
import Tippy from "@tippyjs/react";
import "@xyflow/react/dist/style.css";
import "tippy.js/dist/tippy.css";
import { calculateCPM, CPMActivity, CPMResult } from "../app/cpm/utils/cpm";
import { assignLanes } from "../app/cpm/utils/assign-vertical-levels";
import WeekBar from "../app/cpm/components/week-bar";
import CPMContainer from "../app/cpm/components/cpm-container";
import { differenceInCalendarDays } from "date-fns";

/**
 * Props for CPMChart
 */
export interface CPMChartProps {
  activities: CPMActivity[];
  projectStartDate: Date;
}

/**
 * CPMChart renders a CPM chart for the given project activities and start date.
 */
const CPMChart: React.FC<CPMChartProps> = ({ activities, projectStartDate }) => {
  const [showOverview, setShowOverview] = useState(true);
  const weekBarRef = useRef<HTMLDivElement>(null);
  type CPMStatus = "completed" | "not-started";
  type CPMResultWithStatus = CPMResult & { status: CPMStatus };
  const result = useMemo<CPMResultWithStatus[]>(() => {
    const base = calculateCPM(activities);
    return base.map((task) => ({
      ...task,
      status: (Math.random() < 0.6 ? "completed" : "not-started") as CPMStatus,
    }));
  }, [activities]);

  const DAY_WIDTH = 20;
  const today = new Date();
  const todayIndex = differenceInCalendarDays(today, projectStartDate);
  const todayX = todayIndex * DAY_WIDTH;
  const totalDays = Math.max(...result.map((task) => task.ef));
  const totalWeeks = Math.ceil(totalDays / 7);
  const totalWidth = totalWeeks * 7 * DAY_WIDTH;
  const positionedTasks = assignLanes(result);
  const maxLane = Math.max(...positionedTasks.map((t) => t.lane)) + 1;
  const ROW_HEIGHT = 120;
  const flowHeight = ROW_HEIGHT * maxLane + 200;
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
      background: `hsl(${task.lane * 40}, 80%, 85%)`,
      width: task.duration * DAY_WIDTH,
      padding: 6,
      borderRadius: 6,
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
  const layoutedEdges = edges;

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
    window.addEventListener("resize", updateWidths);
    return () => window.removeEventListener("resize", updateWidths);
  }, [showOverview]);

  const maxPanX = (2 * containerWidth + 10 - viewportContainerWidth) + 1115 * (1 - zoom);

  useLayoutEffect(() => {
    if (weekBarRef.current) {
      weekBarRef.current.style.transform = `translateX(0px) scaleX(1)`;
    }
  }, [totalDays, DAY_WIDTH]);

  return (
    <div className="p-6 space-y-6 overflow-x-auto w-full">
      {/* Toggle Button */}
      <button
        onClick={() => setShowOverview(!showOverview)}
        className="px-4 py-2 rounded bg-orange-500 text-white font-semibold hover:brightness-110 transition"
      >
        {showOverview ? "Hide Overview" : "Show Overview"}
      </button>
      <div
        className={`grid gap-8 ${showOverview ? "lg:grid-cols-2" : "grid-cols-1"} transition-all duration-300`}
      >
        {/* ProjectOverview is not included here; pass tasks to a separate component if needed */}
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
                    left: todayX - 50,
                    top: 40,
                    height: flowHeight,
                    width: "2px",
                    backgroundColor: "#fb923c",
                    zIndex: 100,
                    pointerEvents: "none",
                  }}
                />
                <WeekBar
                  totalDays={totalDays}
                  dayWidth={DAY_WIDTH}
                  startDate={projectStartDate}
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
};

export default CPMChart; 