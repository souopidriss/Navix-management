/**
 * Navix Vitrine — Schéma de validation du formulaire de contact.
 * Validation Zod exclusive (pas de validation HTML5).
 */
import { z } from 'zod';

const FLEET_SIZES = ['1-10', '11-50', '51-100', '101-500', '500+'];

const SUBJECTS = [
  'Demande de démonstration',
  'Informations sur la plateforme',
  'Tarification',
  'Support',
  'Partenariat',
  'Autre',
];

export const contactSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(1, 'Veuillez saisir votre nom.'),
  email: z
    .string()
    .trim()
    .min(1, 'L\u2019adresse email est requise.')
    .email('Veuillez saisir une adresse email valide.'),
  telephone: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  entreprise: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  tailleFlotte: z
    .enum(FLEET_SIZES, {
      errorMap: () => ({ message: 'Veuillez sélectionner une taille de flotte valide.' }),
    })
    .optional()
    .or(z.literal('')),
  sujet: z
    .string()
    .min(1, 'Veuillez sélectionner un sujet.'),
  message: z
    .string()
    .trim()
    .min(1, 'Votre message est obligatoire.'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter le traitement de vos données.' }),
  }),
});

export const contactDefaultValues = {
  nom: '',
  email: '',
  telephone: '',
  entreprise: '',
  tailleFlotte: '',
  sujet: '',
  message: '',
  consent: false,
};

export { FLEET_SIZES, SUBJECTS };
