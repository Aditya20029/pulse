interface CacheEntry<T> {
  fp: string;
  value: T;
  expires: number;
}

const TTL_MS = 10 * 60 * 1000;

export class FingerprintCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  get(fp: string): T | null {
    const e = this.store.get(fp);
    if (!e) return null;
    if (e.expires < Date.now()) {
      this.store.delete(fp);
      return null;
    }
    return e.value;
  }

  set(fp: string, value: T): void {
    this.store.set(fp, { fp, value, expires: Date.now() + TTL_MS });
    if (this.store.size > 40) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
  }
}

export function clustersFingerprint(
  clusters: Array<{ id: string; events: { source: string }[] }>,
): string {
  return clusters
    .slice(0, 50)
    .map((c) => `${c.id}:${c.events.length}`)
    .join("|");
}
