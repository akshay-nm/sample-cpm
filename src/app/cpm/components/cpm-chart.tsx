"use client";
import { useLayoutEffect } from "react";
import { ReactFlow, Background, Controls, useReactFlow } from "@xyflow/react";

import CPMContainer from "./cpm-container";
import useCPMFlow from "../hooks/use-cpm-flow";
import { CPMChartProps } from "../types/cpm-types";
import ProjectOverview from "./project-overview";
import WeekBar from "./week-bar";

function CPMChart({ activities, projectStartDate }: CPMChartProps) {
  const {
    showOverview,
    setShowOverview,
    weekBarRef,
    result,
    totalDays,
    totalWidth,
    flowHeight,
    todayX,
    layoutedNodes,
    layoutedEdges,
    containerRef,
    viewportContainerRef,
    setZoom,
    maxPanX,
    today,
    containerWidth,
    viewportContainerWidth,
  } = useCPMFlow(activities, projectStartDate);
  const { setViewport } = useReactFlow();
  useLayoutEffect(() => {
    if (containerWidth && viewportContainerWidth) {
      setViewport({ x: 0, y: 50, zoom: 1 });
    }
  }, [containerWidth, viewportContainerWidth, setViewport]);
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
            projectStartDate={projectStartDate}
            today={today}
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
                  dayWidth={20}
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
}

export default CPMChart;
