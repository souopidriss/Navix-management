import { BaseRepository } from './BaseRepository.js';

class FileTypeRepository extends BaseRepository {
  constructor() {
    super('file_types');
  }

  allowedFilterFields() {
    return ['id', 'title', 'is_active', 'created_at', 'updated_at'];
  }

  allowedSortFields() {
    return ['id', 'title', 'created_at', 'updated_at'];
  }

  async findAllActive() {
    return this.query(
      `SELECT * FROM file_types WHERE is_active = 1 ORDER BY title ASC`
    );
  }

  async findByTitle(title) {
    return this.queryOne(
      `SELECT * FROM file_types WHERE LOWER(title) = LOWER(?)`,
      [title]
    );
  }

  async findByTitleExcludeId(title, excludeId) {
    return this.queryOne(
      `SELECT * FROM file_types WHERE LOWER(title) = LOWER(?) AND id != ?`,
      [title, excludeId]
    );
  }

  async countDocuments(fileTypeId) {
    const result = await this.queryOne(
      `SELECT COUNT(*) as total FROM files WHERE file_type_id = ? AND deleted_at IS NULL`,
      [fileTypeId]
    );
    return result?.total || 0;
  }

  async formatResponse(row) {
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
}

export default new FileTypeRepository();
