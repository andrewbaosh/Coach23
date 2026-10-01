export function buildCoachContext(athleteId, state) {
  return { schemaVersion: 1, athleteId, state, constraints: {
    simulated: true, mayApplyPlanChanges: false,
    limitations: ['Synthetic demo data', 'No HRV baseline', 'Duration is not training load', 'UTC day boundaries in scaffold']
  } };
}
