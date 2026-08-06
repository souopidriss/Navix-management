/**
 * Navix Reports — TopItems
 * --------------------------------------------------------------------------
 * Liste des points saillants d'un rapport (top 5) : rang, libellé,
 * sous-libellé et valeur.
 *
 * Props :
 *   items       : [{ key, label, value, sublabel }]
 *   title       : titre de la carte                     (défaut : 'Points saillants')
 *   formatValue : (value) => string — formateur de la valeur
 */
import { Card } from '@/components/ui';
import { formatReportNumber } from '../constants';

const TopItems = ({ items = [], title = 'Points saillants', formatValue }) => {
  if (items.length === 0) return null;

  return (
    <Card title={title}>
      <ul className="list-group list-group-flush">
        {items.map((item, index) => (
          <li key={item.key} className="list-group-item d-flex align-items-center gap-3 px-0">
            <span className="badge rounded-pill text-bg-secondary">{index + 1}</span>
            <span className="flex-grow-1 text-truncate">{item.label}</span>
            {item.sublabel && <span className="small text-secondary text-nowrap">{item.sublabel}</span>}
            <strong className="text-nowrap">{formatValue ? formatValue(item.value) : formatReportNumber(item.value)}</strong>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default TopItems;
