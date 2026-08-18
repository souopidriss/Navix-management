/**
 * Navix Driver Portal — Schémas de validation (Zod)
 * --------------------------------------------------------------------------
 * Validation côté formulaire de l'Espace Chauffeur : démarrage / clôture de
 * trajet (kilométrage), signalement d'incident. Les règles métier applicables
 * uniquement côté service (statut, appartenance, RBAC) restent dans le service.
 * 100 % Cameroun (lieux) et FCFA.
 */
import { z } from 'zod';
import {
  INCIDENT_TYPE_VALUES,
  INCIDENT_SEVERITY_VALUES,
} from '../constants/driver.constants';

/** Nombre entier strictement positif (kilométrage). */
const positiveInt = (message) =>
  z.coerce
    .number({ invalid_type_error: 'Veuillez saisir un nombre valide.' })
    .int('Le kilométrage doit être un nombre entier.')
    .positive(message || 'Le kilométrage doit être supérieur à 0.');

export const startTripSchema = z.object({
  tripId: z.string().min(1, 'Trajet invalide.'),
  departureMileage: positiveInt('Le kilométrage de départ doit être supérieur à 0.'),
});

export const completeTripSchema = z
  .object({
    tripId: z.string().min(1, 'Trajet invalide.'),
    departureMileage: z.coerce.number().optional(),
    arrivalMileage: positiveInt('Le kilométrage d\u2019arrivée doit être supérieur à 0.'),
  })
  .refine(
    (data) => {
      if (!data.departureMileage) return true;
      return Number(data.arrivalMileage) >= Number(data.departureMileage);
    },
    {
      message: 'Le kilométrage final doit être supérieur ou égal au kilométrage de départ.',
      path: ['arrivalMileage'],
    },
  );

export const incidentSchema = z.object({
  tripId: z.string().optional(),
  type: z.enum(INCIDENT_TYPE_VALUES, { message: 'Type d\u2019incident invalide.' }),
  severity: z.enum(INCIDENT_SEVERITY_VALUES, { message: 'Sévérité invalide.' }),
  date: z.string().min(1, 'La date est requise.'),
  time: z.string().optional(),
  location: z.string().trim().min(3, 'Le lieu est requis (3 caractères minimum).'),
  description: z.string().trim().min(10, 'Décrivez l\u2019incident (10 caractères minimum).'),
});

/** Extraits les erreurs Zod en un objet { champ: message } (1er message par champ). */
export const collectFieldErrors = (result) => {
  const fieldErrors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (field !== undefined && fieldErrors[field] === undefined) {
      fieldErrors[field] = issue.message;
    }
  });
  return fieldErrors;
};
