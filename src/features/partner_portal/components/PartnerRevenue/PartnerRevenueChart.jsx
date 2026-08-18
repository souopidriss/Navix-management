/**
 * Navix Partner Portal — PartnerRevenueChart (PROMPT 070 §8)
 * --------------------------------------------------------------------------
 * Graphique en barres CSS pures : Revenus bruts / Commissions / Revenus nets
 * sur les 6 derniers mois. Aucune dépendance graphique externe.
 */
import { Card } from '@/components/ui';
import { formatNumber } from '@/utils/format';
import { FCFA_LABEL } from '../../constants/partner.constants';
import '../PartnerFinance/PartnerFinance.css';

const barHeight = (value, max) => {
  if (!max || !value) return 4;
  return Math.max(4, Math.round((Number(value) / max) * 150));
};

const PartnerRevenueChart = ({ evolution }) => {
  if (!evolution) return null;

  const { labels, grossValues, commissionValues, netValues } = evolution;
  const maxGross = Math.max(...grossValues, 1);
  const maxNet = Math.max(...netValues, 1);
  const maxAll = Math.max(maxGross, maxNet, 1);

  return (
    <Card
      className="h-100"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-graph-up-arrow text-info" aria-hidden="true" />
          <span>Évolution des revenus</span>
        </span>
      }
    >
      <div className="navix-client-finance__evolution" role="img" aria-label="Évolution des revenus sur 6 mois">
        <div className="navix-client-finance__evolution-bars">
          {labels.map((label, index) => (
            <div
              key={label}
              className="navix-client-finance__evolution-col"
              title={`${label} — Brut ${formatNumber(grossValues[index])} ${FCFA_LABEL} · Commissions ${formatNumber(commissionValues[index])} ${FCFA_LABEL} · Net ${formatNumber(netValues[index])} ${FCFA_LABEL}`}
            >
              <span className="navix-dash-chart__value">{formatNumber(grossValues[index])}</span>
              <span className="navix-client-finance__evolution-group">
                <span className="navix-client-finance__bar navix-client-finance__bar--in" style={{ height: `${barHeight(grossValues[index], maxAll)}px` }} />
                <span className="navix-client-finance__bar navix-client-finance__bar--out" style={{ height: `${barHeight(commissionValues[index], maxAll)}px` }} />
                <span className="navix-client-finance__bar navix-client-finance__bar--solde" style={{ height: `${barHeight(netValues[index], maxAll)}px` }} />
              </span>
              <span className="navix-dash-chart__label">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="navix-dash-chart__legend">
        <span className="navix-dash-chart__legend-key">
          <span className="navix-dash-chart__legend-dot" style={{ background: 'var(--bs-success)' }} />
          Revenus bruts
        </span>
        <span className="navix-dash-chart__legend-key">
          <span className="navix-dash-chart__legend-dot" style={{ background: 'var(--bs-danger)' }} />
          Commissions
        </span>
        <span className="navix-dash-chart__legend-key">
          <span className="navix-dash-chart__legend-dot" style={{ background: 'var(--bs-info)' }} />
          Revenus nets ({FCFA_LABEL})
        </span>
      </div>
    </Card>
  );
};

export default PartnerRevenueChart;
