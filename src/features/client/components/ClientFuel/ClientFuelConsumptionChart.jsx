/**
 * Navix Client Fuel — ClientFuelConsumptionChart
 * --------------------------------------------------------------------------
 * Graphique en barres (CSS pur, aucune bibliothèque externe) de l'évolution
 * mensuelle du coût total ou du volume consommé sur les 6 derniers mois.
 *
 * Props :
 *   data        : liste d'items { month, label, totalCost, quantity }
 *   metric      : 'totalCost' | 'quantity' — valeur à représenter
 *   formatValue : (value) => string — formateur de la valeur (optionnel)
 *   title       : libellé accessible du graphique
 */
import '../ClientMaintenance/ClientMaintenance.css';

const ClientFuelConsumptionChart = ({
  data = [],
  metric = 'totalCost',
  formatValue,
  title = 'Évolution mensuelle',
}) => {
  const values = data.map((item) => Number(item[metric] || 0));
  const max = Math.max(...values, 1);

  if (data.length === 0) {
    return <p className="text-secondary mb-0">Aucune donnée pour la période.</p>;
  }

  return (
    <div className="navix-client-bars" role="img" aria-label={title}>
      {data.map((item) => {
        const height = Math.max(8, Math.round((Number(item[metric] || 0) / max) * 110));
        const isCurrent = item.isCurrent;
        return (
          <div key={item.month} className="navix-client-bars__col">
            <span className="navix-client-bars__value">
              {formatValue ? formatValue(item[metric]) : item[metric]}
            </span>
            <span
              className={`navix-client-bars__bar ${isCurrent ? '' : 'navix-client-bars__bar--muted'}`}
              style={{ height: `${height}px` }}
            />
            <span className="navix-client-bars__label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ClientFuelConsumptionChart;
