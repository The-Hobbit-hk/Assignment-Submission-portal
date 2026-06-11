const TTL_MS = 5 * 60 * 1000;

const timestamps = new Map<string, number>();
const inflight = new Map<string, Promise<void>>();

export function isFresh(key: string, ttlMs = TTL_MS): boolean {
  const at = timestamps.get(key);
  return at != null && Date.now() - at < ttlMs;
}

export function markFresh(key: string): void {
  timestamps.set(key, Date.now());
}

export async function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const running = inflight.get(key);
  if (running) return running as Promise<T>;

  const promise = fn().finally(() => inflight.delete(key));
  inflight.set(key, promise as Promise<void>);
  return promise;
}

export async function runWithTtl(
  key: string,
  fn: () => Promise<void>,
  options?: { force?: boolean; ttlMs?: number }
): Promise<void> {
  const ttl = options?.ttlMs ?? TTL_MS;
  if (!options?.force && isFresh(key, ttl)) return;

  await dedupe(key, async () => {
    await fn();
    markFresh(key);
  });
}
