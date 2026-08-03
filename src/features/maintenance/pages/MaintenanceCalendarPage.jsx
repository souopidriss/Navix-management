/**
 * Navix Maintenance — MaintenanceCalendarPage
 * --------------------------------------------------------------------------
 * Calendrier mensuel des entretiens : chargement des événements (prévus +
 * prochaines échéances) via le service, navigation mois précédent / suivant,
 * clic sur un événement → détail de l'entretien.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import { ROUTES, maintenanceDetailPath } from '@/routes/route.constants';
import { useVehiclesStore } from '@/features/vehicles';
import { useMaintenanceStore } from '../store';
import { MaintenanceCalendar } from '../components';
import './MaintenanceCalendarPage.css';

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const MaintenanceCalendarPage = () => {
  const navigate = useNavigate();

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const from = toDateKey(month);
  const to = toDateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  const calendarEvents = useMaintenanceStore((state) => state.calendarEvents);
  const isLoading = useMaintenanceStore((state) => state.isLoading);
  const error = useMaintenanceStore((state) => state.error);
  const fetchCalendar = useMaintenanceStore((state) => state.fetchCalendar);
  const clearError = useMaintenanceStore((state) => state.clearError);

  const vehicles = useVehiclesStore((state) => state.vehicles);
  const fetchVehicles = useVehiclesStore((state) => state.fetchVehicles);

  useEffect(() => {
    fetchCalendar(from, to);
  }, [fetchCalendar, from, to]);

  useEffect(() => {
    if (vehicles.length === 0) {
      fetchVehicles();
    }
  }, [vehicles.length, fetchVehicles]);

  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  const handlePrev = () => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Calendrier entretiens — Navix Management</title>
      </Helmet>

      <PageHeader
        title="Calendrier des entretiens"
        subtitle="Vue mensuelle des interventions prévues et des prochaines échéances."
        icon="bi-calendar3"
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Entretiens', to: ROUTES.ENTRETIENS },
          { label: 'Calendrier' },
        ]}
        actions={
          <Button variant="outline" icon="bi-arrow-left" onClick={() => navigate(ROUTES.ENTRETIENS)}>
            Retour
          </Button>
        }
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      {isLoading && calendarEvents.length === 0 ? (
        <LoadingState variant="cards" rows={3} label="Chargement du calendrier…" />
      ) : (
        <>
          <MaintenanceCalendar
            month={month}
            events={calendarEvents}
            vehicleById={vehicleById}
            onPrev={handlePrev}
            onNext={handleNext}
            onEventClick={(id) => navigate(maintenanceDetailPath(id))}
          />

          <p className="text-secondary small navix-maint-calendar__legend">
            Cliquez sur une puce pour ouvrir le détail de l’entretien. Les échéances du jour sont
            mises en évidence.
          </p>
        </>
      )}
    </PageContainer>
  );
};

export default MaintenanceCalendarPage;
