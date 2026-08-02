/**
 * Navix Auth — Schéma de validation du formulaire de connexion.
 */
import { z } from 'zod';
import { emailSchema } from './common';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Le mot de passe est requis.'),
  rememberMe: z.boolean().optional(),
});

export const loginDefaultValues = {
  email: '',
  password: '',
  rememberMe: false,
};
