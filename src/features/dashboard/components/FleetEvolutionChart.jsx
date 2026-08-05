/**
 * Navix Dashboard — FleetEvolutionChart
 * --------------------------------------------------------------------------
 * Graphique en barres (CSS pur) de l'évolution de la taille du parc sur les
 * 6 derniers mois.
 */
import './DashChart.css';

const FleetEvolutionChart = ({ data = [], title = 'Évolution du parc (6 mois)' }) => {
  const values = data.map((item) => Number(item.total || 0));
  const max = Math.max(...values, 1);

  if (data.length === 0) {
    return <p className="navix-dash-chart__empty">Aucune donnée pour la période.</p>;
  }

  return (
    <div className="navix-dash-chart">
      <div className="navix-dash-chart__bars" role="img" aria-label={title}>
        {data.map((item) => {
          const height = Math.max(8, Math.round((Number(item.total || 0) / max) * 160));
          return (
            <div key={item.month} className="navix-dash-chart__col">
              <span className="navix-dash-chart__value">{item.total}</span>
              <span className="navix-dash-chart__bar navix-dash-chart__bar--primary" style={{ height: `${height}px` }} />
              <span className="navix-dash-chart__label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FleetEvolutionChart;
