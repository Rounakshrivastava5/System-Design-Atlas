import { describe, it, expect } from 'vitest';
import { mathUtils } from '../utils/math';

describe('mathUtils', () => {
  describe('formatCompactNumber', () => {
    it('formats small numbers with commas', () => {
      expect(mathUtils.formatCompactNumber(0)).toBe('0');
      expect(mathUtils.formatCompactNumber(500)).toBe('500');
      expect(mathUtils.formatCompactNumber(999)).toBe('999');
    });

    it('formats thousands (K)', () => {
      expect(mathUtils.formatCompactNumber(1000)).toBe('1K');
      expect(mathUtils.formatCompactNumber(1500)).toBe('1.5K');
      expect(mathUtils.formatCompactNumber(99999)).toBe('100K');
    });

    it('formats millions (M)', () => {
      expect(mathUtils.formatCompactNumber(1_000_000)).toBe('1M');
      expect(mathUtils.formatCompactNumber(2_500_000)).toBe('2.5M');
      expect(mathUtils.formatCompactNumber(100_000_000)).toBe('100M');
    });

    it('formats billions (B)', () => {
      expect(mathUtils.formatCompactNumber(1_000_000_000)).toBe('1B');
      expect(mathUtils.formatCompactNumber(4_800_000_000)).toBe('4.8B');
    });

    it('handles NaN gracefully', () => {
      expect(mathUtils.formatCompactNumber(NaN)).toBe('0');
    });
  });

  describe('formatBytes', () => {
    it('formats 0 bytes correctly', () => {
      expect(mathUtils.formatBytes(0)).toBe('0 B');
    });

    it('formats bytes, KB, MB, GB, TB', () => {
      expect(mathUtils.formatBytes(500)).toBe('500 B');
      expect(mathUtils.formatBytes(1024)).toBe('1 KB');
      expect(mathUtils.formatBytes(1024 * 1024)).toBe('1 MB');
      expect(mathUtils.formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      expect(mathUtils.formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
    });
  });

  describe('calculateLittlesLaw', () => {
    it('calculates concurrency correctly (L = λ * W)', () => {
      // 1000 QPS with 200ms latency = 1000 * 0.2 = 200 concurrent requests
      expect(mathUtils.calculateLittlesLaw(1000, 200)).toBe(200);

      // 50000 QPS with 10ms latency = 50000 * 0.01 = 500 concurrent requests
      expect(mathUtils.calculateLittlesLaw(50000, 10)).toBe(500);

      // 0 QPS = 0
      expect(mathUtils.calculateLittlesLaw(0, 100)).toBe(0);
    });
  });

  describe('estimateStorage', () => {
    it('estimates storage over days accurately', () => {
      // 100 writes/sec, 1000 bytes/write, 1 day = 100 * 1000 * 86400 = 8,640,000,000 bytes
      expect(mathUtils.estimateStorage(100, 1000, 1)).toBe(8_640_000_000);

      // 30 days default
      const thirtyDays = mathUtils.estimateStorage(10, 500);
      expect(thirtyDays).toBe(10 * 500 * 30 * 86400);
    });
  });

  describe('calculatePathLatency', () => {
    it('sums latencies across nodes', () => {
      expect(mathUtils.calculatePathLatency([5, 12, 35, 8])).toBe(60);
      expect(mathUtils.calculatePathLatency([])).toBe(0);
    });
  });

  describe('hashString', () => {
    it('produces deterministic non-negative 32-bit hash', () => {
      const h1 = mathUtils.hashString('user-10029');
      const h2 = mathUtils.hashString('user-10029');
      const h3 = mathUtils.hashString('user-10030');

      expect(h1).toBe(h2);
      expect(h1).toBeGreaterThanOrEqual(0);
      expect(typeof h1).toBe('number');
      expect(h1).not.toBe(h3);
    });
  });
});
