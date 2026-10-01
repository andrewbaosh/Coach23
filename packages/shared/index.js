export const DEMO_ATHLETE_ID = '00000000-0000-4000-8000-000000000023';
export const PROVIDERS = ['strava', 'whoop', 'suunto'];
export function dayKey(date) { return new Date(date).toISOString().slice(0, 10); }
export function validNumber(value) { return typeof value === 'number' && Number.isFinite(value); }
