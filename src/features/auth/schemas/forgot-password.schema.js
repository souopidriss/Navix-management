/**
 * Navix Auth — Schéma de validation du formulaire « mot de passe oublié ».
 */
import { z } from 'zod';
import { emailSchema } from './common';

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordDefaultValues = {
  email: '',
};
