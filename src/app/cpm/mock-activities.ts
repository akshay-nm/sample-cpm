// Mock activities for CPM demo
const mockActivities = [
  // Pre-Construction
  { id: "P1", name: "Site Clearing", duration: 4, dependencies: [] },
  { id: "P2", name: "Soil Testing", duration: 3, dependencies: ["P1"] },
  { id: "P3", name: "Site Marking", duration: 2, dependencies: ["P2"] },

  // Tower A
  { id: "A1", name: "Excavation - Tower A", duration: 5, dependencies: ["P3"] },
  { id: "A2", name: "Foundation - Tower A", duration: 6, dependencies: ["A1"] },
  { id: "A3", name: "Structure - Tower A (10 floors)", duration: 30, dependencies: ["A2"] },
  { id: "A4", name: "Internal Works - Tower A", duration: 12, dependencies: ["A3"] },
  { id: "A5", name: "Finishing & Inspection - A", duration: 8, dependencies: ["A4"] },

  // Tower B
  { id: "B1", name: "Excavation - Tower B", duration: 5, dependencies: ["P3"] },
  { id: "B2", name: "Foundation - Tower B", duration: 6, dependencies: ["B1"] },
  { id: "B3", name: "Structure - Tower B (12 floors)", duration: 36, dependencies: ["B2"] },
  { id: "B4", name: "Internal Works - Tower B", duration: 12, dependencies: ["B3"] },
  { id: "B5", name: "Finishing & Inspection - B", duration: 8, dependencies: ["B4"] },

  // Tower C
  { id: "C1", name: "Excavation - Tower C", duration: 5, dependencies: ["P3"] },
  { id: "C2", name: "Foundation - Tower C", duration: 6, dependencies: ["C1"] },
  { id: "C3", name: "Structure - Tower C (14 floors)", duration: 42, dependencies: ["C2"] },
  { id: "C4", name: "Internal Works - Tower C", duration: 12, dependencies: ["C3"] },
  { id: "C5", name: "Finishing & Inspection - C", duration: 8, dependencies: ["C4"] },

  // Common Infrastructure
  { id: "I1", name: "Drainage + Water Supply", duration: 10, dependencies: ["P3"] },
  { id: "I2", name: "Road Work", duration: 12, dependencies: ["I1"] },
  { id: "I3", name: "Clubhouse Construction", duration: 20, dependencies: ["I1"] },
  { id: "I4", name: "Swimming Pool", duration: 12, dependencies: ["I3"] },
  { id: "I5", name: "Park & Landscaping", duration: 14, dependencies: ["I1"] },

  // Final Handover
  { id: "H1", name: "Final Township Handover", duration: 3, dependencies: ["A5", "B5", "C5", "I2", "I4", "I5"] },
];

export default mockActivities; 