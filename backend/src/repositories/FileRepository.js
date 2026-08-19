import { BaseRepository } from './BaseRepository.js';

class FileRepository extends BaseRepository {
  constructor() {
    super('files');
  }

  allowedFilterFields() {
    return [
      'id', 'company_id', 'file_type_id', 'name', 'extension',
      'mime_type', 'visibility', 'is_public', 'association_type',
      'association_id', 'category', 'uploaded_by', 'created_at',
      'updated_at', 'deleted_at', 'file_number',
    ];
  }

  allowedSortFields() {
    return ['id', 'created_at', 'updated_at', 'name', 'size', 'extension', 'updated_at'];
  }

  async findByCompanyIdAndId(companyId, id) {
    return this.queryOne(
      `SELECT f.*, ft.title AS file_type_title
       FROM files f
       LEFT JOIN file_types ft ON ft.id = f.file_type_id
       WHERE f.id = ? AND f.company_id = ? AND f.deleted_at IS NULL`,
      [id, companyId]
    );
  }

  async findByIdWithJoins(id) {
    return this.queryOne(
      `SELECT f.*, ft.title AS file_type_title
       FROM files f
       LEFT JOIN file_types ft ON ft.id = f.file_type_id
       WHERE f.id = ? AND f.deleted_at IS NULL`,
      [id]
    );
  }

  async findByCompanyIdAll(companyId) {
    return this.query(
      `SELECT f.*, ft.title AS file_type_title
       FROM files f
       LEFT JOIN file_types ft ON ft.id = f.file_type_id
       WHERE f.company_id = ? AND f.deleted_at IS NULL
       ORDER BY f.created_at DESC`,
      [companyId]
    );
  }

  async findByCompanyScope(companyId, scopeId) {
    if (scopeId) {
      return this.findByCompanyIdAll(scopeId);
    }
    if (companyId) {
      return this.findByCompanyIdAll(companyId);
    }
    return this.query(
      `SELECT f.*, ft.title AS file_type_title
       FROM files f
       LEFT JOIN file_types ft ON ft.id = f.file_type_id
       WHERE f.deleted_at IS NULL
       ORDER BY f.created_at DESC`
    );
  }

  async countByCompanyId(companyId) {
    const result = await this.queryOne(
      `SELECT COUNT(*) as total FROM files WHERE company_id = ? AND deleted_at IS NULL`,
      [companyId]
    );
    return result?.total || 0;
  }

  async getStats(companyId) {
    const baseCondition = companyId
      ? 'WHERE f.company_id = ? AND f.deleted_at IS NULL'
      : 'WHERE f.deleted_at IS NULL';
    const params = companyId ? [companyId] : [];

    const totals = await this.queryOne(
      `SELECT
        COUNT(*) AS totalCount,
        COALESCE(SUM(f.size), 0) AS totalSize,
        SUM(CASE WHEN MONTH(f.created_at) = MONTH(NOW()) AND YEAR(f.created_at) = YEAR(NOW()) THEN 1 ELSE 0 END) AS monthCount,
        SUM(CASE WHEN YEAR(f.created_at) = YEAR(NOW()) THEN 1 ELSE 0 END) AS yearCount,
        SUM(CASE WHEN f.association_type = 'vehicle' THEN 1 ELSE 0 END) AS vehicleCount,
        SUM(CASE WHEN f.association_type = 'maintenance' THEN 1 ELSE 0 END) AS maintenanceCount,
        SUM(CASE WHEN f.association_type = 'driver' THEN 1 ELSE 0 END) AS driverCount,
        SUM(CASE WHEN f.association_type = 'trip' THEN 1 ELSE 0 END) AS tripCount,
        SUM(CASE WHEN f.association_type = 'fuel' THEN 1 ELSE 0 END) AS fuelCount,
        SUM(CASE WHEN f.visibility = 'public' THEN 1 ELSE 0 END) AS publicCount,
        SUM(CASE WHEN f.visibility = 'private' THEN 1 ELSE 0 END) AS privateCount,
        SUM(CASE WHEN f.visibility = 'restricted' THEN 1 ELSE 0 END) AS restrictedCount
      FROM files f
      ${baseCondition}`,
      params
    );

    const typeDistribution = await this.query(
      `SELECT f.extension AS type, COUNT(f.id) AS count
       FROM files f
       ${baseCondition}
       GROUP BY f.extension
       ORDER BY count DESC`,
      params
    );

    const visibilityDistribution = await this.query(
      `SELECT f.visibility, COUNT(f.id) AS count
       FROM files f
       ${baseCondition}
       GROUP BY f.visibility`,
      params
    );

    const sizeByType = await this.query(
      `SELECT f.extension AS type, COUNT(f.id) AS count, COALESCE(SUM(f.size), 0) AS totalSize
       FROM files f
       ${baseCondition}
       GROUP BY f.extension
       ORDER BY totalSize DESC`,
      params
    );

    const categoryDistribution = await this.query(
      `SELECT f.category, COUNT(f.id) AS count
       FROM files f
       ${baseCondition}
       GROUP BY f.category`,
      params
    );

    const categoryMap = {};
    for (const row of categoryDistribution) {
      categoryMap[row.category || 'autre'] = Number(row.count);
    }

    return {
      totalCount: Number(totals?.totalCount || 0),
      totalSize: Number(totals?.totalSize || 0),
      monthCount: Number(totals?.monthCount || 0),
      yearCount: Number(totals?.yearCount || 0),
      vehicleCount: Number(totals?.vehicleCount || 0),
      maintenanceCount: Number(totals?.maintenanceCount || 0),
      driverCount: Number(totals?.driverCount || 0),
      tripCount: Number(totals?.tripCount || 0),
      fuelCount: Number(totals?.fuelCount || 0),
      publicCount: Number(totals?.publicCount || 0),
      privateCount: Number(totals?.privateCount || 0),
      restrictedCount: Number(totals?.restrictedCount || 0),
      typeDistribution: typeDistribution.map((r) => ({
        type: r.type,
        count: Number(r.count),
      })),
      visibilityDistribution: visibilityDistribution.map((r) => ({
        visibility: r.visibility,
        count: Number(r.count),
      })),
      sizeByType: sizeByType.map((r) => ({
        type: r.type,
        count: Number(r.count),
        totalSize: Number(r.totalSize),
      })),
      categoryDistribution: categoryMap,
      generatedAt: new Date().toISOString(),
    };
  }

  async formatResponse(row) {
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
}

export default new FileRepository();
