import { CacheOptions } from '../types/LRUCache.types';

export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  private usage: Map<K, number>;
  private expiration: Map<K, number>;
  private ttl?: number;

  constructor(options: CacheOptions) {
    if (options.capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }

    this.capacity = options.capacity;
    this.ttl = options.ttl || Infinity;
    this.cache = new Map();
    this.usage = new Map();
    this.expiration = new Map();
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    const expirationTime = this.expiration.get(key);
    if (value && expirationTime) {
      if (Date.now() < expirationTime) {
        this.usage.set(key, Date.now());
        return value;
      } else {
        this.cache.delete(key);
        this.usage.delete(key);
        this.expiration.delete(key);
      }
    }
    return undefined;
  }

  put(key: K, value: V): void {
    const now = Date.now();

    while (this.cache.size >= this.capacity) {
      const lruKey = this.findLRUKey();
      if (lruKey) {
        this.cache.delete(lruKey);
        this.usage.delete(lruKey);
        this.expiration.delete(lruKey);
      }
    }

    this.cache.set(key, value);
    this.usage.set(key, now);
    this.expiration.set(key, now + this.ttl!);
  }

  private findLRUKey(): K | undefined {
    let lruKey: K | undefined;
    let lruTime = Infinity;

    for (const [key, time] of this.usage.entries()) {
      if (time < lruTime) {
        lruTime = time;
        lruKey = key;
      }
    }
    return lruKey;
  }

  size(): number {
    return this.cache.size;
  }
}
