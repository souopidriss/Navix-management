/**
 * Navix Dashboard — FuelTrendChart
 * --------------------------------------------------------------------------
 * Graphique en barres (CSS pur) du coût mensuel de carburant sur les
 * 6 derniers mois.
 */
import './DashChart.css';

const FuelTrendChart = ({ data = [], formatValue, title = 'Coût carburant (6 mois)' }) => {
  const values = data.map((item) => Number(item.totalCost || 0));
  const max = Math.max(...values, 1);

  if (data.length === 0) {
    return <p className="navix-dash-chart__empty">Aucune donnée pour la période.</p>;
  }

  return (
    <div className="navix-dash-chart">
      <div className="navix-dash-chart__bars" role="img" aria-label={title}>
        {data.map((item) => {
          const height = Math.max(8, Math.round((Number(item.totalCost || 0) / max) * 160));
          return (
            <div key={item.month} className="navix-dash-chart__col">
              <span className="navix-dash-chart__value">
                {formatValue ? formatValue(item.totalCost) : item.totalCost}
              </span>
              <span className="navix-dash-chart__bar navix-dash-chart__bar--info" style={{ height: `${height}px` }} />
              <span className="navix-dash-chart__label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FuelTrendChart;
