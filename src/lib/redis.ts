import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRedisConfigured = Boolean(
  url &&
  token &&
  !url.includes('placeholder') &&
  !token.includes('placeholder')
);

export const redis = isRedisConfigured
  ? new Redis({ url: url!, token: token! })
  : null;
