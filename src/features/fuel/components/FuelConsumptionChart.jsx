/**
 * Navix Fuel — FuelConsumptionChart
 * --------------------------------------------------------------------------
 * Graphique en barres (CSS pur, aucune bibliothèque externe) de l'évolution
 * mensuelle du coût total ou du volume consommé.
 *
 * Props :
 *   data        : liste d'items { month, label, totalCost, quantity }
 *   metric      : 'totalCost' | 'quantity' — valeur à représenter
 *   formatValue : (value) => string — formateur de la valeur (optionnel)
 *   title       : libellé accessible du graphique
 */
import './FuelConsumptionChart.css';

const FuelConsumptionChart = ({ data = [], metric = 'totalCost', formatValue, title = 'Évolution mensuelle' }) => {
  const values = data.map((item) => Number(item[metric] || 0));
  const max = Math.max(...values, 1);

  if (data.length === 0) {
    return <p className="navix-fuel-chart__empty mb-0">Aucune donnée pour la période.</p>;
  }

  return (
    <div className="navix-fuel-chart">
      <div className="navix-fuel-chart__bars" role="img" aria-label={title}>
        {data.map((item) => {
          const height = Math.max(8, Math.round((Number(item[metric] || 0) / max) * 160));
          return (
            <div key={item.month} className="navix-fuel-chart__col">
              <span className="navix-fuel-chart__value">
                {formatValue ? formatValue(item[metric]) : item[metric]}
              </span>
              <span className="navix-fuel-chart__bar" style={{ height: `${height}px` }} />
              <span className="navix-fuel-chart__label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FuelConsumptionChart;
