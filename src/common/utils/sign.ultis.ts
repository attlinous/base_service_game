import * as crypto from 'crypto';

export function generateSign(
  site: string,
  username: string,
  timestamp: number,
  secretKey?: string,
): string {
  const raw = `${site}${secretKey}${username}${timestamp}`;
  return crypto.createHash('md5').update(raw).digest('hex');
}
