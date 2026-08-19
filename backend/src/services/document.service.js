import fileRepository from '../repositories/FileRepository.js';
import fileTypeRepository from '../repositories/FileTypeRepository.js';
import { getPool } from '../database/index.js';
import { generateId } from '../utils/id.js';
import { NotFoundError, ValidationError } from '../errors/index.js';

function parseJsonColumn(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

function formatDocumentResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    fileTypeId: row.file_type_id,
    fileTypeTitle: row.file_type_title || '',
    fileNumber: row.file_number || '',
    name: row.name,
    originalName: row.original_name,
    path: row.path,
    directory: row.directory || '',
    extension: row.extension,
    mimeType: row.mime_type,
    size: Number(row.size),
    width: row.width || null,
    height: row.height || null,
    thumbnail: row.thumbnail || '',
    url: row.url || '',
    description: row.description || '',
    isPublic: Boolean(row.is_public),
    visibility: row.visibility || 'private',
    uploadedBy: row.uploaded_by || '',
    associationType: row.association_type || '',
    associationId: row.association_id || '',
    category: row.category || '',
    version: Number(row.version || 1),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listDocuments(query, { companyId }) {
  const rows = await fileRepository.findByCompanyScope(companyId, query.companyScopeId);
  return rows.map(formatDocumentResponse);
}

export async function getDocumentById(id, { companyId }) {
  const row = companyId
    ? await fileRepository.findByCompanyIdAndId(companyId, id)
    : await fileRepository.findByIdWithJoins(id);
  if (!row) throw new NotFoundError('Document');
  return formatDocumentResponse(row);
}

export async function createDocument(data, { companyId }) {
  const fileType = await fileTypeRepository.findById(data.fileTypeId);
  if (!fileType) {
    throw new ValidationError('Le type de fichier sélectionné est invalide.');
  }

  const conn = await getPool().getConnection();
  try {
    await conn.query(
      `INSERT INTO file_counters (company_id, current_number) VALUES (?, 1)
       ON DUPLICATE KEY UPDATE current_number = LAST_INSERT_ID(current_number + 1)`,
      [companyId]
    );
    const [counterRows] = await conn.query('SELECT LAST_INSERT_ID() AS num');
    const nextNum = Number(counterRows[0].num);
    const fileNumber = `FL-${String(nextNum).padStart(4, '0')}`;

    const id = generateId();
    const extensions = parseJsonColumn(fileType.extensions);
    const mimeTypes = parseJsonColumn(fileType.mime_types);
    const ext = extensions[0] || '.bin';
    const directory = buildDirectory(data.associationType);
    const fileName = data.name || `${fileNumber}${ext}`;
    const filePath = `${directory}/${fileNumber}${ext}`;
    const isPublic = data.visibility === 'public' ? 1 : 0;

    await conn.query(
      `INSERT INTO files
        (id, company_id, file_type_id, file_number, name, original_name, path, directory,
         extension, mime_type, size, description, is_public, visibility, uploaded_by,
         association_type, association_id, category, version, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        id, companyId, data.fileTypeId, fileNumber,
        fileName, fileName, filePath, directory,
        ext, mimeTypes[0] || 'application/octet-stream',
        0, data.description || '', isPublic,
        data.visibility || 'private', '',
        data.associationType || '', data.associationId || '',
        data.category || '',
      ]
    );

    const full = await fileRepository.findByCompanyIdAndId(companyId, id);
    return formatDocumentResponse(full);
  } finally {
    conn.release();
  }
}

export async function updateDocument(id, data, { companyId }) {
  const existing = await fileRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Document');

  const updateData = {};
  if (data.fileTypeId !== undefined) {
    const ft = await fileTypeRepository.findById(data.fileTypeId);
    if (!ft) throw new ValidationError('Le type de fichier sélectionné est invalide.');
    updateData.file_type_id = data.fileTypeId;
    updateData.extension = parseJsonColumn(ft.extensions)[0] || existing.extension;
    updateData.mime_type = parseJsonColumn(ft.mime_types)[0] || existing.mime_type;
  }
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || '';
  if (data.visibility !== undefined) {
    updateData.visibility = data.visibility;
    updateData.is_public = data.visibility === 'public' ? 1 : 0;
  }
  if (data.associationType !== undefined) {
    updateData.association_type = data.associationType || '';
    updateData.directory = buildDirectory(data.associationType);
  }
  if (data.associationId !== undefined) updateData.association_id = data.associationId || '';
  if (data.category !== undefined) updateData.category = data.category || '';

  if (Object.keys(updateData).length === 0) return formatDocumentResponse(existing);

  await fileRepository.update(id, updateData);

  const updated = await fileRepository.findByCompanyIdAndId(companyId, id);
  return formatDocumentResponse(updated);
}

export async function deleteDocument(id, { companyId }) {
  const existing = await fileRepository.findByCompanyIdAndId(companyId, id);
  if (!existing) throw new NotFoundError('Document');
  await fileRepository.softDelete(id);
  return { id };
}

export async function uploadDocuments(files, payload, { companyId, userName }) {
  const fileType = await fileTypeRepository.findById(payload.fileTypeId);
  if (!fileType) {
    throw new ValidationError('Type de fichier inconnu.');
  }

  if (!files || files.length === 0) {
    throw new ValidationError('Aucun fichier à téléverser.');
  }

  const allowedExts = parseJsonColumn(fileType.extensions);
  const allowedMimes = parseJsonColumn(fileType.mime_types);
  const maxSize = Number(fileType.max_size);

  const results = [];

  for (const file of files) {
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();

    if (allowedExts.length > 0 && !allowedExts.includes(ext)) {
      throw new ValidationError(`Extension "${ext}" non autorisée pour ce type de fichier.`);
    }

    if (allowedMimes.length > 0 && !allowedMimes.includes(file.mimetype)) {
      throw new ValidationError(`Type MIME "${file.mimetype}" non autorisé pour ce type de fichier.`);
    }

    if (file.size > maxSize) {
      throw new ValidationError(`Le fichier "${file.originalname}" dépasse la taille maximale (${maxSize} octets).`);
    }
  }

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    for (const file of files) {
      await conn.query(
        `INSERT INTO file_counters (company_id, current_number) VALUES (?, 1)
         ON DUPLICATE KEY UPDATE current_number = LAST_INSERT_ID(current_number + 1)`,
        [companyId]
      );
      const [counterRows] = await conn.query('SELECT LAST_INSERT_ID() AS num');
      const nextNum = Number(counterRows[0].num);
      const fileNumber = `FL-${String(nextNum).padStart(4, '0')}`;

      const id = generateId();
      const ext = '.' + file.originalname.split('.').pop().toLowerCase();
      const directory = buildDirectory(payload.associationType);
      const filePath = `${directory}/${fileNumber}${ext}`;
      const isPublic = payload.visibility === 'public' ? 1 : 0;

      await conn.query(
        `INSERT INTO files
          (id, company_id, file_type_id, file_number, name, original_name, path, directory,
           extension, mime_type, size, description, is_public, visibility, uploaded_by,
           association_type, association_id, category, version, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [
          id, companyId, payload.fileTypeId, fileNumber,
          file.originalname, file.originalname, filePath, directory,
          ext, file.mimetype, file.size,
          payload.description || '', isPublic,
          payload.visibility || 'private', userName || '',
          payload.associationType || '', payload.associationId || '',
          payload.category || '',
        ]
      );

      const full = await fileRepository.findByCompanyIdAndId(companyId, id);
      results.push(formatDocumentResponse(full));
    }

    await conn.commit();
    return results;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function downloadDocument(id, { companyId }) {
  const row = companyId
    ? await fileRepository.findByCompanyIdAndId(companyId, id)
    : await fileRepository.findByIdWithJoins(id);
  if (!row) throw new NotFoundError('Document');
  return {
    ...formatDocumentResponse(row),
    downloadedAt: new Date().toISOString(),
  };
}

export async function previewDocument(id, { companyId }) {
  const row = companyId
    ? await fileRepository.findByCompanyIdAndId(companyId, id)
    : await fileRepository.findByIdWithJoins(id);
  if (!row) throw new NotFoundError('Document');
  return formatDocumentResponse(row);
}

export async function getDocumentStatistics({ companyId }) {
  const stats = await fileRepository.getStats(companyId);
  return stats;
}

function buildDirectory(associationType) {
  const dirs = {
    company: 'uploads/company',
    vehicle: 'uploads/vehicles',
    driver: 'uploads/drivers',
    maintenance: 'uploads/maintenance',
    trip: 'uploads/trips',
    fuel: 'uploads/fuel',
    user: 'uploads/users',
  };
  return dirs[associationType] || 'uploads/misc';
}
