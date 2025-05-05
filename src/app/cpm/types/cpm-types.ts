import { CPMResult } from "../utils/cpm";

export type CPMStatus = "completed" | "not-started";

export type CPMActivity = {
  id: string;
  name: string;
  duration: number;
  dependencies: string[];
};

export interface CPMChartProps {
  activities: CPMActivity[];
  projectStartDate: Date;
}

export type CPMTaskWithStatus = CPMResult & { status: CPMStatus };
export type CPMTaskWithStatusAndLane = CPMTaskWithStatus & { lane: number };

export interface WeekBarProps {
  totalDays: number;
  dayWidth: number;
  startDate: Date;
}
