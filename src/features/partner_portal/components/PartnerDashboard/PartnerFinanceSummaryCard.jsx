/**
 * Navix Partner Portal — PartnerFinanceSummaryCard
 * --------------------------------------------------------------------------
 * Résumé financier synthétique (FCFA) du partenaire : solde disponible,
 * entrées et sorties du mois. Lien « Voir mes finances » → /partner/finance.
 */
import { Card } from '@/components/ui';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/routes/route.constants';
import '../PartnerDashboard/PartnerDashboard.css';

const PartnerFinanceSummaryCard = ({ summary = null }) => {
  if (!summary) return null;

  const currency = summary.currency || 'XAF';
  const stats = [
    {
      key: 'balance',
      label: 'Solde disponible',
      value: formatCurrency(summary.balance, currency),
      icon: 'bi-wallet2',
      variant: 'success',
    },
    {
      key: 'income',
      label: 'Entrées du mois',
      value: formatCurrency(summary.incomeMonth, currency),
      icon: 'bi-arrow-down-circle',
      variant: 'primary',
    },
    {
      key: 'expense',
      label: 'Sorties du mois',
      value: formatCurrency(summary.expenseMonth, currency),
      icon: 'bi-arrow-up-circle',
      variant: 'danger',
    },
  ];

  return (
    <Card
      className="h-100"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-cash-stack text-success" aria-hidden="true" />
          <span>Résumé financier</span>
          <span className="badge bg-success-subtle text-success ms-1">FCFA</span>
        </span>
      }
      footer={
        <span className="small text-muted d-flex align-items-center gap-1">
          <i className="bi bi-arrow-right" aria-hidden="true" />
          <Link to={ROUTES.PARTNER_FINANCE}>Voir mes finances (FCFA)</Link>
        </span>
      }
    >
      <ul className="navix-client-finance list-unstyled mb-0">
        {stats.map((stat) => (
          <li key={stat.key} className="navix-client-finance__row">
            <span className={`navix-client-finance__icon navix-client-finance__icon--${stat.variant}`}>
              <i className={`bi ${stat.icon}`} aria-hidden="true" />
            </span>
            <span className="navix-client-finance__label">{stat.label}</span>
            <span className="navix-client-finance__value">{stat.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default PartnerFinanceSummaryCard;
