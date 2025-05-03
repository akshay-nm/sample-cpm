export interface CPMActivity {
  id: string;
  name: string;
  duration: number;
  dependencies: string[];

  // These fields are added by the CPM calculation
  es?: number; // Early Start
  ef?: number; // Early Finish
  ls?: number; // Late Start
  lf?: number; // Late Finish
  float?: number;
  isCritical?: boolean;

  // Optional status for visual state
  status?: "completed" | "not-started";
}

export type CPMResult = CPMActivity & {
  es: number;
  ef: number;
  ls: number;
  lf: number;
  float: number;
  isCritical: boolean;
};

export function calculateCPM(activities: CPMActivity[]): CPMResult[] {
  const activityMap = new Map<string, CPMResult>();

  activities.forEach((a) => {
    activityMap.set(a.id, {
      ...a,
      es: 0,
      ef: a.duration,
      ls: 0,
      lf: 0,
      float: 0,
      isCritical: false,
    });
  });

  for (const activity of activities) {
    const current = activityMap.get(activity.id)!;

    let maxEF = 0;
    for (const depId of activity.dependencies) {
      const dep = activityMap.get(depId);
      if (dep) {
        maxEF = Math.max(maxEF, dep.ef);
      }
    }

    current.es = maxEF;
    current.ef = current.es + current.duration;
  }

  const projectDuration = Math.max(
    ...Array.from(activityMap.values()).map((a) => a.ef)
  );

  const reversed = [...activities].reverse();
  for (const activity of reversed) {
    const current = activityMap.get(activity.id)!;

    const nextActivities = activities.filter((a) =>
      a.dependencies.includes(activity.id)
    );

    if (nextActivities.length === 0) {
      current.lf = projectDuration;
    } else {
      current.lf = Math.min(
        ...nextActivities.map((n) => activityMap.get(n.id)!.ls)
      );
    }

    current.ls = current.lf - current.duration;
    current.float = current.ls - current.es;
    current.isCritical = current.float === 0;
  }

  return Array.from(activityMap.values());
}
