/**
 * Navix Partner Portal — Schéma de validation Zod du formulaire Mission Partenaire
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate, cf. useZodForm).
 * Champs du formulaire PROMPT 064 : Titre, Type de prestation, Statut,
 * Client (nom/contact/téléphone), Véhicule (marque/modèle/immatriculation),
 * Chauffeur, Trajet (départ/destination/distance), Dates (début/fin),
 * Montant FCFA et notes. Les dates sont saisies via <input type="date">
 * (format 'yyyy-mm-dd') ; la date de fin doit être postérieure à la date de
 * début (validation croisée). Montant exclusivement en FCFA (XAF).
 */
import { z } from 'zod';
import {
  PARTNER_MISSION_TYPE_VALUES,
  PARTNER_MISSION_STATUS_VALUES,
} from '../constants/partner.constants';

const optionalText = z.string().trim().optional();

const requiredText = (message) => z.string().trim().min(1, message);

export const partnerMissionSchema = z
  .object({
    title: requiredText('Le titre de la mission est requis.'),
    type: z.enum(PARTNER_MISSION_TYPE_VALUES, { errorMap: () => ({ message: 'Type de prestation invalide.' }) }),
    status: z.enum(PARTNER_MISSION_STATUS_VALUES, { errorMap: () => ({ message: 'Statut invalide.' }) }),
    client: requiredText('Le client est requis.'),
    clientContact: optionalText,
    clientPhone: optionalText,
    vehicleBrand: requiredText('La marque du véhicule est requise.'),
    vehicleModel: requiredText('Le modèle du véhicule est requis.'),
    registrationNumber: optionalText,
    driver: requiredText('Le nom du chauffeur est requis.'),
    departure: requiredText('Le lieu de départ est requis.'),
    destination: requiredText('La destination est requise.'),
    distanceKm: z.coerce
      .number({ invalid_type_error: 'Distance invalide.' })
      .int('Distance invalide.')
      .min(0, 'La distance doit être positive ou nulle.'),
    startDate: requiredText('La date de début est requise.').refine(
      (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
      'Date de début invalide.',
    ),
    endDate: requiredText('La date de fin est requise.').refine(
      (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
      'Date de fin invalide.',
    ),
    amount: z.coerce
      .number({ invalid_type_error: 'Montant invalide.' })
      .min(0, 'Le montant doit être positif ou nul.'),
    notes: optionalText,
  })
  .superRefine((values, context) => {
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'La date de fin doit être postérieure ou égale à la date de début.',
      });
    }
  });

export const partnerMissionDefaultValues = {
  title: '',
  type: '',
  status: 'scheduled',
  client: '',
  clientContact: '',
  clientPhone: '',
  vehicleBrand: '',
  vehicleModel: '',
  registrationNumber: '',
  driver: '',
  departure: '',
  destination: '',
  distanceKm: 0,
  startDate: '',
  endDate: '',
  amount: 0,
  notes: '',
};

/**
 * Aplatit le modèle métier en valeurs de formulaire.
 * @param {object} mission
 * @returns {object}
 */
export const toPartnerMissionFormValues = (mission = {}) => ({
  title: mission.title ?? '',
  type: mission.type ?? '',
  status: mission.status ?? 'scheduled',
  client: mission.client ?? '',
  clientContact: mission.clientContact ?? '',
  clientPhone: mission.clientPhone ?? '',
  vehicleBrand: mission.vehicleBrand ?? '',
  vehicleModel: mission.vehicleModel ?? '',
  registrationNumber: mission.registrationNumber ?? '',
  driver: mission.driver ?? '',
  departure: mission.departure ?? '',
  destination: mission.destination ?? '',
  distanceKm: mission.distanceKm ?? 0,
  startDate: mission.startDate ?? '',
  endDate: mission.endDate ?? '',
  amount: mission.amount ?? 0,
  notes: mission.notes ?? '',
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toPartnerMissionPayload = (values) => ({
  title: values.title,
  type: values.type,
  status: values.status,
  client: values.client,
  clientContact: values.clientContact || undefined,
  clientPhone: values.clientPhone || undefined,
  vehicleBrand: values.vehicleBrand,
  vehicleModel: values.vehicleModel,
  registrationNumber: values.registrationNumber || undefined,
  driver: values.driver,
  departure: values.departure,
  destination: values.destination,
  distanceKm: Number(values.distanceKm) || 0,
  startDate: values.startDate,
  endDate: values.endDate,
  amount: Number(values.amount) || 0,
  notes: values.notes || undefined,
});
