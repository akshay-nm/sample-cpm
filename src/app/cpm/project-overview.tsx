"use client";

import { CPMResult } from "./utils/cpm";
import { format } from "date-fns";
import { addDays } from "date-fns";

type ProjectOverviewProps = {
  tasks: (CPMResult & {
    status: "completed" | "in-progress" | "not-started";
  })[];
  projectStartDate: Date;
  today?: Date;
};

export default function ProjectOverview({
  tasks,
  projectStartDate,
  today = new Date(),
}: ProjectOverviewProps) {
  const totalDuration = Math.max(...tasks.map((t) => t.ef));
  const criticalTasks = tasks.filter((t) => t.isCritical);
  const nonCriticalTasks = tasks.filter((t) => !t.isCritical);

  const completedCritical = criticalTasks.filter(
    (t) => t.status === "completed"
  );
  const completedNonCritical = nonCriticalTasks.filter(
    (t) => t.status === "completed"
  );
  const completedTotal = tasks.filter((t) => t.status === "completed");

  const estimatedCompletionDate = new Date(projectStartDate);
  estimatedCompletionDate.setDate(
    estimatedCompletionDate.getDate() + totalDuration
  );

  const actualDuration = Math.ceil(
    (today.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const projectDrift = actualDuration - totalDuration;

  const mostDelayedCritical =
    criticalTasks
      .filter((t) => t.status !== "completed")
      .map((t) => today.getDate() - (projectStartDate.getDate() + t.ef))
      .sort((a, b) => b - a)[0] || 0;

  // Identify late tasks
  const lateTasks = tasks.filter((task) => {
    const plannedFinish = addDays(projectStartDate, task.ef);
    return task.status !== "completed" && today > plannedFinish;
  });

  const lateCritical = lateTasks.filter((t) => t.isCritical);
  const earlyTasks = tasks.filter((task) => {
    const plannedFinish = addDays(projectStartDate, task.ef);
    return task.status === "completed" && today < plannedFinish;
  });

  // Calculate status
  let status = "On Time";
  let reason = "All tasks are progressing as scheduled.";

  if (lateCritical.length > 0) {
    status = "Delayed";
    reason = `Critical task "${lateCritical[0].name}" is behind schedule.`;
  } else if (earlyTasks.length > 0 && lateTasks.length === 0) {
    status = "Ahead of Schedule";
    reason = `Some tasks are being completed earlier than planned.`;
  }
  return (
    <div className="bg-white shadow rounded-xl p-6 space-y-4 border border-gray-200 max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800">📋 Project Overview</h2>

      <div className="space-y-2 text-sm text-gray-700">
        <p>
          <strong>Status:</strong> {status}
        </p>
        <div>
          <strong>Reason:</strong> {reason}
          {status === "Delayed" && (
            <span className="text-sm text-red-600">
              {lateCritical.length} critical task(s) and {lateTasks.length}{" "}
              total task(s) are behind.
            </span>
          )}
          {status === "Ahead of Schedule" && mostDelayedCritical < 0 && (
            <>
              {" "}
              — fastest critical task is ahead by {Math.abs(mostDelayedCritical)} days
            </>
          )}
        </div>
        <p>
          <strong>Estimated Completion:</strong>{" "}
          {format(estimatedCompletionDate, "MMMM d, yyyy")}
        </p>
        <p>
          <strong>Planned Duration:</strong> {totalDuration} days
        </p>
        <p>
          <strong>Actual Duration:</strong> {actualDuration} days
        </p>
      </div>

      <div className="pt-4 border-t border-gray-200 text-sm text-gray-700 space-y-1">
        <p>
          🔥 <strong>Critical Path:</strong> {completedCritical.length} /{" "}
          {criticalTasks.length} completed
        </p>
        <p>
          🧱 <strong>Non-Critical Tasks:</strong> {completedNonCritical.length}{" "}
          / {nonCriticalTasks.length} completed
        </p>
        <p>
          📦 <strong>Total Tasks:</strong> {completedTotal.length} /{" "}
          {tasks.length} completed
        </p>
      </div>
    </div>
  );
}
