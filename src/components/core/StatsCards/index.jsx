/**
 * Navix Core — StatsCards
 * --------------------------------------------------------------------------
 * Grille responsive de cartes de métriques. Un descripteur par carte :
 * label, value, icon, variant, variation, trend, trendLabel. Le rendu est
 * délégué à MetricCard ; le nombre de colonnes s'adapte à l'écran.
 *
 * Props :
 *   stats      : tableau de descripteurs (mêmes props que MetricCard, + key)
 *   columns    : nombre de colonnes sur desktop (2 | 3 | 4)   (défaut : 4)
 *   loading    : booléen — squelettes des cartes
 *   className  : classes additionnelles
 *
 * Exemple :
 *   <StatsCards
 *     loading={isLoading}
 *     stats={[
 *       { key: 'total', label: 'Total', value: '1 234', icon: 'bi-cash', variant: 'success' },
 *       { key: 'pending', label: 'En attente', value: '12', icon: 'bi-hourglass', variant: 'warning' },
 *     ]}
 *   />
 */
import { memo } from 'react';
import MetricCard from '../MetricCard';
import './StatsCards.css';

const GRID_COLUMNS = {
  2: 'col-md-6 col-lg-6',
  3: 'col-md-4 col-lg-4',
  4: 'col-6 col-md-3 col-lg-3',
};

const StatsCards = ({ stats = [], columns = 4, loading = false, className, ...rest }) => (
  <div className={`row g-3 navix-stats ${className || ''}`.trim()} {...rest}>
    {stats.map(({ key, ...metric }) => (
      <div key={key} className={GRID_COLUMNS[columns] || GRID_COLUMNS[4]}>
        <MetricCard loading={loading} {...metric} />
      </div>
    ))}
  </div>
);

export default memo(StatsCards);
