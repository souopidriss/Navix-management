/**
 * Navix Reports — DonutChart
 * --------------------------------------------------------------------------
 * Graphique en anneau (CSS pur via conic-gradient, aucune bibliothèque
 * externe). Le centre affiche le total ; la légende liste chaque segment
 * avec sa part (valeur + pourcentage).
 *
 * Props :
 *   data         : { labels: string[], values: number[], variants: string[] }
 *   size         : diamètre de l'anneau en pixels        (défaut : 180)
 *   title        : libellé accessible (aria-label)       (défaut : 'Répartition')
 *   formatValue  : (value) => string — formateur des valeurs (optionnel)
 *   totalLabel   : libellé sous le total au centre       (défaut : 'Total')
 *   emptyLabel   : message d'état vide
 */
import { VARIANT_COLORS } from './chart.utils';
import './ReportChart.css';

const DonutChart = ({
  data = { labels: [], values: [], variants: [] },
  size = 180,
  title = 'Répartition',
  formatValue,
  totalLabel = 'Total',
  emptyLabel = 'Aucune donnée pour la période.',
}) => {
  const labels = data.labels || [];
  const values = data.values || [];
  const variants = data.variants || [];
  const total = values.reduce((sum, value) => sum + Number(value || 0), 0);

  if (total <= 0) {
    return <p className="navix-report-chart__empty">{emptyLabel}</p>;
  }

  const segments = [];
  let cursor = 0;
  values.forEach((value, index) => {
    const numeric = Number(value || 0);
    if (numeric <= 0) return;
    const from = cursor;
    cursor += (numeric / total) * 360;
    segments.push({
      key: labels[index] ?? `segment-${index}`,
      label: labels[index] ?? '—',
      value: numeric,
      from,
      to: cursor,
      variant: variants[index] || 'primary',
    });
  });

  const gradient = segments
    .map((segment) => `${VARIANT_COLORS[segment.variant] || VARIANT_COLORS.primary} ${segment.from}deg ${segment.to}deg`)
    .join(', ');

  return (
    <div className="navix-report-chart">
      <div className="navix-report-chart__donut" role="img" aria-label={title}>
        <div
          className="navix-report-chart__donut-ring"
          style={{ width: size, height: size, background: `conic-gradient(${gradient})` }}
        >
          <div className="navix-report-chart__donut-hole">
            <span className="navix-report-chart__donut-total">{formatValue ? formatValue(total) : total}</span>
            <span className="navix-report-chart__donut-caption">{totalLabel}</span>
          </div>
        </div>
        <ul className="navix-report-chart__donut-list list-unstyled mb-0">
          {segments.map((segment) => (
            <li key={segment.key} className="navix-report-chart__donut-item">
              <span
                className="navix-report-chart__legend-dot"
                style={{ background: VARIANT_COLORS[segment.variant] || VARIANT_COLORS.primary }}
              />
              <span className="navix-report-chart__donut-name">{segment.label}</span>
              <span className="navix-report-chart__donut-value">
                {formatValue ? formatValue(segment.value) : segment.value}
                {' · '}
                {Math.round((segment.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DonutChart;
