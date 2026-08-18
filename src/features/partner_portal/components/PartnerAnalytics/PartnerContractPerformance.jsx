/**
 * Navix Partner Portal — PartnerContractPerformance
 * --------------------------------------------------------------------------
 * Performance contrats : actifs, expirants, valeur contractuelle.
 * Performance facturation : total facturé, payé, en attente, retard.
 */
import { Card } from '@/components/ui';
import { formatNumber } from '@/utils/format';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';

const PartnerContractPerformance = ({ contracts, invoices, loading = false }) => {
  if (loading) {
    return (
      <div className="row g-3 mb-4">
        <div className="col-lg-6"><Card className="h-100"><div className="placeholder-glow p-3"><div className="placeholder rounded" style={{ height: 150 }} /></div></Card></div>
        <div className="col-lg-6"><Card className="h-100"><div className="placeholder-glow p-3"><div className="placeholder rounded" style={{ height: 150 }} /></div></Card></div>
      </div>
    );
  }

  if (!contracts && !invoices) {
    return null;
  }

  return (
    <div className="row g-3 mb-4">
      {/* Contrats */}
      {contracts && (
        <div className="col-lg-6">
          <Card
            className="h-100"
            title={
              <div className="d-flex align-items-center justify-content-between w-100">
                <span>
                  <i className="bi bi-file-earmark-text text-primary me-2" />
                  Contrats
                </span>
                <Link to={ROUTES.PARTNER_CONTRACTS} className="btn btn-sm btn-outline-primary">
                  Voir tout <i className="bi bi-arrow-right ms-1" />
                </Link>
              </div>
            }
          >
            <div className="row g-3">
              <div className="col-4">
                <div className="text-center p-2 rounded-3 border bg-body-tertiary">
                  <div className="fw-bold text-body-emphasis fs-5">{contracts.active}</div>
                  <div className="small text-muted">Actifs</div>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center p-2 rounded-3 border bg-body-tertiary">
                  <div className="fw-bold text-warning fs-5">{contracts.expiring}</div>
                  <div className="small text-muted">Expirant</div>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center p-2 rounded-3 border bg-body-tertiary">
                  <div className="fw-bold text-body-emphasis fs-5">{contracts.total}</div>
                  <div className="small text-muted">Total</div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="small text-muted">Valeur contractuelle active : </span>
              <span className="fw-semibold text-body-emphasis">{formatNumber(contracts.contractValue)} FCFA</span>
            </div>
          </Card>
        </div>
      )}

      {/* Facturation */}
      {invoices && (
        <div className="col-lg-6">
          <Card
            className="h-100"
            title={
              <div className="d-flex align-items-center justify-content-between w-100">
                <span>
                  <i className="bi bi-receipt text-info me-2" />
                  Facturation
                </span>
                <Link to={ROUTES.PARTNER_FINANCE_INVOICES} className="btn btn-sm btn-outline-info">
                  Voir tout <i className="bi bi-arrow-right ms-1" />
                </Link>
              </div>
            }
          >
            <div className="d-flex flex-column gap-2">
              {[
                { label: 'Total facturé', value: `${formatNumber(invoices.totalInvoiced)} FCFA`, icon: 'bi-receipt', variant: 'primary' },
                { label: 'Total payé', value: `${formatNumber(invoices.totalPaid)} FCFA`, icon: 'bi-check-circle', variant: 'success' },
                { label: 'En attente', value: `${formatNumber(invoices.totalPending)} FCFA`, icon: 'bi-clock', variant: 'warning' },
                { label: 'En retard', value: `${formatNumber(invoices.totalOverdue)} FCFA`, icon: 'bi-exclamation-circle', variant: 'danger' },
              ].map((row) => (
                <div key={row.label} className="d-flex align-items-center justify-content-between">
                  <span className="d-flex align-items-center gap-2 text-body-secondary small">
                    <i className={`bi ${row.icon} text-${row.variant}`} aria-hidden="true" />
                    {row.label}
                  </span>
                  <span className="fw-semibold tabular-nums text-body-emphasis small">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PartnerContractPerformance;
