import { beforeEach, describe, expect, it } from 'vitest';
import { LRUCache } from '../../src/lib/LRUCache';

describe('LRUCache', () => {
  let cache: LRUCache<string, string>;

  beforeEach(() => {
    cache = new LRUCache({ capacity: 2 });
  });

  it('should create an instance of LRUCache', () => {
    expect(cache).toBeInstanceOf(LRUCache);
  });

  it('should thow an error for invalid capacity', () => {
    expect(() => new LRUCache({ capacity: 0 })).toThrow(
      'Capacity must be greater than 0',
    );
  });

  it('should store and retrieve a value', () => {
    cache.put('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should evict least recently used item when capacity is exceeded', () => {
    cache.put('key1', 'value1');
    cache.put('key2', 'value2');
    cache.put('key3', 'value3');

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
  });

  it('should track size correctly', () => {
    expect(cache.size()).toBe(0);
    cache.put('key1', 'value1');
    expect(cache.size()).toBe(1);
    cache.put('key2', 'value2');
    expect(cache.size()).toBe(2);
  });

  describe('TTL Functionality', () => {
    it('should expire items after TTL', async () => {
      const ttlCache = new LRUCache({ capacity: 2, ttl: 100 });

      ttlCache.put('key1', 'value1');

      expect(ttlCache.get('key1')).toBe('value1');

      await new Promise((resolve) => setTimeout(resolve, 110));

      expect(ttlCache.get('key1')).toBeUndefined();
    });

    it('should not expire items before TTL', async () => {
      const ttlCache = new LRUCache({ capacity: 2, ttl: 100 });

      ttlCache.put('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(ttlCache.get('key1')).toBe('value1');
    });

    it('should handle mixed expired and non-expired items', async () => {
      const ttlCache = new LRUCache({ capacity: 3, ttl: 100 });

      ttlCache.put('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 50));

      ttlCache.put('key2', 'value2');
      ttlCache.put('key3', 'value3');

      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(ttlCache.get('key1')).toBeUndefined();
      expect(ttlCache.get('key2')).toBe('value2');
      expect(ttlCache.get('key3')).toBe('value3');
    });
  });
});
