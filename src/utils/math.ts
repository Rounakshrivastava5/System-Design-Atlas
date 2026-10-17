export const mathUtils = {
  /**
   * Format numbers into compact readable notation (e.g. 1500 -> 1.5K, 2500000 -> 2.5M)
   */
  formatCompactNumber(num: number): string {
    if (isNaN(num)) return '0';
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString();
  },

  /**
   * Format bytes into readable storage units (KB, MB, GB, TB, PB)
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Calculate Little's Law: L = λ * W
   * L: Concurrency (number of requests in system)
   * λ: Arrival rate (requests per second)
   * W: Average response time / latency (seconds)
   */
  calculateLittlesLaw(arrivalRateQps: number, latencyMs: number): number {
    const latencySec = latencyMs / 1000;
    return Math.round(arrivalRateQps * latencySec);
  },

  /**
   * Estimate storage per day/month/year given record size and writes per second
   */
  estimateStorage(qps: number, payloadSizeBytes: number, days: number = 30): number {
    const seconds = days * 86400;
    return qps * payloadSizeBytes * seconds;
  },

  /**
   * Calculate compound network latency across path of nodes
   */
  calculatePathLatency(latenciesMs: number[]): number {
    return latenciesMs.reduce((acc, curr) => acc + curr, 0);
  },

  /**
   * Hash a string to a 32-bit unsigned integer (useful for consistent hash ring)
   */
  hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  },
};
