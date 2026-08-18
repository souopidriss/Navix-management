/**
 * Navix Partner Portal — PartnerClientsPage (PROMPT 065 — CLIENTS PARTENAIRE · PREMIUM)
 * --------------------------------------------------------------------------
 * Gestion complète des clients de l'entreprise partenaire :
 *   HEADER « Clients » + « Nouveau client » (→ /partner/clients/new) +
 *   « Exporter »
 *   → 4 KPI premium (CLIENTS 37 / ACTIFS 31 / INACTIFS 6 /
 *     REVENUS 18 750 000 FCFA, dynamiques depuis la liste réelle)
 *   → Recherche instantanée + filtres Statut / Ville / Type + Réinitialiser
 *   → Tableau premium (Client, Ville, Type, Contact, Téléphone, Missions,
 *     Revenus, Statut, Actions) + pagination 10/25/50
 *   → Actions par ligne (menu déroulant) : Voir détails, Modifier,
 *     Voir missions (filtre le module Missions), Archiver — selon statut et
 *     permissions.
 *
 * Multi-tenant : le service applique strictement companyId + partnerId du
 * partenaire — jamais depuis l'UI. RBAC : les actions d'écriture sont
 * conditionnées aux permissions PARTNER_CLIENTS_*. L'archivage est une
 * désactivation douce : les données ne sont jamais supprimées.
 */
import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  DataTable,
  SearchBar,
  FilterBar,
  Pagination,
  StatusBadge,
  ActionDropdown,
  ConfirmDialog,
  ExportButton,
} from '@/components/core';
import { Can } from '@/features/rbac/components';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import { ROUTES, partnerClientDetailPath } from '@/routes/route.constants';
import { formatNumber } from '@/utils/format';
import {
  FCFA_LABEL,
  PARTNER_CLIENT_PAGE_SIZE_OPTIONS,
  getPartnerClientStatus,
  getPartnerClientType,
} from '../constants/partner.constants';
import usePartnerClients from '../hooks/usePartnerClients';
import usePartnerClientFilters from '../hooks/usePartnerClientFilters';
import PartnerClientStats from '../components/PartnerClients/PartnerClientStats';
import PartnerClientFormModal from '../components/PartnerClients/PartnerClientFormModal';
import '../components/PartnerClients/PartnerClients.css';

const EXPORT_COLUMNS = [
  { key: 'reference', label: 'Référence' },
  { key: 'name', label: 'Nom / raison sociale' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Statut' },
  { key: 'contactName', label: 'Contact principal' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Téléphone' },
  { key: 'address', label: 'Adresse' },
  { key: 'city', label: 'Ville' },
  { key: 'country', label: 'Pays' },
  { key: 'missionsCount', label: 'Missions' },
  { key: 'completedMissions', label: 'Missions terminées' },
  { key: 'inProgressMissions', label: 'Missions en cours' },
  { key: 'revenue', label: 'Revenus (FCFA)' },
  { key: 'lastMissionDate', label: 'Dernière mission' },
  { key: 'lastPaymentDate', label: 'Dernier paiement' },
  { key: 'createdAt', label: 'Créé le' },
];

const PartnerClientsPage = () => {
  const can = useCan();
  const navigate = useNavigate();

  const {
    isLoading,
    error,
    refetch,
    search,
    setSearch,
    filters,
    setFilters,
    hasActiveFilters,
    resetFilters,
    sort,
    setSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    pageItems,
    sorted,
    counts,
    cities,
    updateClient,
    archiveClient,
  } = usePartnerClients();

  const { fields: filterFields } = usePartnerClientFilters(cities);

  /* ── États des modales / confirmations ────────────────────────────────── */
  const [formTarget, setFormTarget] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState('');

  const exportRows = useMemo(
    () =>
      sorted.map((client) => ({
        reference: client.reference ?? '',
        name: client.name ?? '',
        type: getPartnerClientType(client.type).label,
        status: getPartnerClientStatus(client.status).label,
        contactName: client.contactName ?? client.contact ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        address: client.address ?? '',
        city: client.city ?? '',
        country: client.country ?? '',
        missionsCount: Number(client.missionsCount) || 0,
        completedMissions: Number(client.completedMissions) || 0,
        inProgressMissions: Number(client.inProgressMissions) || 0,
        revenue: Number(client.revenue) || 0,
        lastMissionDate: client.lastMissionDate ?? '',
        lastPaymentDate: client.lastPaymentDate ?? '',
        createdAt: client.createdAt ?? '',
      })),
    [sorted],
  );

  const openEdit = (client) => {
    setFormTarget(client);
    setFormError('');
    setFormOpen(true);
  };

  const openArchive = (client) => {
    setArchiveTarget(client);
    setArchiveError('');
  };

  const handleFormSubmit = async (payload) => {
    if (!formTarget) return;
    setIsSaving(true);
    setFormError('');
    try {
      await updateClient(formTarget.id, payload);
      toast.success('Client mis à jour.');
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.message || 'Impossible d’enregistrer le client.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    setArchiveError('');
    try {
      await archiveClient(archiveTarget.id);
      toast.success('Client archivé.');
      setArchiveTarget(null);
      refetch();
    } catch (err) {
      setArchiveError(err?.message || 'Archivage refusé.');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleSortChange = (by, direction) => setSort({ by, direction });

  const columns = [
    {
      key: 'name',
      label: 'Client',
      sortable: true,
      render: (client) => (
        <button
          type="button"
          className="navix-pcli-refbtn"
          onClick={() => navigate(partnerClientDetailPath(client.id))}
          title={`Voir ${client.name}`}
        >
          <span className="navix-pcli-icon" aria-hidden="true">
            <i className={`bi ${getPartnerClientType(client.type).icon}`} />
          </span>
          <span className="text-start">
            <span className="fw-semibold d-block">{client.name}</span>
            <small className="text-secondary font-monospace d-block">{client.reference}</small>
          </span>
        </button>
      ),
    },
    {
      key: 'city',
      label: 'Ville',
      sortable: true,
      render: (client) => (
        <span className="navix-pcli-type">
          <i className="bi bi-geo-alt text-danger" aria-hidden="true" />
          {client.city || '—'}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (client) => {
        const meta = getPartnerClientType(client.type);
        return (
          <span className="navix-pcli-type">
            <i className={`bi ${meta.icon} me-1 text-secondary`} aria-hidden="true" />
            {meta.label}
          </span>
        );
      },
    },
    {
      key: 'contactName',
      label: 'Contact',
      render: (client) => {
        const contact = client.contactName || client.contact;
        return contact ? (
          <span>
            <i className="bi bi-person me-1 text-secondary" aria-hidden="true" />
            {contact}
          </span>
        ) : (
          <span className="text-secondary">—</span>
        );
      },
    },
    {
      key: 'phone',
      label: 'Téléphone',
      render: (client) => client.phone || <span className="text-secondary">—</span>,
    },
    {
      key: 'missionsCount',
      label: 'Missions',
      align: 'end',
      sortable: true,
      render: (client) => (
        <span>
          <span className="tabular-nums fw-semibold">{client.missionsCount ?? 0}</span>
          {client.inProgressMissions > 0 && (
            <small className="text-secondary d-block">dont {client.inProgressMissions} en cours</small>
          )}
        </span>
      ),
    },
    {
      key: 'revenue',
      label: 'Revenus',
      align: 'end',
      sortable: true,
      render: (client) => (
        <span className="tabular-nums fw-semibold">
          {formatNumber(client.revenue ?? 0)} {FCFA_LABEL}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (client) => {
        const meta = getPartnerClientStatus(client.status);
        return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} />;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      srOnly: true,
      align: 'end',
      render: (client) => (
        <ActionDropdown
          ariaLabel={`Actions pour ${client.name}`}
          items={[
            {
              key: 'view',
              label: 'Voir détails',
              icon: 'bi-eye',
              onClick: () => navigate(partnerClientDetailPath(client.id)),
            },
            {
              key: 'edit',
              label: 'Modifier',
              icon: 'bi-pencil',
              show: () => can(PERMISSIONS.PARTNER_CLIENTS_UPDATE),
              onClick: () => openEdit(client),
            },
            {
              key: 'missions',
              label: 'Voir missions',
              icon: 'bi-signpost-split',
              onClick: () => navigate(`${ROUTES.PARTNER_MISSIONS}?q=${encodeURIComponent(client.name)}`),
            },
            {
              key: 'separator',
              separator: true,
            },
            {
              key: 'archive',
              label: 'Archiver',
              icon: 'bi-archive',
              danger: true,
              show: () => can(PERMISSIONS.PARTNER_CLIENTS_ARCHIVE) && client.status !== 'archived',
              onClick: () => openArchive(client),
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading && totalItems === 0) {
    return (
      <PageContainer>
        <LoadingState variant="cards" rows={4} label="Chargement de vos clients…" />
      </PageContainer>
    );
  }

  if (error && totalItems === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Impossible de charger vos clients"
          description="Les données de votre portefeuille clients sont temporairement indisponibles."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Clients — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Clients"
        subtitle="Gérez votre portefeuille de clients partenaire : identification, coordonnées, activité et archivage."
        icon="bi-people"
        breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Clients' }]}
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Can permission={PERMISSIONS.PARTNER_CLIENTS_CREATE}>
              <Button
                variant="primary"
                size="sm"
                icon="bi-person-plus"
                onClick={() => navigate(ROUTES.PARTNER_CLIENTS_NEW)}
              >
                Nouveau client
              </Button>
            </Can>
            <ExportButton
              format="csv"
              data={exportRows}
              columns={EXPORT_COLUMNS}
              filename="clients-partenaire"
              label="Exporter"
              size="sm"
            />
            <Button variant="ghost" size="sm" icon="bi-arrow-clockwise" onClick={refetch} aria-label="Actualiser">
              <span className="visually-hidden">Actualiser</span>
            </Button>
          </div>
        }
      />

      <PartnerClientStats counts={counts} loading={isLoading} />

      <DataTable
        className="navix-pcli-table"
        columns={columns}
        rows={pageItems}
        sort={sort}
        onSortChange={handleSortChange}
        ariaLabel="Liste des clients partenaires"
        empty={
          <EmptyState
            compact
            icon="bi-people"
            title={hasActiveFilters ? 'Aucun client ne correspond' : 'Aucun client'}
            description={
              hasActiveFilters
                ? 'Modifiez vos critères de recherche ou réinitialisez les filtres.'
                : 'Aucun client n’est encore rattaché à votre entreprise.'
            }
          />
        }
        header={
          <div className="navix-pcli-toolbar">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Rechercher un client, un contact, une ville…"
              resultCount={totalItems}
              aria-label="Rechercher parmi les clients"
            />
            <FilterBar
              fields={filterFields}
              values={filters}
              onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
              onReset={resetFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        }
        footer={
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={PARTNER_CLIENT_PAGE_SIZE_OPTIONS}
          />
        }
      />

      <PartnerClientFormModal
        key={`${formTarget?.id ?? 'create'}-${formOpen}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        client={formTarget}
        onSubmit={handleFormSubmit}
        loading={isSaving}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title="Archiver ce client"
        icon="bi-archive"
        confirmLabel="Archiver le client"
        confirmVariant="danger"
        loading={isArchiving}
        error={archiveError}
        onConfirm={handleArchive}
        message={
          archiveTarget ? (
            <>
              Archiver le client{' '}
              <strong>
                {archiveTarget.name} — {archiveTarget.reference}
              </strong>{' '}
              ? Il sera marqué « Archivé » et retiré du portefeuille actif. Ses données et missions sont conservées
              (désactivation douce, jamais de suppression définitive).
            </>
          ) : undefined
        }
      />
    </PageContainer>
  );
};

export default PartnerClientsPage;
