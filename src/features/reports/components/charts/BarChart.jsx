/**
 * Navix Reports — BarChart
 * --------------------------------------------------------------------------
 * Graphique en barres groupées (CSS pur, aucune bibliothèque externe).
 * La hauteur de chaque barre est proportionnelle à la valeur maximale.
 *
 * Props :
 *   data         : { labels: string[], datasets: [{ key, label, values, variant }] }
 *   height       : hauteur du plot en pixels            (défaut : 220)
 *   formatValue  : (value) => string — formateur des valeurs (optionnel)
 *   title        : libellé accessible (aria-label)      (défaut : 'Graphique en barres')
 *   showValues   : affiche la valeur au-dessus des barres (défaut : true)
 *   legend       : affiche la légende multi-séries      (défaut : true)
 *   emptyLabel   : message d'état vide
 */
import './ReportChart.css';

const BarChart = ({
  data = { labels: [], datasets: [] },
  height = 220,
  formatValue,
  title = 'Graphique en barres',
  showValues = true,
  legend = true,
  emptyLabel = 'Aucune donnée pour la période.',
}) => {
  const labels = data.labels || [];
  const datasets = data.datasets || [];
  const allValues = datasets.flatMap((dataset) => dataset.values || []);
  const max = Math.max(...allValues.map(Number), 1);

  if (labels.length === 0) {
    return <p className="navix-report-chart__empty">{emptyLabel}</p>;
  }

  const plotHeight = Math.max(60, height - 32);
  const dense = datasets.length > 1;

  return (
    <div className="navix-report-chart">
      <div className="navix-report-chart__bars" style={{ height }} role="img" aria-label={title}>
        {labels.map((label, index) => (
          <div key={label} className="navix-report-chart__group">
            <div className="navix-report-chart__cols">
              {datasets.map((dataset) => {
                const value = Number(dataset.values?.[index] ?? 0);
                const barHeight = Math.max(6, Math.round((value / max) * plotHeight));
                return (
                  <div key={dataset.key} className="navix-report-chart__col">
                    {showValues && !dense && (
                      <span className="navix-report-chart__value">
                        {formatValue ? formatValue(value) : value}
                      </span>
                    )}
                    <span
                      className={`navix-report-chart__bar navix-report-chart__bar--${dataset.variant || 'primary'} ${
                        dense ? 'navix-report-chart__bar--dense' : ''
                      }`.trim()}
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                );
              })}
            </div>
            <span className="navix-report-chart__label">{label}</span>
          </div>
        ))}
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

export default BarChart;
