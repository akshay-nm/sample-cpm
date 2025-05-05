import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CPMChart from "./components/cpm-chart";
import mockActivities from "./mock-activities";

export default function CPMFlow() {
  return (
    <ReactFlowProvider>
      <CPMChart
        activities={mockActivities}
        projectStartDate={new Date("2025-04-01")}
      />
    </ReactFlowProvider>
  );
}
