import bcrypt from 'bcrypt';
import crypto from 'crypto';
import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';
import companyRepository from '../repositories/CompanyRepository.js';
import authSessionRepository from '../repositories/AuthSessionRepository.js';
import { hashPassword, comparePassword, validatePasswordPolicy } from './password.service.js';
import { generateAccessToken } from './token.service.js';
import { createSession, revokeAllSessions, rotateRefreshToken, validateSession } from './session.service.js';
import { generateId } from '../utils/id.js';
import { getPool } from '../database/index.js';
import config from '../config/index.js';
import {
  AuthenticationError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../errors/index.js';
import { recordAudit } from './audit.service.js';
import logger from '../logs/logger.js';

function normalizeEmail(email) {
  return email?.trim().toLowerCase();
}

function formatUserResponse(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    name: `${user.first_name} ${user.last_name}`,
    displayName: `${user.first_name} ${user.last_name}`,
    email: user.email,
    phone: user.phone || null,
    jobTitle: user.job_title || null,
    role: user.role,
    status: user.status,
    avatar: user.avatar_url || null,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function formatCompanyResponse(company) {
  if (!company) return { id: null, name: null, slug: null };
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
  };
}

function formatAuthResponse(user, company) {
  return {
    user: formatUserResponse(user),
    company: formatCompanyResponse(company),
    tenant: formatCompanyResponse(company),
  };
}

export async function login({ email, password, rememberMe = false }, { ipAddress, userAgent } = {}) {
  const normalizedEmail = normalizeEmail(email);

  const user = await userRepository.findByEmail(normalizedEmail);
  if (!user) {
    logger.warn('Login attempt with unknown email', { email: normalizedEmail, ip: ipAddress });
    throw new AuthenticationError('Identifiants invalides. Vérifiez votre adresse email et votre mot de passe.');
  }

  if (user.status === 'inactive' || user.status === 'suspended') {
    logger.warn('Login attempt on disabled account', { userId: user.id, status: user.status, ip: ipAddress });
    throw new AuthenticationError('Identifiants invalides. Vérifiez votre adresse email et votre mot de passe.');
  }

  if (user.status === 'pending') {
    logger.warn('Login attempt on pending account', { userId: user.id, ip: ipAddress });
    throw new AuthenticationError('Identifiants invalides. Vérifiez votre adresse email et votre mot de passe.');
  }

  const passwordValid = await comparePassword(password, user.password_hash);
  if (!passwordValid) {
    logger.warn('Login failed: invalid password', { userId: user.id, email: normalizedEmail, ip: ipAddress });
    await recordAudit({
      action: 'LOGIN',
      actionType: 'authentication',
      entityType: 'user',
      entityId: user.id,
      description: `Tentative de connexion échouée: ${normalizedEmail}`,
      status: 'failed',
      severity: 'medium',
      req: { ip: ipAddress, headers: { 'user-agent': userAgent }, user: { id: user.id, companyId: user.company_id } },
    });
    throw new AuthenticationError('Identifiants invalides. Vérifiez votre adresse email et votre mot de passe.');
  }

  const session = await createSession({
    userId: user.id,
    ipAddress,
    userAgent,
    rememberMe,
  });

  await userRepository.updateLastLogin(user.id);

  logger.info('Login successful', {
    userId: user.id,
    email: normalizedEmail,
    role: user.role,
    companyId: user.company_id,
    ip: ipAddress,
  });

  await recordAudit({
    action: 'LOGIN',
    actionType: 'authentication',
    entityType: 'user',
    entityId: user.id,
    description: `Connexion réussie: ${normalizedEmail}`,
    status: 'success',
    severity: 'low',
    req: { ip: ipAddress, headers: { 'user-agent': userAgent }, user: { id: user.id, companyId: user.company_id } },
  });

  let company = null;
  if (user.company_id) {
    company = await companyRepository.findById(user.company_id);
  }

  const tokenPayload = { sub: user.id, role: user.role };
  if (user.company_id) tokenPayload.companyId = user.company_id;

  const accessToken = generateAccessToken(tokenPayload);

  return {
    ...formatAuthResponse(user, company),
    tokens: {
      accessToken,
      refreshToken: session.refreshToken,
      expiresIn: 900,
      refreshExpiresIn: 604800,
      rememberMe,
    },
  };
}

export async function registerClient(payload, { ipAddress, userAgent } = {}) {
  return register({
    ...payload,
    role: 'client_enterprise',
  }, { ipAddress, userAgent });
}

export async function registerDriver(payload, { ipAddress, userAgent } = {}) {
  return register({
    ...payload,
    role: 'driver',
  }, { ipAddress, userAgent });
}

export async function registerPartner(payload, { ipAddress, userAgent } = {}) {
  return register({
    ...payload,
    role: 'partner',
  }, { ipAddress, userAgent });
}

async function register(payload, { ipAddress, userAgent } = {}) {
  const { firstName, lastName, email, password, confirmPassword, role, companyName } = payload;

  const normalizedEmail = normalizeEmail(email);

  const passwordCheck = validatePasswordPolicy(password);
  if (!passwordCheck.valid) {
    throw new ValidationError('Politique de mot de passe non respectée', passwordCheck.errors);
  }

  if (password !== confirmPassword) {
    throw new ValidationError('Les mots de passe ne correspondent pas');
  }

  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) {
    throw new ConflictError('Un compte existe déjà avec cette adresse email.');
  }

  const PUBLIC_ROLES = ['client_enterprise', 'driver', 'partner'];
  if (!PUBLIC_ROLES.includes(role)) {
    throw new BadRequestError('Rôle non autorisé pour l\'inscription publique.');
  }

  const roleData = await roleRepository.findByCode(role);
  if (!roleData) {
    throw new NotFoundError('Rôle');
  }

  const passwordHash = await hashPassword(password);

  let companyId = null;
  if (companyName && (role === 'client_enterprise' || role === 'partner')) {
    const baseSlug = companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const company = await companyRepository.create({
      name: companyName.trim(),
      slug,
      status: 'active',
      is_active: true,
    });
    companyId = company.id;
  }

  const userId = generateId();
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await getPool().execute(
    `INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
    [userId, companyId, normalizedEmail, passwordHash, firstName.trim(), lastName.trim(), role, now, now]
  );

  const user = await userRepository.findByIdWithCompany(userId);
  let company = null;
  if (companyId) {
    company = await companyRepository.findById(companyId);
  }

  const session = await createSession({
    userId,
    ipAddress,
    userAgent,
  });

  const tokenPayload = { sub: userId, role };
  if (companyId) tokenPayload.companyId = companyId;

  const accessToken = generateAccessToken(tokenPayload);

  await recordAudit({
    action: 'CREATE',
    actionType: 'authentication',
    entityType: 'user',
    entityId: userId,
    description: `Nouvel utilisateur créé: ${normalizedEmail} (${role})`,
    newValues: { email: normalizedEmail, role, firstName, lastName },
    status: 'success',
    severity: 'low',
    req: { ip: ipAddress, headers: { 'user-agent': userAgent }, user: { id: userId, companyId } },
  });

  logger.info('User registered', { userId, email: normalizedEmail, role, companyId });

  return {
    ...formatAuthResponse(user, company),
    tokens: {
      accessToken,
      refreshToken: session.refreshToken,
      expiresIn: 900,
      refreshExpiresIn: 604800,
    },
  };
}

export async function logout(userId, refreshToken) {
  if (refreshToken) {
    const validation = await validateSession(refreshToken);
    if (validation && validation.userId === userId) {
      await authSessionRepository.revokeSession(validation.session.id);
    }
  } else {
    await revokeAllSessions(userId);
  }
  logger.info('User logged out', { userId });
  await recordAudit({
    action: 'LOGOUT',
    actionType: 'authentication',
    entityType: 'user',
    entityId: userId,
    description: 'Déconnexion',
    status: 'success',
    severity: 'low',
    userId,
  });
  return { success: true };
}

export async function logoutAll(userId) {
  await revokeAllSessions(userId);
  return { success: true };
}

export async function refreshToken(refreshToken, { ipAddress, userAgent } = {}) {
  if (!refreshToken) {
    throw new AuthenticationError('Refresh token requis.');
  }

  const result = await rotateRefreshToken(refreshToken, ipAddress, userAgent);
  if (!result) {
    throw new AuthenticationError('Session expirée ou invalide. Veuillez vous reconnecter.');
  }

  const user = await userRepository.findByIdWithCompany(result.userId);
  if (!user) {
    throw new AuthenticationError('Utilisateur non trouvé.');
  }

  const tokenPayload = { sub: user.id, role: user.role };
  if (user.company_id) tokenPayload.companyId = user.company_id;

  const accessToken = generateAccessToken(tokenPayload);

  return {
    tokens: {
      accessToken,
      refreshToken: result.refreshToken,
      expiresIn: 900,
      refreshExpiresIn: 604800,
    },
  };
}

export async function getMe(userId) {
  const user = await userRepository.findByIdWithCompany(userId);
  if (!user) {
    throw new NotFoundError('Utilisateur');
  }

  return {
    user: formatUserResponse(user),
  };
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('Utilisateur');
  }

  const valid = await comparePassword(currentPassword, user.password_hash);
  if (!valid) {
    throw new AuthenticationError('Mot de passe actuel incorrect.');
  }

  const passwordCheck = validatePasswordPolicy(newPassword);
  if (!passwordCheck.valid) {
    throw new ValidationError('Politique de mot de passe non respectée', passwordCheck.errors);
  }

  if (currentPassword === newPassword) {
    throw new BadRequestError('Le nouveau mot de passe doit être différent de l\'actuel.');
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepository.updatePasswordHash(userId, passwordHash);

  await revokeAllSessions(userId);

  await recordAudit({
    action: 'PASSWORD_RESET',
    actionType: 'security',
    entityType: 'user',
    entityId: userId,
    description: 'Changement de mot de passe',
    status: 'success',
    severity: 'medium',
    userId,
  });

  return { success: true };
}

export async function forgotPassword(email) {
  const normalizedEmail = normalizeEmail(email);
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    return { success: true };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = await bcrypt.hash(resetToken, 10);

  await getPool().execute(
    `UPDATE users SET refresh_token_hash = ?, updated_at = NOW() WHERE id = ?`,
    [resetTokenHash, user.id]
  );

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    if (config.email.user) {
      await transporter.sendMail({
        from: config.email.from,
        to: normalizedEmail,
        subject: 'Navix Management - Réinitialisation du mot de passe',
        html: `
          <h1>Réinitialisation du mot de passe</h1>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Ce lien expirera dans ${config.auth.passwordResetTokenExpiresMinutes} minutes.</p>
          <p><a href="${config.cors.origin}/reset-password?token=${resetToken}">Réinitialiser mon mot de passe</a></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        `,
      });
    }
  } catch {
    // Email not configured — silently continue (token still created)
  }

  return { success: true };
}

export async function resetPassword({ token, password, confirmPassword }) {
  if (!token) {
    throw new BadRequestError('Token de réinitialisation requis.');
  }

  if (password !== confirmPassword) {
    throw new ValidationError('Les mots de passe ne correspondent pas');
  }

  const passwordCheck = validatePasswordPolicy(password);
  if (!passwordCheck.valid) {
    throw new ValidationError('Politique de mot de passe non respectée', passwordCheck.errors);
  }

  const [users] = await getPool().execute(
    `SELECT id, refresh_token_hash, updated_at FROM users WHERE refresh_token_hash IS NOT NULL AND deleted_at IS NULL`
  );

  const expiresMinutes = config.auth.passwordResetTokenExpiresMinutes || 15;

  for (const user of users[0] || users) {
    const match = await bcrypt.compare(token, user.refresh_token_hash);
    if (match) {
      if (user.updated_at) {
        const tokenAge = (Date.now() - new Date(user.updated_at).getTime()) / (1000 * 60);
        if (tokenAge > expiresMinutes) {
          await getPool().execute(
            `UPDATE users SET refresh_token_hash = NULL, updated_at = NOW() WHERE id = ?`,
            [user.id]
          );
          throw new BadRequestError('Token de réinitialisation invalide ou expiré.');
        }
      }

      const passwordHash = await hashPassword(password);
      await userRepository.updatePasswordHash(user.id, passwordHash);
      await getPool().execute(
        `UPDATE users SET refresh_token_hash = NULL, updated_at = NOW() WHERE id = ?`,
        [user.id]
      );
      await revokeAllSessions(user.id);
      return { success: true };
    }
  }

  throw new BadRequestError('Token de réinitialisation invalide ou expiré.');
}
