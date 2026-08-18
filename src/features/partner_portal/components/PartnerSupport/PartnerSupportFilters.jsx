/**
 * Navix Partner Portal — PartnerSupportFilters (PROMPT 077)
 * ──────────────────────────────────────────────────────────
 * Barre de filtres pour la liste des tickets de support.
 */
import { memo } from 'react';
import {
  TICKET_STATUS_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_CATEGORY_OPTIONS,
} from '../../schemas/partnerSupport.schema';

const PartnerSupportFilters = ({ filters, onFilterChange }) => {
  const handleSearchChange = (e) => {
    onFilterChange((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusChange = (e) => {
    onFilterChange((prev) => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handlePriorityChange = (e) => {
    onFilterChange((prev) => ({ ...prev, priority: e.target.value, page: 1 }));
  };

  const handleCategoryChange = (e) => {
    onFilterChange((prev) => ({ ...prev, category: e.target.value, page: 1 }));
  };

  return (
    <div className="ps-filters">
      <div className="ps-filters__search">
        <i className="bi bi-search ps-filters__search-icon" />
        <input
          type="text"
          placeholder="Rechercher une demande..."
          value={filters?.search || ''}
          onChange={handleSearchChange}
          aria-label="Rechercher une demande"
        />
      </div>
      <select
        className="ps-filters__select"
        value={filters?.status || 'all'}
        onChange={handleStatusChange}
        aria-label="Filtrer par statut"
      >
        {TICKET_STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <select
        className="ps-filters__select"
        value={filters?.priority || 'all'}
        onChange={handlePriorityChange}
        aria-label="Filtrer par priorité"
      >
        {TICKET_PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <select
        className="ps-filters__select"
        value={filters?.category || 'all'}
        onChange={handleCategoryChange}
        aria-label="Filtrer par catégorie"
      >
        {TICKET_CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export default memo(PartnerSupportFilters);
