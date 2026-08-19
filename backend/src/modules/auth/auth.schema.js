import { z } from 'zod';

const nameSchema = z.string().min(1, 'Le nom est requis').max(100);
const emailSchema = z.string().min(1, 'L\'email est requis').email('Email invalide').toLowerCase().trim();
const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');
const confirmPasswordSchema = z.string().min(1, 'La confirmation du mot de passe est requise');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerClientSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis').max(200),
  sector: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  role: z.literal('client_enterprise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const registerDriverSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  role: z.literal('driver'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const registerPartnerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis').max(200),
  partnerType: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  role: z.literal('partner'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Le refresh token est requis'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Le token est requis'),
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: passwordSchema,
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});
