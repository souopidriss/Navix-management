/**
 * Navix Dashboard — CostBreakdownChart
 * --------------------------------------------------------------------------
 * Graphique en barres groupées (CSS pur) : répartition mensuelle des coûts
 * (carburant vs entretiens) sur les 6 derniers mois.
 */
import './DashChart.css';

const CostBreakdownChart = ({ data = [], formatValue, title = 'Coûts mensuels (6 mois)' }) => {
  const fuelValues = data.map((item) => Number(item.fuel || 0));
  const maintenanceValues = data.map((item) => Number(item.maintenance || 0));
  const max = Math.max(...fuelValues, ...maintenanceValues, 1);

  if (data.length === 0) {
    return <p className="navix-dash-chart__empty">Aucune donnée pour la période.</p>;
  }

  return (
    <div className="navix-dash-chart">
      <div className="navix-dash-chart__bars" role="img" aria-label={title}>
        {data.map((item) => {
          const fuelHeight = Math.max(8, Math.round((Number(item.fuel || 0) / max) * 150));
          const maintenanceHeight = Math.max(8, Math.round((Number(item.maintenance || 0) / max) * 150));
          return (
            <div key={item.month} className="navix-dash-chart__col">
              <span className="navix-dash-chart__value">
                {formatValue ? formatValue(item.total) : item.total}
              </span>
              <span className="navix-dash-chart__group">
                <span
                  className="navix-dash-chart__bar navix-dash-chart__bar--grouped navix-dash-chart__bar--info"
                  style={{ height: `${fuelHeight}px` }}
                />
                <span
                  className="navix-dash-chart__bar navix-dash-chart__bar--grouped navix-dash-chart__bar--warning"
                  style={{ height: `${maintenanceHeight}px` }}
                />
              </span>
              <span className="navix-dash-chart__label">{item.label}</span>
            </div>
          );
        })}
      </div>
      <div className="navix-dash-chart__legend">
        <span className="navix-dash-chart__legend-key">
          <span className="navix-dash-chart__legend-dot" style={{ background: 'var(--bs-info)' }} />
          Carburant
        </span>
        <span className="navix-dash-chart__legend-key">
          <span className="navix-dash-chart__legend-dot" style={{ background: 'var(--bs-warning)' }} />
          Entretiens
        </span>
      </div>
    </div>
  );
};

export default CostBreakdownChart;
