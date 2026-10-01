/** Ephemeral demo repository. Production persistence is deliberately an injected boundary. */
export class MemoryAthleteRepository {
  #records = new Map();
  upsert(records) {
    for (const record of records) {
      const key = JSON.stringify([record.athleteId, record.provider, record.type, record.externalId]);
      this.#records.set(key, structuredClone(record));
    }
  }
  list(athleteId) {
    return structuredClone([...this.#records.values()].filter(r => r.athleteId === athleteId));
  }
}
