import { pathToFileURL } from 'node:url';
import { createAdapter } from '../../packages/integrations/index.js';
import { MemoryAthleteRepository } from '../../packages/athlete-db/index.js';
import { computeAthleteState } from '../../packages/athlete-engine/index.js';
import { buildCoachContext } from '../../packages/context-builder/index.js';
import { DemoCoachAgent } from '../../packages/coach-engine/index.js';
import { DEMO_ATHLETE_ID, PROVIDERS } from '../../packages/shared/index.js';
export async function runDailyReview({ repository = new MemoryAthleteRepository(), coach = new DemoCoachAgent(), now = new Date(), athleteId = DEMO_ATHLETE_ID } = {}) {
  for (const provider of PROVIDERS) repository.upsert(await createAdapter(provider).sync({ athleteId, now }));
  const records = repository.list(athleteId);
  const context = buildCoachContext(athleteId, computeAthleteState(records, now));
  return { mode: 'demo', recordCount: records.length, context, review: await coach.review(context) };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await runDailyReview(), null, 2));
}
