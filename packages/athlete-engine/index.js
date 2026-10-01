import { dayKey, validNumber } from '../shared/index.js';
export function computeAthleteState(records, now = new Date()) {
  const today = dayKey(now);
  const start = new Date(now); start.setUTCDate(start.getUTCDate() - 6);
  const window = records.filter(r => r.date >= dayKey(start) && r.date <= today);
  const workouts = window.filter(r => r.type === 'workout' && validNumber(r.durationMinutes) && r.durationMinutes >= 0);
  const recovery = window.find(r => r.type === 'recovery' && r.date === today);
  const recoveryPercent = validNumber(recovery?.recoveryPercent) && recovery.recoveryPercent >= 0 && recovery.recoveryPercent <= 100 ? recovery.recoveryPercent : null;
  return { asOf: now.toISOString(), timezone: 'UTC', workoutMinutes7d: workouts.reduce((sum, r) => sum + r.durationMinutes, 0),
    recoveryPercent, hrvMs: validNumber(recovery?.hrvMs) && recovery.hrvMs > 0 ? recovery.hrvMs : null,
    baseline: null, dataQuality: recoveryPercent === null ? 'missing-current-recovery' : 'demo-only' };
}
