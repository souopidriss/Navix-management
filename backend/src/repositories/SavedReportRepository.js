import { BaseRepository } from './BaseRepository.js';
import { getPool } from '../database/index.js';

class SavedReportRepository extends BaseRepository {
  constructor() {
    super('saved_reports');
  }

  async findByCompanyId(companyId, filters = {}) {
    let sql = 'SELECT * FROM saved_reports WHERE company_id = ?';
    const params = [companyId];

    if (filters.reportType) {
      sql += ' AND report_type = ?';
      params.push(filters.reportType);
    }
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(Number(filters.limit));
      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(Number(filters.offset));
      }
    }

    const [rows] = await getPool().query(sql, params);
    return rows;
  }

  async countByCompanyId(companyId, filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM saved_reports WHERE company_id = ?';
    const params = [companyId];

    if (filters.reportType) {
      sql += ' AND report_type = ?';
      params.push(filters.reportType);
    }
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const [rows] = await getPool().query(sql, params);
    return rows[0]?.total ?? 0;
  }

  async findByIdAndCompany(id, companyId) {
    const [rows] = await getPool().query(
      'SELECT * FROM saved_reports WHERE id = ? AND company_id = ?',
      [id, companyId],
    );
    return rows[0] || null;
  }

  async deleteByIdAndCompany(id, companyId) {
    const [result] = await getPool().query(
      'DELETE FROM saved_reports WHERE id = ? AND company_id = ?',
      [id, companyId],
    );
    return result.affectedRows > 0;
  }
}

export default new SavedReportRepository();
