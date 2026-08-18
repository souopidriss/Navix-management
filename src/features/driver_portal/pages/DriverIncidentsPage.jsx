/**
 * Navix Driver — DriverIncidentsPage
 * --------------------------------------------------------------------------
 * Incidents signalés par le chauffeur : statistiques, filtres, tableau et
 * signalement d'un nouvel incident via une modale de formulaire.
 */
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { formatNumber } from '@/utils/format';
import { Button } from '@/components/ui';
import {
  PageContainer,
  PageHeader,
  DataTable,
  StatsCards,
  FilterBar,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusBadge,
  FormModal,
} from '@/components/core';
import {
  INCIDENT_TYPES,
  INCIDENT_STATUSES,
  INCIDENT_SEVERITIES,
  getIncidentType,
  getIncidentStatus,
  getIncidentSeverity,
} from '../constants/driver.constants';
import { useDriverIncidents } from '../hooks/useDriverIncidents';

const toOptions = (map) => Object.entries(map).map(([value, meta]) => ({ value, label: meta.label }));

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const DriverIncidentsPage = () => {
  const { incidents, isLoading, error, refetch, createIncident, isSubmitting, submitError } = useDriverIncidents();

  const [filters, setFilters] = useState({ type: '', status: '', severity: '' });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: 'panne',
    severity: 'medium',
    date: todayKey(),
    time: '',
    location: '',
    description: '',
  });

  const filtered = useMemo(
    () =>
      incidents.filter((incident) => {
        if (filters.type && incident.type !== filters.type) return false;
        if (filters.status && incident.status !== filters.status) return false;
        if (filters.severity && incident.severity !== filters.severity) return false;
        return true;
      }),
    [incidents, filters],
  );

  const hasActiveFilters = Boolean(filters.type || filters.status || filters.severity);
  const resetFilters = () => setFilters({ type: '', status: '', severity: '' });

  const stats = useMemo(
    () => [
      {
        key: 'total',
        label: 'Incidents',
        value: formatNumber(incidents.length),
        icon: 'bi-shield-exclamation',
        variant: 'danger',
      },
      {
        key: 'reported',
        label: 'Signalés',
        value: formatNumber(incidents.filter((incident) => incident.status === 'reported').length),
        icon: 'bi-flag',
        variant: 'warning',
      },
      {
        key: 'investigating',
        label: 'En cours',
        value: formatNumber(incidents.filter((incident) => incident.status === 'investigating').length),
        icon: 'bi-search',
        variant: 'primary',
      },
      {
        key: 'resolved',
        label: 'Résolus',
        value: formatNumber(
          incidents.filter((incident) => incident.status === 'resolved' || incident.status === 'closed').length,
        ),
        icon: 'bi-check2-circle',
        variant: 'success',
      },
    ],
    [incidents],
  );

  const openModal = () => {
    setForm({ type: 'panne', severity: 'medium', date: todayKey(), time: '', location: '', description: '' });
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.location.trim() || !form.description.trim()) {
      toast.error('Le lieu et la description sont requis.');
      return;
    }

    const result = await createIncident(form);
    if (result.success) {
      toast.success(result.message || 'Incident signalé avec succès.');
      setOpen(false);
    } else {
      toast.error(result.error || 'Impossible de signaler l\u2019incident.');
    }
  };

  const breadcrumbs = [{ label: 'Espace Chauffeur' }, { label: 'Incidents' }];

  if (isLoading && !incidents.length) {
    return (
      <PageContainer>
        <LoadingState variant="table" rows={6} cols={5} label="Chargement des incidents…" />
      </PageContainer>
    );
  }

  if (error && !incidents.length) {
    return (
      <PageContainer>
        <ErrorState
          title="Incidents indisponibles"
          description="Impossible de charger vos incidents pour le moment."
          retry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>Mes incidents — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Mes incidents"
        subtitle="Signalez et suivez vos incidents de la route."
        icon="bi-shield-exclamation"
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="primary" icon="bi-plus-lg" onClick={openModal}>
            Signaler un incident
          </Button>
        }
      />

      <StatsCards stats={stats} loading={isLoading && !incidents.length} columns={4} />

      <div className="my-3">
        <FilterBar
          fields={[
            { key: 'type', type: 'select', label: 'Type', allLabel: 'Tous les types', options: toOptions(INCIDENT_TYPES) },
            { key: 'severity', type: 'select', label: 'Sévérité', allLabel: 'Toutes', options: toOptions(INCIDENT_SEVERITIES) },
            { key: 'status', type: 'select', label: 'Statut', allLabel: 'Tous les statuts', options: toOptions(INCIDENT_STATUSES) },
          ]}
          values={filters}
          onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="bi-shield-exclamation"
          title="Aucun incident"
          description={
            incidents.length === 0
              ? 'Vous n\u2019avez signalé aucun incident.'
              : 'Aucun incident ne correspond à vos critères.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          ariaLabel="Liste de mes incidents"
          columns={[
            { key: 'incidentNumber', label: 'N°', render: (incident) => <span className="fw-semibold">{incident.incidentNumber}</span> },
            {
              key: 'type',
              label: 'Type',
              render: (incident) => {
                const meta = getIncidentType(incident.type);
                return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} dot={false} />;
              },
            },
            {
              key: 'severity',
              label: 'Sévérité',
              render: (incident) => {
                const meta = getIncidentSeverity(incident.severity);
                return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} dot={false} />;
              },
            },
            { key: 'date', label: 'Date', render: (incident) => incident.date },
            { key: 'location', label: 'Lieu', render: (incident) => incident.location || '—' },
            {
              key: 'status',
              label: 'Statut',
              render: (incident) => {
                const meta = getIncidentStatus(incident.status);
                return <StatusBadge variant={meta.variant} label={meta.label} icon={meta.icon} />;
              },
            },
          ]}
          rows={filtered}
          rowKey="id"
        />
      )}

      <FormModal
        open={open}
        onClose={() => setOpen(false)}
        title="Signaler un incident"
        subtitle="Décrivez l\u2019incident pour permettre à votre gestionnaire de flotte d\u2019agir."
        icon="bi-shield-exclamation"
        size="lg"
        onSubmit={handleSubmit}
        loading={isSubmitting}
        submitLabel="Signaler"
        submitIcon="bi-flag"
        error={submitError || undefined}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="incident-type" className="form-label">
              Type d\u2019incident
            </label>
            <select
              id="incident-type"
              className="form-select"
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
            >
              {toOptions(INCIDENT_TYPES).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="incident-severity" className="form-label">
              Sévérité
            </label>
            <select
              id="incident-severity"
              className="form-select"
              value={form.severity}
              onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value }))}
            >
              {toOptions(INCIDENT_SEVERITIES).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="incident-date" className="form-label">
              Date
            </label>
            <input
              id="incident-date"
              type="date"
              className="form-control"
              value={form.date}
              max={todayKey()}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="incident-time" className="form-label">
              Heure
            </label>
            <input
              id="incident-time"
              type="time"
              className="form-control"
              value={form.time}
              onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
            />
          </div>

          <div className="col-12">
            <label htmlFor="incident-location" className="form-label">
              Lieu
            </label>
            <input
              id="incident-location"
              type="text"
              className="form-control"
              placeholder="Ex. N3 — péage de Bonabéri, Douala"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              required
            />
          </div>

          <div className="col-12">
            <label htmlFor="incident-description" className="form-label">
              Description
            </label>
            <textarea
              id="incident-description"
              className="form-control"
              rows={4}
              placeholder="Décrivez les circonstances de l\u2019incident…"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              required
            />
          </div>
        </div>
      </FormModal>
    </PageContainer>
  );
};

export default DriverIncidentsPage;
