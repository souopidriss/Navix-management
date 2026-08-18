/**
 * Navix Partner Portal — Schéma de validation Zod du formulaire Client Partenaire
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate, cf. useZodForm).
 * Champs du formulaire PROMPT 065 : Type (Entreprise / Particulier),
 * Nom / raison sociale, Email, Téléphone, Adresse, Ville, Pays,
 * Contact principal et Notes.
 *
 * Règles :
 *   - nom requis ;
 *   - type requis (enum) ;
 *   - ville requise ;
 *   - email valide si renseigné (format standard) ;
 *   - téléphone valide si renseigné (international / Cameroun +237) ;
 *   - pays / adresse / contact principal / notes optionnels.
 */
import { z } from 'zod';
import { PARTNER_CLIENT_TYPE_VALUES } from '../constants/partner.constants';

const optionalText = z.string().trim().optional();

const requiredText = (message) => z.string().trim().min(1, message);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_RE = /^\+?[0-9 ]{8,20}$/;

export const partnerClientSchema = z.object({
  type: z.enum(PARTNER_CLIENT_TYPE_VALUES, { errorMap: () => ({ message: 'Le type de client est requis.' }) }),
  name: requiredText('Le nom / raison sociale est requis.'),
  email: optionalText.refine((value) => value === undefined || value === '' || EMAIL_RE.test(value), {
    message: "L’adresse email n’est pas valide.",
  }),
  phone: optionalText.refine((value) => value === undefined || value === '' || PHONE_RE.test(value), {
    message: 'Le numéro de téléphone n’est pas valide.',
  }),
  address: optionalText,
  city: requiredText('La ville est requise.'),
  country: optionalText,
  contactName: optionalText,
  notes: optionalText,
});

export const partnerClientDefaultValues = {
  type: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Cameroun',
  contactName: '',
  notes: '',
};

/**
 * Aplatit le modèle métier en valeurs de formulaire.
 * @param {object} client
 * @returns {object}
 */
export const toPartnerClientFormValues = (client = {}) => ({
  type: client.type ?? '',
  name: client.name ?? '',
  email: client.email ?? '',
  phone: client.phone ?? '',
  address: client.address ?? '',
  city: client.city ?? '',
  country: client.country ?? 'Cameroun',
  contactName: client.contactName ?? client.contact ?? '',
  notes: client.notes ?? '',
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toPartnerClientPayload = (values) => ({
  type: values.type,
  name: values.name,
  email: values.email?.trim() || undefined,
  phone: values.phone?.trim() || undefined,
  address: values.address?.trim() || undefined,
  city: values.city,
  country: values.country?.trim() || 'Cameroun',
  contactName: values.contactName?.trim() || undefined,
  notes: values.notes?.trim() || undefined,
});
