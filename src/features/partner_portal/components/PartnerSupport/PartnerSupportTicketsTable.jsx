/**
 * Navix Partner Portal — PartnerSupportTicketsTable (PROMPT 077)
 * ───────────────────────────────────────────────────────────────
 * Tableau paginé des tickets de support avec actions.
 */
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, Pagination, EmptyState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import {
  getTicketStatus,
  getTicketPriority,
  getTicketCategory,
  TICKET_SORT_OPTIONS,
  TICKET_PAGE_SIZE_OPTIONS,
} from '../../schemas/partnerSupport.schema';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const PartnerSupportTicketsTable = ({
  tickets,
  total,
  totalPages,
  filters,
  onFilterChange,
  onCreateTicket,
  isLoading: _isLoading,
}) => {
  const navigate = useNavigate();

  const handleSortChange = (e) => {
    onFilterChange((prev) => ({ ...prev, sortBy: e.target.value }));
  };

  const handleSortDirection = () => {
    onFilterChange((prev) => ({
      ...prev,
      sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (page) => {
    onFilterChange((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize) => {
    onFilterChange((prev) => ({ ...prev, pageSize, page: 1 }));
  };

  const handleViewTicket = (ticketId) => {
    navigate(`${ROUTES.PARTNER_SUPPORT}/${ticketId}`);
  };

  if (!tickets || tickets.length === 0) {
    return (
      <div className="ps-table-wrapper">
        <EmptyState
          icon="bi-ticket-detailed"
          title="Aucune demande de support"
          description="Vous n'avez aucune demande de support."
          action={{ label: 'Créer une demande', onClick: onCreateTicket }}
        />
      </div>
    );
  }

  const statusMeta = (s) => getTicketStatus(s);
  const priorityMeta = (p) => getTicketPriority(p);
  const categoryMeta = (c) => getTicketCategory(c);

  return (
    <div className="ps-table-wrapper">
      <div className="ps-table-header">
        <div>
          <h3 className="ps-table-header__title">
            Demandes de support
            <span className="ps-table-header__count">{total}</span>
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            className="ps-filters__select"
            value={filters?.sortBy || 'createdAt'}
            onChange={handleSortChange}
            aria-label="Trier par"
          >
            {TICKET_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            type="button"
            className="ps-table__action-btn"
            onClick={handleSortDirection}
            title={filters?.sortDirection === 'asc' ? 'Croissant' : 'Décroissant'}
            aria-label="Changer le sens du tri"
          >
            <i className={`bi bi-sort-${filters?.sortDirection === 'asc' ? 'up' : 'down'}`} />
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="ps-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Sujet</th>
              <th>Catégorie</th>
              <th>Priorité</th>
              <th>Statut</th>
              <th>Dernière activité</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => {
              const st = statusMeta(ticket.status);
              const pr = priorityMeta(ticket.priority);
              const cat = categoryMeta(ticket.category);

              return (
                <tr key={ticket.id}>
                  <td>
                    <span className="ps-table__reference">{ticket.reference}</span>
                  </td>
                  <td>
                    <span className="ps-table__subject" title={ticket.subject}>
                      {ticket.subject}
                    </span>
                  </td>
                  <td>
                    <span className="ps-category">
                      <i className={`bi ${cat.icon}`} />
                      {cat.label}
                    </span>
                  </td>
                  <td>
                    <span className={`ps-priority ps-priority--${ticket.priority}`}>
                      <i className={`bi ${pr.icon}`} />
                      {pr.label}
                    </span>
                  </td>
                  <td>
                    <StatusBadge
                      variant={st.variant}
                      label={st.label}
                      icon={st.icon}
                      dot
                      soft
                      size="sm"
                    />
                  </td>
                  <td>
                    <span className="ps-table__date">{formatDate(ticket.updatedAt)}</span>
                  </td>
                  <td>
                    <span className="ps-table__date">{formatDate(ticket.createdAt)}</span>
                  </td>
                  <td>
                    <div className="ps-table__actions">
                      <button
                        type="button"
                        className="ps-table__action-btn"
                        onClick={() => handleViewTicket(ticket.id)}
                        title="Voir le ticket"
                        aria-label={`Voir le ticket ${ticket.reference}`}
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="ps-pagination">
        <Pagination
          page={filters?.page || 1}
          pageSize={filters?.pageSize || 10}
          totalItems={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={TICKET_PAGE_SIZE_OPTIONS}
          showPageSize
        />
      </div>
    </div>
  );
};

export default memo(PartnerSupportTicketsTable);
