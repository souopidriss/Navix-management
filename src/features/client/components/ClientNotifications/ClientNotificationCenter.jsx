import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, LoadingState, ErrorState } from '@/components/core';
import {
  NOTIFICATION_CATEGORIES,
  getNotificationSeverity,
  getNotificationKind,
  getResourcePath,
  formatNotificationRelative,
} from '@/features/notifications/constants';
import './ClientNotifications.css';

const CATEGORY_OPTIONS = [
  { value: '', label: 'Toutes les catégories' },
  ...Object.entries(NOTIFICATION_CATEGORIES).map(([value, category]) => ({
    value,
    label: category.label,
  })),
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'unread', label: 'Non lues' },
  { value: 'read', label: 'Lues' },
  { value: 'archived', label: 'Archivées' },
];

/**
 * Centre de notifications du client. Affiche la liste des notifications,
 * permet de filtrer (catégorie, statut, recherche), de marquer lues/non
 * lues, d'archiver et de supprimer (y compris en masse).
 */
const ClientNotificationCenter = ({
  notifications = [],
  loading,
  error,
  onRetry,
  onMarkAsRead,
  onMarkAsUnread,
  onMarkAllAsRead,
  onArchive,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([]);
  }, [category, status, search]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notifications.filter((notification) => {
      if (category && notification.category !== category) return false;
      if (status === 'unread' && notification.isRead) return false;
      if (status === 'read' && !notification.isRead) return false;
      if (status === 'archived' && notification.archived !== true) return false;
      if (term) {
        const haystack = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [notifications, category, status, search]);

  const selectedSet = new Set(selected);
  const allFilteredSelected = filtered.length > 0 && filtered.every((item) => selectedSet.has(item.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected([]);
    } else {
      setSelected(filtered.map((item) => item.id));
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleClick = (notification) => {
    if (!notification.isRead) onMarkAsRead?.(notification.id);
    if (notification.resourceType && notification.resourceId) {
      navigate(getResourcePath(notification.resourceType, notification.resourceId));
    }
  };

  if (loading) return <LoadingState message="Chargement des notifications…" />;

  if (error) {
    return <ErrorState title="Impossible de charger les notifications" description={error} onRetry={onRetry} />;
  }

  const hasSelection = selected.length > 0;

  return (
    <div className="navix-client-notif-wrap">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3 navix-client-notif-toolbar">
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: '240px' }}
          placeholder="Rechercher…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Rechercher une notification"
        />
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filtrer par catégorie"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filtrer par statut"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasSelection ? (
          <span className="navix-client-notif-bulk">
            {selected.length} sélectionnée{selected.length > 1 ? 's' : ''}
          </span>
        ) : (
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={onMarkAllAsRead}>
            <i className="bi bi-check2-all me-1" aria-hidden="true" />
            Tout marquer lu
          </button>
        )}
      </div>

      {hasSelection && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => onMarkAsRead?.(selected)}
          >
            <i className="bi bi-envelope-open me-1" aria-hidden="true" />
            Marquer lu
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => onMarkAsUnread?.(selected)}
          >
            <i className="bi bi-envelope me-1" aria-hidden="true" />
            Marquer non lu
          </button>
          <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => onArchive?.(selected)}>
            <i className="bi bi-archive me-1" aria-hidden="true" />
            Archiver
          </button>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete?.(selected)}>
            <i className="bi bi-trash me-1" aria-hidden="true" />
            Supprimer
          </button>
          <button type="button" className="btn btn-sm btn-link" onClick={() => setSelected([])}>
            Annuler
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title={search || category || status ? 'Aucun résultat' : 'Aucune notification'}
          description={
            search || category || status
              ? 'Aucune notification ne correspond à vos filtres.'
              : 'Vous serez notifié ici des alertes et événements de votre flotte.'
          }
        />
      ) : (
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="form-check">
            <input
              id="client-notif-select-all"
              className="form-check-input"
              type="checkbox"
              checked={allFilteredSelected}
              onChange={toggleSelectAll}
            />
            <label className="form-check-label small" htmlFor="client-notif-select-all">
              Tout sélectionner
            </label>
          </div>
        </div>
      )}

      <div className="vstack gap-2">
        {filtered.map((notification) => {
          const kind = getNotificationKind(notification.kind);
          const severity = getNotificationSeverity(notification.severity);
          const selectedItem = selectedSet.has(notification.id);
          return (
            <div
              key={notification.id}
              className={`navix-client-notif ${!notification.isRead ? 'navix-client-notif--unread' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => handleClick(notification)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') handleClick(notification);
              }}
            >
              <div className="form-check align-self-center">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={selectedItem}
                  onChange={() => toggleSelect(notification.id)}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`Sélectionner ${notification.title || notification.id}`}
                />
              </div>
              <span className={`navix-client-notif__icon bg-${severity.variant}-soft text-${severity.variant}`} aria-hidden="true">
                <i className={`bi ${kind.icon || severity.icon || 'bi-bell'}`} />
              </span>
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <p className="navix-client-notif__title mb-1">{notification.title}</p>
                  <span className="navix-client-notif__time">{formatNotificationRelative(notification.createdAt)}</span>
                </div>
                <p className="navix-client-notif__message mb-1">{notification.message}</p>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className={`badge text-bg-${severity.variant}`}>{severity.label}</span>
                  {kind.category && (
                    <span className="badge text-bg-light border">{kind.label}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientNotificationCenter;
