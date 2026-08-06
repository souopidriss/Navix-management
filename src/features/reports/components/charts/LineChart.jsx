/**
 * Navix Reports — LineChart
 * --------------------------------------------------------------------------
 * Graphique en courbes (SVG natif, aucune bibliothèque externe).
 * La courbe occupe toute la largeur du conteneur ; les libellés d'axe sont
 * rendus en HTML sous le plot et s'alignent exactement sur les points.
 *
 *  Props :
 *  data         : { labels: string[], datasets: [{ key, label, values, variant }] }
 *  height       : hauteur du plot en pixels            (défaut : 240)
 *  title        : libellé accessible (aria-label)      (défaut : 'Graphique en courbes')
 *  showDots     : affiche les points sur la courbe      (défaut : true)
 *  legend       : affiche la légende multi-séries      (défaut : true)
 *  emptyLabel   : message d'état vide
 */
import { computeLineGeometry, VARIANT_COLORS } from './chart.utils';
import './ReportChart.css';

const LineChart = ({
  data = { labels: [], datasets: [] },
  height = 240,
  title = 'Graphique en courbes',
  showDots = true,
  legend = true,
  emptyLabel = 'Aucune donnée pour la période.',
}) => {
  const labels = data.labels || [];
  const datasets = data.datasets || [];
  const allValues = datasets.flatMap((dataset) => dataset.values || []);
  const max = Math.max(...allValues.map(Number), 1);
  const { x, y, linePath, gridLines, viewW, viewH } = computeLineGeometry(labels);

  if (labels.length === 0) {
    return <p className="navix-report-chart__empty">{emptyLabel}</p>;
  }

  return (
    <div className="navix-report-chart">
      <div className="navix-report-chart__svg-wrap" style={{ height }} role="img" aria-label={title}>
        <svg viewBox={`0 0 ${viewW} ${viewH}`} preserveAspectRatio="none" className="navix-report-chart__svg" aria-hidden="true">
          {gridLines(max).map((gridY) => (
            <line key={gridY} x1="0" y1={gridY} x2={viewW} y2={gridY} className="navix-report-chart__grid" />
          ))}
          {datasets.map((dataset) => {
            const color = VARIANT_COLORS[dataset.variant] || VARIANT_COLORS.primary;
            return (
              <path key={`line-${dataset.key}`} d={linePath(dataset.values || [], max)} stroke={color} className="navix-report-chart__line" />
            );
          })}
          {showDots &&
            datasets.map((dataset) =>
              (dataset.values || []).map((value, index) => (
                <circle
                  key={`${dataset.key}-${index}`}
                  cx={x(index)}
                  cy={y(value, max)}
                  r="3.5"
                  fill={VARIANT_COLORS[dataset.variant] || VARIANT_COLORS.primary}
                  className="navix-report-chart__dot"
                />
              )),
            )}
        </svg>
        <div className="navix-report-chart__xlabels">
          {labels.map((label) => (
            <span key={label} className="navix-report-chart__xlabel">
              {label}
            </span>
          ))}
        </div>
      </div>
      {legend && datasets.length > 1 && (
        <div className="navix-report-chart__legend">
          {datasets.map((dataset) => (
            <span key={dataset.key} className="navix-report-chart__legend-key">
              <span className={`navix-report-chart__legend-dot navix-report-chart__legend-dot--${dataset.variant || 'primary'}`} />
              {dataset.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default LineChart;
