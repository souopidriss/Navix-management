import { BaseRepository } from './BaseRepository.js';

class CompanyRepository extends BaseRepository {
  constructor() {
    super('companies');
  }
}

export default new CompanyRepository();
