/**
 * Navix Partner Portal — PartnerCalendarPage (PROMPT 076)
 * ─────────────────────────────────────────────────────
 * Calendrier Opérationnel & Planification
 * Visualisation read-only de tous les événements métier du partenaire.
 *
 * Sources agrégées : missions, demandes, contrats, documents,
 * factures, maintenance, alertes.
 */
import { Helmet } from 'react-helmet-async';
import { PageContainer, PageHeader, LoadingState, ErrorState } from '@/components/core';
import { usePartnerCalendar } from '../hooks/usePartnerCalendar';
import {
  PartnerCalendar,
  PartnerCalendarLegend,
  PartnerCalendarFilters,
} from '../components/PartnerCalendar';
import '../components/PartnerCalendar/PartnerCalendar.css';

const PartnerCalendarPage = () => {
  const {
    currentDate,
    type,
    setType,
    search,
    setSearch,
    events,
    summary,
    isLoading,
    error,
    monthTitle,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    refetch,
  } = usePartnerCalendar();

  const handleRetry = () => {
    refetch();
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Calendrier — Espace Partenaire</title>
      </Helmet>

      <PageHeader
        title="Calendrier"
        subtitle="Visualisez vos missions, échéances et événements à venir."
        actions={[
          {
            label: 'Actualiser',
            icon: 'bi-arrow-clockwise',
            onClick: handleRetry,
            variant: 'secondary',
          },
        ]}
      />

      <div style={{ marginBottom: '1rem' }}>
        <PartnerCalendarFilters
          type={type}
          onTypeChange={setType}
          search={search}
          onSearchChange={setSearch}
        />
      </div>

      {isLoading && <LoadingState label="Chargement du calendrier..." />}
      {error && !isLoading && (
        <ErrorState title="Erreur de chargement" description={error} retry={handleRetry} />
      )}

      {!isLoading && !error && (
        <>
          <PartnerCalendar
            currentDate={currentDate}
            events={events}
            onPrev={goToPrevMonth}
            onNext={goToNextMonth}
            onToday={goToToday}
            monthTitle={monthTitle}
          />

          <div style={{ marginTop: '1rem' }}>
            <PartnerCalendarLegend summary={summary} />
          </div>

          {events.length === 0 && (
            <div className="partner-calendar-empty" style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--bs-secondary-color)',
              fontSize: '0.875rem',
            }}>
              <i className="bi bi-calendar-x" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }} />
              Aucun événement pour cette période.
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default PartnerCalendarPage;
