/**
 * Navix Reports — VariationBadge
 * --------------------------------------------------------------------------
 * Badge de variation : affiche l'évolution relative (en %) d'une métrique
 * avec un indicateur visuel de tendance (flèche) — thème clair/sombre via
 * les utilitaires Bootstrap (text-success / text-danger / text-secondary).
 *
 * Props :
 *   variation : nombre|null — variation relative en %
 *   trend     : 'up' | 'down' | 'neutral' — sens déjà calculé (optionnel)
 *   invert    : booléen — inverse la lecture (coût en baisse = amélioration)
 *   label     : libellé personnalisé (défaut : formatVariation(variation))
 *   title     : infobulle (optionnel)
 *   className : classes additionnelles
 */
import { formatVariation, getVariationDirection } from '../constants';
import './ReportComponents.css';

const TREND_ICONS = {
  up: 'bi-arrow-up-right',
  down: 'bi-arrow-down-right',
  neutral: 'bi-arrow-right',
};

const VariationBadge = ({ variation, trend, invert = false, label, title, className }) => {
  const direction = trend || getVariationDirection(variation, { invert });
  const isFinite = Number.isFinite(Number(variation));
  const resolvedTrend = isFinite ? direction : 'neutral';

  return (
    <span
      className={`navix-report-variation navix-report-variation--${resolvedTrend} ${className || ''}`.trim()}
      title={title ?? (isFinite ? formatVariation(variation) : undefined)}
    >
      <i className={`bi ${isFinite ? TREND_ICONS[resolvedTrend] : 'bi-dash'}`} aria-hidden="true" />
      {label ?? formatVariation(variation)}
    </span>
  );
};

export default VariationBadge;
