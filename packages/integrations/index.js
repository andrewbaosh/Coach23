import { PROVIDERS } from '../shared/index.js';
/** Adapter contract: sync({ athleteId, now }) -> normalized records.
 * Live adapters must implement OAuth, pagination, refresh, deletion and retries.
 * Demo workouts use duration only: they are NOT physiological training load.
 */
export function createAdapter(provider, { mode = 'demo' } = {}) {
  if (!PROVIDERS.includes(provider)) throw new Error('Unknown provider');
  if (mode !== 'demo') throw new Error(`${provider}: live integration is not implemented`);
  return {
    provider, mode,
    async sync({ athleteId, now }) {
      const date = now.toISOString().slice(0, 10);
      if (provider === 'suunto') return []; // Reserved adapter, no fabricated duplicate workouts.
      if (provider === 'whoop') return [{ athleteId, provider, externalId: `recovery-${date}`,
        type: 'recovery', date, recoveryPercent: 72, hrvMs: 58, sleepMinutes: 450, simulated: true }];
      return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(now); day.setUTCDate(day.getUTCDate() - i);
        const date = day.toISOString().slice(0, 10);
        return { athleteId, provider, externalId: `workout-${date}`, type: 'workout', date,
          durationMinutes: i % 3 === 0 ? 0 : 40 + i * 5, simulated: true };
      });
    }
  };
}
