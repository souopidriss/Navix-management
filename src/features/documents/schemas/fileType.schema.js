/**
 * Navix Documents — Schéma Zod des types de fichiers
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Champs : titre
 * unique, description, extensions (au moins une, sous forme de tableau
 * normalisé), types MIME (facultatifs), taille maximale (octets) et statut
 * actif. Le service applique en plus les règles métier (unicité du titre,
 * suppression verrouillée si le type est utilisé).
 */
import { z } from 'zod';

const toExtension = (value) => {
  const normalized = String(value).trim().toLowerCase();
  return normalized.startsWith('.') ? normalized : `.${normalized}`;
};

const toMime = (value) => String(value).trim().toLowerCase();

export const fileTypeSchema = z
  .object({
    title: z.string().trim().min(1, 'Le titre est requis.'),
    description: z.string().trim().optional(),
    extensions: z
      .array(z.string().trim().min(1))
      .min(1, 'Ajoutez au moins une extension (ex. .pdf).'),
    mimeTypes: z.array(z.string().trim()).optional(),
    maxSize: z
      .number()
      .int('La taille maximale doit être un entier.')
      .positive('La taille maximale doit être supérieure à 0.')
      .max(1024 * 1024 * 1024, 'La taille maximale ne peut pas dépasser 1 Go.'),
    isActive: z.boolean(),
  })
  .superRefine((values, context) => {
    values.extensions.forEach((extension, index) => {
      if (!/^\.[a-z0-9]{1,10}$/.test(toExtension(extension))) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['extensions', index],
          message: `« ${extension} » n’est pas une extension valide (ex. .pdf).`,
        });
      }
    });
  });

export const fileTypeDefaultValues = {
  title: '',
  description: '',
  extensions: [],
  mimeTypes: [],
  maxSize: 10 * 1024 * 1024,
  isActive: true,
};

/** Aplatit le modèle métier en valeurs de formulaire (création / édition). */
export const toFileTypeFormValues = (fileType = {}) => ({
  title: fileType.title ?? '',
  description: fileType.description ?? '',
  extensions: Array.isArray(fileType.extensions) ? fileType.extensions : [],
  mimeTypes: Array.isArray(fileType.mimeTypes) ? fileType.mimeTypes : [],
  maxSize: Number(fileType.maxSize) || 10 * 1024 * 1024,
  isActive: fileType.isActive !== false,
});

/** Reconstruit le payload métier à partir des valeurs du formulaire. */
export const toFileTypePayload = (values) => ({
  title: values.title,
  description: values.description || '',
  extensions: values.extensions.map(toExtension),
  mimeTypes: (values.mimeTypes || []).map(toMime).filter(Boolean),
  maxSize: Number(values.maxSize),
  isActive: values.isActive,
});
