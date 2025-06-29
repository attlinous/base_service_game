import * as crypto from 'crypto';

export function maskPartialString(
  text: any,
  numberStart: number,
  numberEnd: number,
  stringMiddle = '***',
): string {
  if (typeof text !== 'string') return '';

  const totalLen = text.length;

  if (numberStart + numberEnd >= totalLen) {
    numberStart = Math.floor(totalLen / 2);
    numberEnd = totalLen - numberStart;
  }

  const start = text.slice(0, numberStart);
  const end = text.slice(-numberEnd);

  return start + stringMiddle + end;
}

export function generateHMAC(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
