/**
 * Navix Auth — Schéma de validation du formulaire de réinitialisation du mot de passe.
 * Exigences : 8 caractères minimum, au moins une majuscule, une lettre et un
 * chiffre, et confirmation identique au mot de passe.
 */
import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Le mot de passe est requis.')
      .min(PASSWORD_MIN_LENGTH, `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`)
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule.')
      .regex(/[A-Za-z]/, 'Le mot de passe doit contenir au moins une lettre.')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre.'),
    confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe.'),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

export const resetPasswordDefaultValues = {
  password: '',
  confirmPassword: '',
};
