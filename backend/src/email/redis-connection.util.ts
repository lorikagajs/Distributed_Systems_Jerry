/** BullMQ/ioredis connection — use IPv4 for localhost on Windows. */
export function parseRedisConnection(redisUrl: string): {
  host: string;
  port: number;
} {
  try {
    const url = new URL(redisUrl);
    let host = url.hostname;
    if (host === 'localhost' || host === '::1') {
      host = '127.0.0.1';
    }
    const port = url.port ? Number(url.port) : 6379;
    return { host, port };
  } catch {
    return { host: '127.0.0.1', port: 6379 };
  }
}
