/**
 * Navix Auth — Schémas de validation Zod pour l'inscription.
 * --------------------------------------------------------------------------
 * Trois variantes : client, chauffeur, partenaire (station).
 * Chaque schéma partage les champs communs (nom, prénom, email, mot de passe,
 * confirmation) et ajoute des champs spécifiques au rôle.
 */
import { z } from 'zod';
import { emailSchema } from './common';

const PASSWORD_MIN_LENGTH = 8;

const sharedFields = {
  firstName: z
    .string()
    .trim()
    .min(1, 'Le prénom est requis.')
    .max(100, 'Le prénom ne doit pas dépasser 100 caractères.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Le nom est requis.')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères.'),
  email: emailSchema,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`)
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule.')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre.'),
  confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise.'),
};

const passwordRefine = (schema) =>
  schema.refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

export const registerClientSchema = passwordRefine(
  z.object({
    ...sharedFields,
    companyName: z
      .string()
      .trim()
      .min(1, "Le nom de l'entreprise est requis.")
      .max(200, "Le nom ne doit pas dépasser 200 caractères."),
    sector: z.string().trim().min(1, 'Le secteur dactivité est requis.'),
    city: z.string().trim().min(1, 'La ville est requise.'),
    country: z.string().trim().min(1, 'Le pays est requis.'),
  }),
);

export const registerDriverSchema = passwordRefine(
  z.object({
    ...sharedFields,
    city: z.string().trim().min(1, 'La ville est requise.'),
    country: z.string().trim().min(1, 'Le pays est requis.'),
  }),
);

export const registerPartnerSchema = passwordRefine(
  z.object({
    ...sharedFields,
    companyName: z
      .string()
      .trim()
      .min(1, "Le nom de la station est requis.")
      .max(200, "Le nom ne doit pas dépasser 200 caractères."),
    partnerType: z.string().min(1, 'Le type de partenaire est requis.'),
    city: z.string().trim().min(1, 'La ville est requise.'),
    country: z.string().trim().min(1, 'Le pays est requis.'),
  }),
);

export const registerClientDefaults = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  sector: '',
  city: '',
  country: 'Cameroun',
};

export const registerDriverDefaults = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  city: '',
  country: 'Cameroun',
};

export const registerPartnerDefaults = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  partnerType: '',
  city: '',
  country: 'Cameroun',
};
