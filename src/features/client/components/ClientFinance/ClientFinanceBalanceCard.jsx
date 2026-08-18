/**
 * Navix Client Finance — ClientFinanceBalanceCard
 * --------------------------------------------------------------------------
 * Grande carte « SOLDE DISPONIBLE » du centre financier : solde en FCFA,
 * dernière mise à jour et variation du mois (entrées − sorties). Données
 * simulées (mode mock) — aucune opération réelle.
 */
import { Card } from '@/components/ui';
import { formatNumber, formatDateTime } from '@/utils/format';
import { FCFA_LABEL } from '../../constants/client.constants';

const ClientFinanceBalanceCard = ({ wallet = null, statistics = null }) => {
  if (!wallet) return null;

  const balance = Number(wallet.balance) || 0;
  const variation = Number(statistics?.variationMonth) || 0;
  const isUp = variation >= 0;

  return (
    <Card className="navix-client-finance__balance h-100">
      <div className="position-relative d-flex flex-column gap-2">
        <span className="navix-client-finance__balance-label">
          <i className="bi bi-wallet2" aria-hidden="true" />
          Solde disponible
        </span>

        <div className="d-flex align-items-baseline flex-wrap">
          <span className="navix-client-finance__balance-value">
            {formatNumber(balance)}
            <span className="navix-client-finance__balance-currency">{FCFA_LABEL}</span>
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className={`navix-client-finance__variation ${isUp ? 'navix-client-finance__variation--up' : 'navix-client-finance__variation--down'}`}>
            <i className={`bi ${isUp ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill'}`} aria-hidden="true" />
            {isUp ? '+' : ''}
            {formatNumber(variation)} {FCFA_LABEL} ce mois
          </span>
        </div>

        <span className="navix-client-finance__balance-updated mt-1">
          <i className="bi bi-clock-history me-1" aria-hidden="true" />
          Dernière mise à jour : {formatDateTime(wallet.updatedAt)}
        </span>
      </div>
    </Card>
  );
};

export default ClientFinanceBalanceCard;
