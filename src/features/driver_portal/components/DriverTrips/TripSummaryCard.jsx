/**
 * Navix Driver Portal — TripSummaryCard
 * --------------------------------------------------------------------------
 * Bilan d'un trajet terminé : kilométrages, distance réelle, durée et
 * vitesse moyenne. Affiché sur le détail d'un trajet clôturé.
 */
import { memo } from 'react';
import { formatNumber } from '@/utils/format';
import './DriverTrips.css';

const VARIANT_ICON_BG = {
  primary: 'var(--navix-primary-muted, rgba(13,110,253,0.12))',
  info: 'rgba(77,163,255,0.12)',
  success: 'rgba(63,203,143,0.12)',
  warning: 'rgba(245,165,36,0.12)',
};

const VARIANT_COLOR = {
  primary: 'var(--navix-primary, #0d6efd)',
  info: 'var(--navix-info, #4da3ff)',
  success: 'var(--navix-success, #3fcb8f)',
  warning: 'var(--navix-warning, #f5a524)',
};

const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '—';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours} h ${String(rest).padStart(2, '0')}` : `${rest} min`;
};

const SummaryTile = ({ icon, color, value, label }) => (
  <div className="navix-trip-summary-tile">
    <span
      className="navix-trip-summary-tile__icon"
      style={{ background: VARIANT_ICON_BG[color] || VARIANT_ICON_BG.primary, color: VARIANT_COLOR[color] }}
    >
      <i className={`bi ${icon}`} aria-hidden="true" />
    </span>
    <div>
      <div className="navix-trip-summary-tile__value">{value}</div>
      <div className="navix-trip-summary-tile__label">{label}</div>
    </div>
  </div>
);

const TripSummaryCard = ({ trip }) => {
  const distanceDelta = trip.actualDistance
    ? trip.actualDistance - (Number(trip.plannedDistance) || 0)
    : null;

  const tiles = [
    {
      icon: 'bi-speedometer',
      color: 'primary',
      value: trip.departureMileage ? `${formatNumber(trip.departureMileage)} km` : '—',
      label: 'Kilométrage départ',
    },
    {
      icon: 'bi-speedometer2',
      color: 'info',
      value: trip.arrivalMileage ? `${formatNumber(trip.arrivalMileage)} km` : '—',
      label: 'Kilométrage arrivée',
    },
    {
      icon: 'bi-signpost-2',
      color: 'success',
      value: trip.actualDistance ? `${formatNumber(trip.actualDistance)} km` : '—',
      label: 'Distance réelle',
    },
    {
      icon: 'bi-hourglass-split',
      color: 'warning',
      value: formatDuration(trip.actualDuration),
      label: 'Durée réelle',
    },
    {
      icon: 'bi-speedometer2',
      color: 'info',
      value: trip.averageSpeed ? `${formatNumber(trip.averageSpeed)} km/h` : '—',
      label: 'Vitesse moyenne',
    },
    {
      icon: 'bi-graph-up-arrow',
      color: 'primary',
      value: distanceDelta === null ? '—' : `${distanceDelta >= 0 ? '+' : ''}${formatNumber(distanceDelta)} km`,
      label: 'Écart vs planifiée',
    },
  ];

  return (
    <div className="navix-card p-4 mb-4">
      <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
        <i className="bi bi-check2-circle text-success" aria-hidden="true" />
        Bilan du trajet
      </h2>
      <div className="navix-trip-summary-grid">
        {tiles.map((tile) => (
          <SummaryTile key={tile.label} {...tile} />
        ))}
      </div>
    </div>
  );
};

export default memo(TripSummaryCard);
