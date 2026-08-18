/**
 * Navix Auth — Schéma email réutilisé par tous les formulaires d'authentification.
 * Validation exclusive Zod (aucune validation HTML5, form noValidate).
 */
import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .min(1, "L'adresse email est requise.")
  .email('Adresse email invalide.')
  .transform((e) => e.toLowerCase());
