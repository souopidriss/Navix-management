/**
 * Navix Billing — CreditsPanel
 * --------------------------------------------------------------------------
 * Avoirs de facturation et remises disponibles, présentés en deux listes
 * compactes (utilisé sur le tableau de bord de facturation).
 */
import { Card } from '@/components/ui';
import { formatBillingDate } from '../constants';
import CreditBadge from './CreditBadge';
import DiscountBadge from './DiscountBadge';
import BillingAmount from './BillingAmount';
import './CreditsPanel.css';

const CreditsPanel = ({ credits = [], discounts = [], companyById = {} }) => (
  <div className="row g-3">
    <div className="col-lg-6">
      <Card
        title={
          <>
            <i className="bi bi-wallet2 me-1" aria-hidden="true" /> Avoirs ({credits.length})
          </>
        }
      >
        {credits.length === 0 ? (
          <p className="text-secondary mb-0">Aucun avoir enregistré.</p>
        ) : (
          <ul className="navix-credits-panel__list mb-0">
            {credits.map((credit) => (
              <li key={credit.id} className="navix-credits-panel__item">
                <div className="min-w-0">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <code>{credit.number}</code>
                    <CreditBadge status={credit.status} amount={credit.balance} currency={credit.currency} size="sm" />
                  </div>
                  <p className="navix-credits-panel__meta mb-0">
                    {companyById[credit.companyId]?.name ?? '—'} · expire le{' '}
                    {formatBillingDate(credit.expiresAt)}
                  </p>
                </div>
                <span className="navix-credits-panel__amount">
                  <BillingAmount value={credit.amount} currency={credit.currency} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>

    <div className="col-lg-6">
      <Card
        title={
          <>
            <i className="bi bi-percent me-1" aria-hidden="true" /> Remises ({discounts.length})
          </>
        }
      >
        {discounts.length === 0 ? (
          <p className="text-secondary mb-0">Aucune remise disponible.</p>
        ) : (
          <ul className="navix-credits-panel__list mb-0">
            {discounts.map((discount) => (
              <li key={discount.id} className="navix-credits-panel__item">
                <div className="min-w-0">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <code>{discount.code}</code>
                    <DiscountBadge discount={discount} size="sm" />
                  </div>
                  <p className="navix-credits-panel__meta mb-0">
                    {discount.isActive ? 'Active' : 'Inactive'} · expire le{' '}
                    {formatBillingDate(discount.expiresAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  </div>
);

export default CreditsPanel;
