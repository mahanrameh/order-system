export const REDIS_CLIENT = 'REDIS_CLIENT';
export const DEFAULT_TTL_SECONDS = 60;
export const DEFAULT_LOCK_TTL_MS = 10_000;

export const keyFor = (env: string, svc: string, purpose: string, ...parts: (string|number)[]) =>
  [env, svc, purpose, ...parts].join(':');