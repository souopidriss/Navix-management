import { z } from 'zod';
import {
  DOCUMENT_VISIBILITY,
  ASSOCIATION_TYPES,
} from './index.js';

export const createFileTypeSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis.').max(100),
  description: z.string().trim().optional().default(''),
  extensions: z.array(z.string().trim().regex(/^\.[a-z0-9]{1,10}$/, 'Extension invalide.')).min(1, 'Ajoutez au moins une extension.'),
  mimeTypes: z.array(z.string().trim()).optional().default([]),
  maxSize: z.number().int().positive('La taille maximale doit être positive.').max(1073741824, 'Taille maximale : 1 Go.'),
  isActive: z.boolean().optional().default(true),
});

export const updateFileTypeSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().optional(),
  extensions: z.array(z.string().trim().regex(/^\.[a-z0-9]{1,10}$/)).min(1).optional(),
  mimeTypes: z.array(z.string().trim()).optional(),
  maxSize: z.number().int().positive().max(1073741824).optional(),
  isActive: z.boolean().optional(),
});

export const fileTypeIdParamSchema = z.object({
  id: z.string().trim().min(1, 'ID requis.'),
});

export const createDocumentSchema = z.object({
  companyId: z.string().trim().min(1, 'L\'entreprise est requise.'),
  fileTypeId: z.string().trim().min(1, 'Le type de fichier est requis.'),
  name: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  visibility: z.enum(DOCUMENT_VISIBILITY, { errorMap: () => ({ message: 'Visibilité invalide.' }) }).default('private'),
  associationType: z.enum([...ASSOCIATION_TYPES, '']).optional().default(''),
  associationId: z.string().trim().optional().default(''),
  category: z.string().trim().optional().default(''),
});

export const updateDocumentSchema = z.object({
  fileTypeId: z.string().trim().optional(),
  name: z.string().trim().optional(),
  description: z.string().trim().optional(),
  visibility: z.enum(DOCUMENT_VISIBILITY).optional(),
  associationType: z.enum(ASSOCIATION_TYPES).optional(),
  associationId: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

export const documentIdParamSchema = z.object({
  id: z.string().trim().min(1, 'ID requis.'),
});

export const documentQuerySchema = z.object({
  sort: z.enum(['created_at', 'name', 'size', 'extension', 'updated_at']).default('created_at'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
  companyScopeId: z.string().trim().optional(),
  fileTypeId: z.string().trim().optional(),
  associationType: z.string().trim().optional(),
  visibility: z.enum(DOCUMENT_VISIBILITY).optional(),
  extension: z.string().trim().optional(),
  search: z.string().trim().optional(),
});
