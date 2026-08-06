/**
 * Navix Reports — Sparkline
 * --------------------------------------------------------------------------
 * Mini-graphique en barres (CSS pur, aucune bibliothèque externe) : aperçu
 * compact d'une tendance (historique d'un indicateur). Utilisé dans les
 * cartes de statistiques.
 *
 * Props :
 *   values   : nombre[] — série de valeurs
 *   variant  : variante de couleur (primary, success, danger…)  (défaut : 'primary')
 *   title    : libellé accessible (aria-label)                   (défaut : 'Tendance')
 *   height   : hauteur du graphique en pixels                    (défaut : 36)
 */
import './ReportChart.css';

const Sparkline = ({ values = [], variant = 'primary', title = 'Tendance', height = 36 }) => {
  if (values.length === 0) {
    return null;
  }

  const max = Math.max(...values.map(Number), 1);

  return (
    <div
      className="navix-report-chart__sparkline"
      style={{ height }}
      role="img"
      aria-label={title}
    >
      {values.map((value, index) => (
        <span
          key={index}
          className={`navix-report-chart__sparkbar navix-report-chart__sparkbar--${variant}`}
          style={{ height: `${Math.max(4, Math.round((Number(value) / max) * height))}px` }}
        />
      ))}
    </div>
  );
};

export default Sparkline;
