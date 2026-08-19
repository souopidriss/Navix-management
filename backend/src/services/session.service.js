import bcrypt from 'bcrypt';
import authSessionRepository from '../repositories/AuthSessionRepository.js';
import { generateRefreshToken, verifyRefreshToken } from './token.service.js';
import { getPool } from '../database/index.js';
import config from '../config/index.js';

const REFRESH_HASH_ROUNDS = 10;

function parseExpiresIn(str) {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return num * multipliers[unit];
}

export async function createSession({ userId, ipAddress, userAgent }) {
  const expiresIn = config.jwt.refreshExpiresIn;

  const expiresMs = parseExpiresIn(expiresIn);
  const expiresAt = new Date(Date.now() + expiresMs);

  const tokenPayload = { sub: userId, type: 'refresh' };
  const refreshToken = generateRefreshToken(tokenPayload);
  const refreshTokenHash = await bcrypt.hash(refreshToken, REFRESH_HASH_ROUNDS);

  const sessionId = await authSessionRepository.createSession({
    userId,
    refreshTokenHash,
    ipAddress,
    userAgent,
    expiresAt: expiresAt.toISOString().slice(0, 19).replace('T', ' '),
  });

  return { sessionId, refreshToken, expiresAt, userId };
}

export async function validateSession(refreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return null;
  }

  if (decoded.type !== 'refresh') return null;

  const [rows] = await getPool().execute(
    `SELECT * FROM auth_sessions WHERE user_id = ? AND revoked_at IS NULL AND expires_at > NOW()`,
    [decoded.sub]
  );

  for (const session of rows) {
    const match = await bcrypt.compare(refreshToken, session.refresh_token_hash);
    if (match) {
      await authSessionRepository.updateLastUsed(session.id);
      return { session, userId: decoded.sub };
    }
  }

  return null;
}

export async function revokeSession(sessionId) {
  await authSessionRepository.revoke(sessionId);
}

export async function revokeAllSessions(userId) {
  await authSessionRepository.revokeAllByUser(userId);
}

export async function rotateRefreshToken(oldRefreshToken, ipAddress, userAgent) {
  const validation = await validateSession(oldRefreshToken);
  if (!validation) return null;

  await authSessionRepository.revokeSession(validation.session.id);

  return createSession({
    userId: validation.userId,
    ipAddress,
    userAgent,
  });
}

export async function cleanupSessions() {
  return authSessionRepository.cleanupExpired();
}
