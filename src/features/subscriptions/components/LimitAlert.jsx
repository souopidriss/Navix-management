/**
 * Navix Subscriptions — LimitAlert
 * --------------------------------------------------------------------------
 * Alerte de limite d'usage : signale les ressources au niveau « attention »
 * (≥ 80 %) et « critique » (≥ 90 %). Affiche un message par ressource, par
 * exemple : « Votre entreprise utilise 90 % de la limite de véhicules. »
 */
import { Alert } from '@/components/ui';

const rowMessage = (row) => {
  const percent = Math.round((row.ratio || 0) * 100);
  const label = row.label.toLowerCase();
  if (percent >= 100) {
    return `Votre entreprise a atteint la limite de ${label} (${percent} %).`;
  }
  return `Votre entreprise utilise ${percent} % de la limite de ${label}.`;
};

const LimitAlert = ({ rows = [] }) => {
  const affected = rows.filter(
    (row) => row.ratio !== null && ['warning', 'critical'].includes(row.level?.variant),
  );

  if (affected.length === 0) return null;

  const hasCritical = affected.some((row) => row.level?.variant === 'critical');
  const variant = hasCritical ? 'danger' : 'warning';
  const icon = hasCritical ? 'bi-exclamation-octagon-fill' : 'bi-exclamation-triangle-fill';

  return (
    <Alert variant={variant} icon={icon} className="mb-3" role="alert">
      {affected.length === 1 ? (
        rowMessage(affected[0])
      ) : (
        <>
          <p className="mb-2">
            {hasCritical
              ? 'Certaines limites de votre plan sont atteintes ou dépassées.'
              : 'Plusieurs limites de votre plan approchent du plafond.'}
          </p>
          <ul className="mb-0">
            {affected.map((row) => (
              <li key={row.limitKey}>{rowMessage(row)}</li>
            ))}
          </ul>
        </>
      )}
    </Alert>
  );
};

export default LimitAlert;
