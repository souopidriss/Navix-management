/**
 * Navix Documents — Schémas de validation Zod des documents
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate). Champs obligatoires :
 * entreprise, type de fichier, visibilité et au moins un fichier en attente
 * de téléversement. L'association (ressource) et la catégorie documentaire
 * sont optionnelles mais validées (valeurs d'énumérations métier). Chaque
 * fichier local est validé (nom, extension, taille ≤ 50 Mo par défaut) — les
 * types MIME et tailles par type sont ensuite vérifiés par le service.
 *
 * Le formulaire métier est embarqué dans le FormModal générique de la
 * bibliothèque core — le Core ne connaît aucun métier.
 */
import { z } from 'zod';
import {
  ASSOCIATION_TYPE_VALUES,
  DOCUMENT_TYPE_VALUES,
  DOCUMENT_TYPES,
  DOCUMENT_VISIBILITY_VALUES,
  MAX_DEFAULT_UPLOAD_SIZE,
} from '../constants';

const SUPPORTED_EXTENSIONS = DOCUMENT_TYPE_VALUES.flatMap((key) => DOCUMENT_TYPES[key].extensions);

/** Extension d'un nom de fichier (avec point, en minuscules). */
export const getFileExtension = (fileName = '') => {
  const match = String(fileName).toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match ? match[1] : '';
};

const pendingFile = z.object({
  name: z.string().trim().min(1, 'Nom de fichier invalide.'),
  size: z.number().min(0, 'Taille de fichier invalide.').optional(),
  type: z.string().optional(),
  lastModified: z.number().optional(),
});

const documentFields = z.object({
  companyId: z.string().trim().min(1, 'L’entreprise est requise.'),
  fileTypeId: z.string().trim().min(1, 'Le type de fichier est requis.'),
  description: z.string().trim().optional(),
  visibility: z.enum(DOCUMENT_VISIBILITY_VALUES, {
    errorMap: () => ({ message: 'Visibilité invalide.' }),
  }),
  associationType: z
    .enum(ASSOCIATION_TYPE_VALUES, {
      errorMap: () => ({ message: 'Type d’association invalide.' }),
    })
    .optional()
    .or(z.literal('')),
  associationId: z.string().trim().optional(),
  category: z.string().trim().optional(),
  files: z.array(pendingFile).min(1, 'Ajoutez au moins un fichier.'),
});

/**
 * Construit le schéma de création avec validation par type de fichier.
 * `fileTypes` (liste du store Documents) permet de résoudre l'identifiant
 * du type sélectionné (`fileTypeId`) vers ses extensions et sa taille
 * maximales — `DOCUMENT_TYPES[fileTypeId]` ne peut pas être utilisé car
 * `fileTypeId` est l'id d'un FileType (ULID), pas une clé métier.
 */
export const createDocumentSchema = (fileTypes = []) =>
  documentFields.superRefine((values, context) => {
    if (values.files.length === 0) return;

    const fileType = fileTypes.find((candidate) => candidate.id === values.fileTypeId);
    const allowed = fileType?.extensions?.length ? fileType.extensions : SUPPORTED_EXTENSIONS;
    const maxSize = fileType?.maxSize || MAX_DEFAULT_UPLOAD_SIZE;

    values.files.forEach((file, index) => {
      const extension = getFileExtension(file.name);
      const tooBig = Number(file.size || 0) > maxSize;

      if (extension && !allowed.includes(extension)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['files', index],
          message: `Extension « ${extension} » non autorisée pour ce type de fichier.`,
        });
      }
      if (tooBig) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['files', index],
          message: `« ${file.name} » dépasse la taille maximale autorisée.`,
        });
      }
    });
  });

/**
 * Schéma de création par défaut (validation globale tant que la liste des
 * types de fichiers n'est pas chargée). Les pages utilisent
 * `createDocumentSchema(fileTypes)` une fois la liste disponible.
 */
export const documentSchema = createDocumentSchema();

/**
 * Schéma d'édition : mêmes champs que la création, sans l'exigence de
 * fichiers (les métadonnées d'un document existant sont modifiées sans
 * re-téléversement du fichier physique).
 */
export const documentEditSchema = documentFields.omit({ files: true });

export const documentDefaultValues = {
  companyId: '',
  fileTypeId: '',
  description: '',
  visibility: 'private',
  associationType: '',
  associationId: '',
  category: '',
  files: [],
};

/** Aplatit le modèle métier en valeurs de formulaire (création / édition). */
export const toDocumentFormValues = (document = {}) => ({
  companyId: document.companyId ?? '',
  fileTypeId: document.fileTypeId ?? '',
  description: document.description ?? '',
  visibility: document.visibility ?? 'private',
  associationType: document.associationType ?? '',
  associationId: document.associationId ?? '',
  category: document.category ?? '',
  files: Array.isArray(document.files) ? document.files : [],
});

/**
 * Reconstruit le payload métier à partir des valeurs du formulaire.
 * `files` (fichiers locaux) est transmis séparément au service de
 * téléversement ; la catégorie n'est conservée que si une association
 * est sélectionnée.
 */
export const toDocumentPayload = (values) => ({
  companyId: values.companyId,
  fileTypeId: values.fileTypeId,
  description: values.description || '',
  visibility: values.visibility,
  associationType: values.associationType || '',
  associationId: values.associationId || '',
  category: values.associationType ? values.category || 'autre' : '',
});
