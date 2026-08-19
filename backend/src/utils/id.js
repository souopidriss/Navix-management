import { ulid } from 'ulid';

export function generateId() {
  return ulid();
}

export function isValidId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(id);
}
