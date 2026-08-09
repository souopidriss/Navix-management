/**
 * Navix Partners — Schémas de validation Zod des partenaires
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Champs obligatoires :
 * entreprise, nom, type et statut. Les coordonnées (email, téléphone, site
 * web) sont optionnelles mais validées si renseignées.
 */

import { z } from 'zod';
import { PARTNER_TYPE_VALUES, PARTNER_STATUS_VALUES } from '../constants';

const optionalEmail = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().email().safeParse(value).success, message);

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

export const partnerSchema = z.object({
  companyId: z.string().trim().min(1, 'L’entreprise est requise.'),
  name: z
    .string()
    .trim()
    .min(1, 'Le nom du partenaire est requis.')
    .min(2, 'Le nom doit contenir au moins 2 caractères.'),
  type: z.enum(PARTNER_TYPE_VALUES, {
    errorMap: () => ({ message: 'Type de partenaire invalide.' }),
  }),
  status: z.enum(PARTNER_STATUS_VALUES, {
    errorMap: () => ({ message: 'Statut invalide.' }),
  }),
  contactName: z.string().trim().optional(),
  email: optionalEmail('Adresse email invalide.'),
  phone: optionalPhone('Numéro de téléphone invalide.'),
  website: optionalUrl('Adresse du site web invalide.'),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  country: z.string().trim().optional(),
  taxId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const partnerDefaultValues = {
  companyId: '',
  name: '',
  type: '',
  status: 'active',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  country: '',
  taxId: '',
  notes: '',
};

/** Aplatit le modèle métier en valeurs de formulaire (création / édition). */
export const toPartnerFormValues = (partner = {}) => ({
  companyId: partner.companyId ?? '',
  name: partner.name ?? '',
  type: partner.type ?? '',
  status: partner.status ?? 'active',
  contactName: partner.contactName ?? '',
  email: partner.email ?? '',
  phone: partner.phone ?? '',
  website: partner.website ?? '',
  address: partner.address ?? '',
  city: partner.city ?? '',
  country: partner.country ?? '',
  taxId: partner.taxId ?? '',
  notes: partner.notes ?? '',
});

/** Reconstruit le payload métier à partir des valeurs du formulaire. */
export const toPartnerPayload = (values) => ({
  companyId: values.companyId,
  name: values.name,
  type: values.type,
  status: values.status,
  contactName: values.contactName || '',
  email: values.email || '',
  phone: values.phone || '',
  website: values.website || '',
  address: values.address || '',
  city: values.city || '',
  country: values.country || '',
  taxId: values.taxId || '',
  notes: values.notes || '',
});
