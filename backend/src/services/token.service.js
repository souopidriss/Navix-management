import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const ALGORITHM = 'HS256';

export function generateAccessToken(payload) {
  return jwt.sign({ ...payload, type: 'access' }, config.jwt.accessSecret, {
    algorithm: ALGORITHM,
    expiresIn: config.jwt.accessExpiresIn,
  });
}

export function generateRefreshToken(payload) {
  return jwt.sign({ ...payload, type: 'refresh' }, config.jwt.refreshSecret, {
    algorithm: ALGORITHM,
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret, { algorithms: [ALGORITHM] });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret, { algorithms: [ALGORITHM] });
}

export function decodeToken(token) {
  return jwt.decode(token, { complete: true });
}

export function getTokenExpiration(token) {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) return null;
  return new Date(decoded.exp * 1000);
}
