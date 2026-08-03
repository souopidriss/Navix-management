/**
 * Navix Companies — Schéma de validation Zod du formulaire Entreprise
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Les champs du
 * propriétaire sont aplatis dans le formulaire (ownerName / ownerEmail)
 * puis reconstruits en objet `owner` à la soumission.
 * Le contrôle d'unicité du code est simulé côté formulaire (compare avec
 * les entreprises déjà chargées) — aucune requête serveur.
 */
import { z } from 'zod';
import { emailSchema } from '@/features/auth';
import {
  COMPANY_STATUS_VALUES,
  SUBSCRIPTION_PLAN_VALUES,
  SUBSCRIPTION_STATUS_VALUES,
} from '../constants';

const optionalUrl = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().url().safeParse(value).success, message);

const optionalPhone = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^[0-9+()\-. ]{6,20}$/.test(value), message);

export const companySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom de l’entreprise est requis.')
    .min(2, 'Le nom doit contenir au moins 2 caractères.'),
  code: z
    .string()
    .trim()
    .min(1, 'Le code est requis.')
    .max(12, 'Le code ne doit pas dépasser 12 caractères.')
    .regex(/^[A-Za-z0-9-]+$/, 'Le code ne peut contenir que des lettres, chiffres et tirets.'),
  email: emailSchema,
  phone: optionalPhone('Numéro de téléphone invalide.'),
  website: optionalUrl('Adresse du site web invalide.'),
  logo: optionalUrl('URL du logo invalide.'),
  country: z.string().trim().min(1, 'Le pays est requis.'),
  city: z.string().trim().min(1, 'La ville est requise.'),
  address: z.string().trim().optional(),
  status: z.enum(COMPANY_STATUS_VALUES, { errorMap: () => ({ message: 'Statut invalide.' }) }),
  subscriptionPlan: z.enum(SUBSCRIPTION_PLAN_VALUES, { errorMap: () => ({ message: 'Plan d’abonnement invalide.' }) }),
  subscriptionStatus: z.enum(SUBSCRIPTION_STATUS_VALUES, { errorMap: () => ({ message: 'Statut d’abonnement invalide.' }) }),
  ownerName: z.string().trim().min(1, 'Le nom du propriétaire est requis.'),
  ownerEmail: emailSchema,
});

export const companyDefaultValues = {
  name: '',
  code: '',
  email: '',
  phone: '',
  website: '',
  logo: '',
  country: '',
  city: '',
  address: '',
  status: 'active',
  subscriptionPlan: 'essentials',
  subscriptionStatus: 'active',
  ownerName: '',
  ownerEmail: '',
};

/**
 * Aplatit le modèle métier (owner imbriqué) en valeurs de formulaire.
 * @param {object} company
 * @returns {object}
 */
export const toCompanyFormValues = (company = {}) => ({
  name: company.name ?? '',
  code: company.code ?? '',
  email: company.email ?? '',
  phone: company.phone ?? '',
  website: company.website ?? '',
  logo: company.logo ?? '',
  country: company.country ?? '',
  city: company.city ?? '',
  address: company.address ?? '',
  status: company.status ?? 'active',
  subscriptionPlan: company.subscriptionPlan ?? 'essentials',
  subscriptionStatus: company.subscriptionStatus ?? 'active',
  ownerName: company.owner?.name ?? '',
  ownerEmail: company.owner?.email ?? '',
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * @param {object} values — valeurs aplaties du formulaire
 * @returns {object}
 */
export const toCompanyPayload = (values) => ({
  name: values.name,
  code: values.code,
  email: values.email,
  phone: values.phone,
  website: values.website,
  logo: values.logo,
  country: values.country,
  city: values.city,
  address: values.address,
  status: values.status,
  subscriptionPlan: values.subscriptionPlan,
  subscriptionStatus: values.subscriptionStatus,
  owner: {
    name: values.ownerName,
    email: values.ownerEmail,
  },
});
