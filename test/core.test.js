import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { MemoryAthleteRepository } from '../packages/athlete-db/index.js';
import { computeAthleteState } from '../packages/athlete-engine/index.js';
import { createAdapter } from '../packages/integrations/index.js';
import { runDailyReview } from '../jobs/daily-review/index.js';
import { createApp } from '../apps/api/server.js';
const now = new Date('2026-10-01T08:00:00Z');
test('repeat sync is idempotent and review cannot apply plans', async () => {
  const repository = new MemoryAthleteRepository();
  const first = await runDailyReview({ repository, now });
  const second = await runDailyReview({ repository, now });
  assert.deepEqual(first, second);
  assert.equal(second.recordCount, 8);
  assert.equal(second.context.state.workoutMinutes7d, 220);
  assert.equal(second.review.planApplied, false);
  assert.equal(second.review.aiGenerated, false);
});
test('repository isolates athletes and protects records from external mutation', () => {
  const repo = new MemoryAthleteRepository();
  const record = { athleteId: 'a', provider: 'strava', type: 'workout', externalId: '1', durationMinutes: 30 };
  repo.upsert([record]); record.durationMinutes = 99;
  assert.equal(repo.list('a')[0].durationMinutes, 30);
  assert.deepEqual(repo.list('b'), []);
  const copy = repo.list('a'); copy[0].durationMinutes = 90;
  assert.equal(repo.list('a')[0].durationMinutes, 30);
});
test('window excludes old/future and invalid values; stale recovery stays unknown', () => {
  const records = [
    { type: 'workout', date: '2026-09-25', durationMinutes: 40 },
    { type: 'workout', date: '2026-09-24', durationMinutes: 100 },
    { type: 'workout', date: '2026-10-02', durationMinutes: 100 },
    { type: 'workout', date: '2026-10-01', durationMinutes: -10 },
    { type: 'workout', date: '2026-10-01', durationMinutes: '50' },
    { type: 'recovery', date: '2026-09-30', recoveryPercent: 80 }
  ];
  const state = computeAthleteState(records, now);
  assert.equal(state.workoutMinutes7d, 40);
  assert.equal(state.recoveryPercent, null);
  assert.equal(state.baseline, null);
  assert.equal(state.dataQuality, 'missing-current-recovery');
});
test('live adapters fail explicitly', () => {
  for (const provider of ['strava', 'whoop', 'suunto']) assert.throws(() => createAdapter(provider, { mode: 'live' }), /not implemented/);
});
test('API serves health, page, integration status, review and 404', async t => {
  const server = createApp();
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await (await fetch(`${base}/api/health`)).json()).status, 'ok');
  assert.match(await (await fetch(base)).text(), /Coach23/);
  const integrations = await (await fetch(`${base}/api/integrations`)).json();
  assert.equal(integrations.length, 3);
  assert.ok(integrations.every(i => !i.connected));
  assert.equal((await (await fetch(`${base}/api/demo/review`)).json()).mode, 'demo');
  assert.equal((await fetch(`${base}/unknown`)).status, 404);
});
