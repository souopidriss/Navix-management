/**
 * Navix Partner Portal — Schéma de validation Zod des Documents Partenaire (PROMPT 066)
 * --------------------------------------------------------------------------
 * Validation exclusive Zod (formulaires en noValidate, cf. useZodForm).
 * Champs du formulaire PROMPT 066 : Fichier, Type de document, Entité liée,
 * Description, Référence, Date d'émission, Date d'expiration.
 *   - le fichier est obligatoire en création, optionnel en édition ;
 *   - l'extension doit figurer dans DOCUMENT_TYPES (pdf/png/jpg/jpeg/webp/
 *     doc/docx/xls/xlsx/csv/txt/zip) et la taille respecter le max du type ;
 *   - l'entité liée est obligatoire pour les types liés (véhicule/client/
 *     mission), facultative pour les documents d'entreprise ;
 *   - la date d'expiration doit être postérieure à la date d'émission.
 * Le `companyId` / `partnerId` ne sont jamais des champs de formulaire :
 * ils sont toujours appliqués côté service (isolation multi-tenant).
 */
import { z } from 'zod';
import { getDocumentTypeByExtension } from '@/features/documents/constants';
import { getFileExtension } from '@/features/documents/schemas/document.schema';
import {
  PARTNER_DOCUMENT_CATEGORY_VALUES,
  PARTNER_DOCUMENT_ENTITY_VALUES,
} from '../constants/partner.constants';

const optionalDate = (message) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), message);

/** Construction du schéma (le fichier est requis en création uniquement). */
export const buildPartnerDocumentSchema = ({ requireFile = true } = {}) =>
  z
    .object({
      file: requireFile
        ? z
            .object({
              name: z.string().min(1, 'Le fichier est obligatoire.'),
              size: z.number().positive('Le fichier est obligatoire.'),
              type: z.string().optional(),
            })
            .nullable()
            .refine((file) => file !== null, 'Le fichier est obligatoire.')
        : z.any().nullable().optional(),
      category: z.enum(PARTNER_DOCUMENT_CATEGORY_VALUES, {
        errorMap: () => ({ message: 'Type de document invalide.' }),
      }),
      entityType: z.enum(PARTNER_DOCUMENT_ENTITY_VALUES, {
        errorMap: () => ({ message: "Type d'entité invalide." }),
      }),
      entityRef: z.string().trim().max(80, "L'entité liée est trop longue."),
      description: z.string().trim().max(500, 'La description est trop longue (500 caractères max).'),
      reference: z.string().trim().max(60, 'La référence est trop longue (60 caractères max).'),
      issuedAt: optionalDate("Date d'émission invalide."),
      expiresAt: optionalDate("Date d'expiration invalide."),
    })
    .superRefine((values, context) => {
      if (values.entityType && values.entityType !== 'company' && !values.entityRef) {
        context.addIssue({
          path: ['entityRef'],
          message: "L'entité liée est obligatoire pour ce type de document.",
        });
      }
      if (values.issuedAt && values.expiresAt && values.expiresAt < values.issuedAt) {
        context.addIssue({
          path: ['expiresAt'],
          message: "La date d'expiration doit être postérieure à la date d'émission.",
        });
      }
      if (values.file) {
        const extension = getFileExtension(values.file.name);
        const meta = getDocumentTypeByExtension(extension);
        if (!meta) {
          context.addIssue({
            path: ['file'],
            message: 'Format de fichier non pris en charge (PDF, image, DOC/DOCX, XLS/XLSX, CSV, TXT ou ZIP).',
          });
        } else if (meta.maxSize && values.file.size > meta.maxSize) {
          context.addIssue({
            path: ['file'],
            message: `Fichier trop volumineux pour un ${meta.label} (taille maximale : ${meta.maxSize / (1024 * 1024)} Mo).`,
          });
        }
      }
    });

/** Schéma de création (fichier obligatoire). */
export const partnerDocumentCreateSchema = buildPartnerDocumentSchema({ requireFile: true });

/** Schéma d'édition (fichier conservé tel quel, optionnel). */
export const partnerDocumentUpdateSchema = buildPartnerDocumentSchema({ requireFile: false });

export const partnerDocumentDefaultValues = {
  file: null,
  category: '',
  entityType: '',
  entityRef: '',
  description: '',
  reference: '',
  issuedAt: '',
  expiresAt: '',
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

/**
 * Aplatit le modèle métier en valeurs de formulaire.
 * @param {object} document
 * @returns {object}
 */
export const toPartnerDocumentFormValues = (document = {}) => ({
  category: document.category ?? '',
  entityType: document.entityType ?? '',
  entityRef: document.entityType === 'company' ? '' : (document.entityLabel ?? ''),
  description: document.description ?? '',
  reference: document.reference ?? '',
  issuedAt: toDateInput(document.issuedAt),
  expiresAt: toDateInput(document.expiresAt),
});

/**
 * Reconstruit le payload de création à partir des valeurs du formulaire
 * et du fichier sélectionné. Le fichier n'est jamais uploadé (pas de
 * backend) : seules ses métadonnées sont transmises au service.
 * @param {object} values — valeurs du formulaire
 * @param {{ name: string, size: number, type?: string }|null} file — fichier sélectionné
 * @returns {object}
 */
export const toPartnerDocumentPayload = (values, file) => ({
  file,
  name: file?.name ?? '',
  reference: values.reference || undefined,
  category: values.category,
  entityType: values.entityType,
  entityId: values.entityType === 'company' ? undefined : values.entityRef,
  entityLabel: values.entityType === 'company' ? undefined : values.entityRef,
  description: values.description || undefined,
  issuedAt: values.issuedAt ? new Date(`${values.issuedAt}T00:00:00`).toISOString() : undefined,
  expiresAt: values.expiresAt ? new Date(`${values.expiresAt}T23:59:59`).toISOString() : undefined,
});

/**
 * Reconstruit le payload de mise à jour à partir des valeurs du formulaire.
 * Le fichier n'est pas modifié en édition (seule la fiche métadonnées).
 * @param {object} values — valeurs du formulaire
 * @returns {object}
 */
export const toPartnerDocumentUpdatePayload = (values) => ({
  reference: values.reference || undefined,
  category: values.category,
  entityType: values.entityType,
  entityId: values.entityType === 'company' ? undefined : values.entityRef,
  entityLabel: values.entityType === 'company' ? undefined : values.entityRef,
  description: values.description || undefined,
  issuedAt: values.issuedAt ? new Date(`${values.issuedAt}T00:00:00`).toISOString() : undefined,
  expiresAt: values.expiresAt ? new Date(`${values.expiresAt}T23:59:59`).toISOString() : undefined,
});
