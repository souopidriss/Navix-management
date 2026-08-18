/**
 * Navix Client Finance — ClientFinanceEvolutionChart
 * --------------------------------------------------------------------------
 * Évolution Entrées / Sorties / Solde sur une période (7 / 30 / 90 jours).
 * Barres CSS pures (aucune librairie graphique). Le solde d'un créneau est le
 * solde de fin de créneau (report du solde précédent si aucune transaction).
 */
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui';
import { formatNumber } from '@/utils/format';
import {
  FCFA_LABEL,
  transactionDirectionOf,
  isTransactionEffective,
} from '../../constants/client.constants';
import './ClientFinance.css';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 j', days: 7, buckets: 7 },
  { value: '30d', label: '30 j', days: 30, buckets: 5 },
  { value: '90d', label: '90 j', days: 90, buckets: 3 },
];

const toShortDay = (date) =>
  date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

const toShortMonth = (date) =>
  date.toLocaleDateString('fr-FR', { month: 'short' });

const toSafeNumber = (value) => {
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
};

const buildBuckets = (transactions, days, bucketCount) => {
  const now = new Date();
  const from = new Date(now.getTime() - (days - 1) * 86_400_000);
  const bucketDays = days / bucketCount;
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const bucketEnd = new Date(end);
    bucketEnd.setDate(end.getDate() - index * bucketDays);
    const bucketStart = new Date(bucketEnd);
    bucketStart.setDate(bucketEnd.getDate() - bucketDays + 1);
    return {
      label: bucketDays >= 30 ? toShortMonth(bucketStart) : `${toShortDay(bucketStart)} → ${toShortDay(bucketEnd)}`,
      start: bucketStart.getTime(),
      end: bucketEnd.getTime(),
      entrees: 0,
      sorties: 0,
      solde: null,
    };
  }).reverse();

  transactions
    .filter(isTransactionEffective)
    .filter((item) => {
      const ts = new Date(item.createdAt).getTime();
      return ts >= from.getTime() && ts <= end.getTime();
    })
    .forEach((item) => {
      const ts = new Date(item.createdAt).getTime();
      const bucket = buckets.find((b) => ts >= b.start && ts <= b.end);
      if (!bucket) return;
      const amount = Number(item.amount) || 0;
      if (transactionDirectionOf(item) === 'in') bucket.entrees += amount;
      else bucket.sorties += amount;
      bucket.solde = toSafeNumber(item.balanceAfter) ?? toSafeNumber(item.balanceBefore);
    });

  let carry = 0;
  buckets.forEach((bucket) => {
    if (bucket.solde === null || bucket.solde === undefined) bucket.solde = carry;
    else carry = bucket.solde;
  });

  return buckets;
};

const barHeight = (value, max) => {
  if (!max || !value) return 4;
  return Math.max(4, Math.round((Number(value) / max) * 150));
};

const ClientFinanceEvolutionChart = ({ transactions = [] }) => {
  const [period, setPeriod] = useState('30d');

  const active = PERIOD_OPTIONS.find((option) => option.value === period) || PERIOD_OPTIONS[1];
  const buckets = useMemo(
    () => buildBuckets(transactions, active.days, active.buckets),
    [transactions, active],
  );

  const maxIn = Math.max(...buckets.map((bucket) => bucket.entrees), 1);
  const maxOut = Math.max(...buckets.map((bucket) => bucket.sorties), 1);
  const maxSolde = Math.max(...buckets.map((bucket) => bucket.solde ?? 0), 1);

  return (
    <Card
      className="h-100"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-graph-up-arrow text-info" aria-hidden="true" />
          <span>Évolution des opérations</span>
        </span>
      }
      headerActions={
        <div className="navix-client-finance__period-tabs" role="group" aria-label="Période de l’évolution">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`navix-client-finance__period-tab ${period === option.value ? 'navix-client-finance__period-tab--active' : ''}`}
              onClick={() => setPeriod(option.value)}
              aria-pressed={period === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="navix-client-finance__evolution" role="img" aria-label={`Évolution des opérations financières sur ${active.days} jours`}>
        <div className="navix-client-finance__evolution-bars">
          {buckets.map((bucket) => (
            <div key={bucket.label} className="navix-client-finance__evolution-col" title={`${bucket.label} — Entrées ${formatNumber(bucket.entrees)} FCFA · Sorties ${formatNumber(bucket.sorties)} FCFA · Solde ${formatNumber(bucket.solde ?? 0)} FCFA`}>
              <span className="navix-dash-chart__value">{formatNumber(bucket.entrees + bucket.sorties)}</span>
              <span className="navix-client-finance__evolution-group">
                <span className="navix-client-finance__bar navix-client-finance__bar--in" style={{ height: `${barHeight(bucket.entrees, maxIn)}px` }} />
                <span className="navix-client-finance__bar navix-client-finance__bar--out" style={{ height: `${barHeight(bucket.sorties, maxOut)}px` }} />
                <span className="navix-client-finance__bar navix-client-finance__bar--solde" style={{ height: `${barHeight(bucket.solde ?? 0, maxSolde)}px` }} />
              </span>
              <span className="navix-dash-chart__label">{bucket.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="navix-dash-chart__legend">
        <span className="navix-dash-chart__legend-key">
          <span className="navix-dash-chart__legend-dot" style={{ background: 'var(--bs-success)' }} />
          Entrées
        </span>
        <span className="navix-dash-chart__legend-key">
          <span className="navix-dash-chart__legend-dot" style={{ background: 'var(--bs-danger)' }} />
          Sorties
        </span>
        <span className="navix-dash-chart__legend-key">
          <span className="navix-dash-chart__legend-dot" style={{ background: 'var(--bs-info)' }} />
          Solde ({FCFA_LABEL})
        </span>
      </div>
    </Card>
  );
};

export default ClientFinanceEvolutionChart;
