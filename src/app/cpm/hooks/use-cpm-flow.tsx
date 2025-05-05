import { useLayoutEffect, useRef, useMemo, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import Tippy from "@tippyjs/react";
import { calculateCPM, CPMResult } from "../utils/cpm";
import { assignLanes } from "../utils/assign-vertical-levels";
import { CPMStatus, CPMActivity, CPMTaskWithStatus, CPMTaskWithStatusAndLane } from "../types/cpm-types";

function useCPMFlow(activities: CPMActivity[], projectStartDate: Date) {
  const [showOverview, setShowOverview] = useState(true);
  const weekBarRef = useRef<HTMLDivElement | null>(null);
  const DAY_WIDTH = 20;
  const ROW_HEIGHT = 120;
  const result = useMemo<CPMTaskWithStatus[]>(() => {
    const base = calculateCPM(activities);
    return base.map((task: CPMResult) => ({
      ...task,
      status: (Math.random() < 0.6 ? "completed" : "not-started") as CPMStatus,
    }));
  }, [activities]);
  const totalDays = Math.max(...result.map((task: CPMResult) => task.ef));
  const totalWeeks = Math.ceil(totalDays / 7);
  const totalWidth = totalWeeks * 7 * DAY_WIDTH;
  const positionedTasks: CPMTaskWithStatusAndLane[] = assignLanes(result) as CPMTaskWithStatusAndLane[];
  const maxLane = Math.max(...positionedTasks.map((t) => t.lane)) + 1;
  const flowHeight = ROW_HEIGHT * maxLane + 200;
  const today = new Date();
  const todayIndex = differenceInCalendarDays(today, projectStartDate);
  const todayX = todayIndex * DAY_WIDTH;
  const nodes = positionedTasks.map((task: CPMTaskWithStatusAndLane) => ({
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
  const edges = result.flatMap((task) =>
    task.dependencies.map((dep: string) => ({
      id: `e${dep}-${task.id}`,
      source: dep,
      target: task.id,
      animated: true,
      style: { stroke: task.isCritical ? "#f87171" : "#9ca3af" },
    }))
  );
  const layoutedNodes = nodes;
  const layoutedEdges = edges;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewportContainerWidth, setViewportContainerWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  useLayoutEffect(() => {
    function updateWidths() {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
      if (viewportContainerRef.current) setViewportContainerWidth(viewportContainerRef.current.offsetWidth);
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
  return {
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
  };
}

export default useCPMFlow; 