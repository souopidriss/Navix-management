import fileTypeRepository from '../repositories/FileTypeRepository.js';
import { NotFoundError, ConflictError } from '../errors/index.js';

function formatFileTypeResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    extensions: typeof row.extensions === 'string' ? JSON.parse(row.extensions) : (row.extensions || []),
    mimeTypes: typeof row.mime_types === 'string' ? JSON.parse(row.mime_types) : (row.mime_types || []),
    maxSize: Number(row.max_size),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listFileTypes() {
  const { rows } = await fileTypeRepository.findAll();
  return rows.map(formatFileTypeResponse);
}

export async function getFileTypeById(id) {
  const row = await fileTypeRepository.findById(id);
  if (!row) throw new NotFoundError('Type de fichier');
  return formatFileTypeResponse(row);
}

export async function createFileType(data) {
  const existing = await fileTypeRepository.findByTitle(data.title);
  if (existing) {
    throw new ConflictError(`Un type de fichier "${data.title}" existe déjà.`);
  }

  const record = await fileTypeRepository.create({
    title: data.title,
    description: data.description || '',
    extensions: JSON.stringify(data.extensions),
    mime_types: JSON.stringify(data.mimeTypes || []),
    max_size: data.maxSize,
    is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
  });

  return formatFileTypeResponse(record);
}

export async function updateFileType(id, data) {
  const existing = await fileTypeRepository.findById(id);
  if (!existing) throw new NotFoundError('Type de fichier');

  if (data.title) {
    const duplicate = await fileTypeRepository.findByTitleExcludeId(data.title, id);
    if (duplicate) {
      throw new ConflictError(`Un type de fichier "${data.title}" existe déjà.`);
    }
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description || '';
  if (data.extensions !== undefined) updateData.extensions = JSON.stringify(data.extensions);
  if (data.mimeTypes !== undefined) updateData.mime_types = JSON.stringify(data.mimeTypes || []);
  if (data.maxSize !== undefined) updateData.max_size = data.maxSize;
  if (data.isActive !== undefined) updateData.is_active = data.isActive ? 1 : 0;

  await fileTypeRepository.update(id, updateData);

  const updated = await fileTypeRepository.findById(id);
  return formatFileTypeResponse(updated);
}

export async function deleteFileType(id) {
  const existing = await fileTypeRepository.findById(id);
  if (!existing) throw new NotFoundError('Type de fichier');

  const docCount = await fileTypeRepository.countDocuments(id);
  if (docCount > 0) {
    const err = new ConflictError('Ce type de fichier est utilisé par des documents et ne peut pas être supprimé.');
    err.code = 'FILE_TYPE_IN_USE';
    throw err;
  }

  await fileTypeRepository.delete(id);
  return { id };
}
