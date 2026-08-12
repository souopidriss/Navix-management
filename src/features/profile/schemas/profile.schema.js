/**
 * Navix Profile — Schémas de validation Zod (profil courant)
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate).
 *  - profileSchema : champs éditables du profil de l'utilisateur courant
 *    (prénom, nom, téléphone, poste, avatar). L'email, le rôle, l'entreprise
 *    et le tenant ne sont pas modifiables depuis le profil.
 */
import { z } from 'zod';

const optionalPhone = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^[0-9+()\-. ]{6,20}$/.test(value), message);

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Le prénom est requis.')
    .min(2, 'Le prénom doit contenir au moins 2 caractères.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Le nom est requis.')
    .min(2, 'Le nom doit contenir au moins 2 caractères.'),
  phone: optionalPhone('Numéro de téléphone invalide.'),
  jobTitle: z.string().trim().max(120, 'Le poste est trop long.').optional(),
  avatar: z
    .string()
    .trim()
    .url({ message: 'URL d’avatar invalide.' })
    .optional()
    .or(z.literal('')),
});

/** Aplatit l'utilisateur courant en valeurs de formulaire. */
export const toProfileFormValues = (user = {}) => ({
  firstName: user.firstName ?? '',
  lastName: user.lastName ?? '',
  phone: user.phone ?? '',
  jobTitle: user.jobTitle ?? '',
  avatar: user.avatar ?? '',
});

/** Reconstruit le payload métier (champs vides → undefined). */
export const toProfilePayload = (values) => ({
  firstName: values.firstName,
  lastName: values.lastName,
  phone: values.phone || undefined,
  jobTitle: values.jobTitle || undefined,
  avatar: values.avatar || null,
});
