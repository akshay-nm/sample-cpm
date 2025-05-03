import { CPMResult } from "./cpm";

export type PositionedTask = CPMResult & { lane: number };

/**
 * Assigns each task to a vertical lane such that no tasks in the same lane overlap.
 */
export function assignLanes(tasks: CPMResult[]): PositionedTask[] {
  const sorted = [...tasks].sort((a, b) => a.es - b.es);
  const lanes: PositionedTask[][] = [];

  const positioned: PositionedTask[] = [];

  for (const task of sorted) {
    let placed = false;

    for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
      const hasConflict = lanes[laneIndex].some(
        (existing) => !(task.es >= existing.ef || task.ef <= existing.es)
      );

      if (!hasConflict) {
        const taskWithLane: PositionedTask = { ...task, lane: laneIndex };
        lanes[laneIndex].push(taskWithLane);
        positioned.push(taskWithLane);
        placed = true;
        break;
      }
    }

    if (!placed) {
      const newLaneIndex = lanes.length;
      const taskWithLane: PositionedTask = { ...task, lane: newLaneIndex };
      lanes.push([taskWithLane]);
      positioned.push(taskWithLane);
    }
  }

  return positioned;
}
