import { randomBytes } from 'crypto';

export function createConfirmationNumber(): string {
  return `LS-${randomBytes(4).toString('hex').toUpperCase()}`;
}
