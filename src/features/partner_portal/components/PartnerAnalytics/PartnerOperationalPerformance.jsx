/**
 * Navix Partner Portal — PartnerOperationalPerformance
 * --------------------------------------------------------------------------
 * Performance opérationnelle : demandes, missions, prestations, taux de réussite.
 * Performance financière : CA brut, commissions, CA net, facturé, payé, en attente, retard.
 */
import { Card } from '@/components/ui';
import { formatNumber } from '@/utils/format';

const PartnerOperationalPerformance = ({ operational, financial, prestations, loading = false }) => {
  if (loading) {
    return (
      <div className="row g-3 mb-4">
        <div className="col-lg-6"><Card className="h-100"><div className="placeholder-glow p-3"><div className="placeholder rounded" style={{ height: 200 }} /></div></Card></div>
        <div className="col-lg-6"><Card className="h-100"><div className="placeholder-glow p-3"><div className="placeholder rounded" style={{ height: 200 }} /></div></Card></div>
      </div>
    );
  }

  if (!operational && !financial) {
    return (
      <div className="row g-3 mb-4">
        <div className="col-12">
          <Card><p className="text-secondary text-center py-4 mb-0">Aucune donnée disponible pour cette période.</p></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-3 mb-4">
      {/* Performance opérationnelle */}
      {operational && (
        <div className="col-lg-6">
          <Card
            className="h-100"
            title={
              <span>
                <i className="bi bi-gear-wide-connected text-info me-2" />
                Performance opérationnelle
              </span>
            }
          >
            <div className="d-flex flex-column gap-3">
              {[
                { label: 'Demandes reçues', value: operational.requests, icon: 'bi-inbox', variant: 'primary' },
                { label: 'Missions totales', value: operational.missions, icon: 'bi-signpost-split', variant: 'info' },
                { label: 'Missions terminées', value: operational.missionsCompleted, icon: 'bi-check-circle', variant: 'success' },
                { label: 'Missions annulées', value: operational.missionsCancelled, icon: 'bi-x-circle', variant: 'danger' },
              ].map((row) => (
                <div key={row.label} className="d-flex align-items-center justify-content-between">
                  <span className="d-flex align-items-center gap-2 text-body-secondary">
                    <i className={`bi ${row.icon} text-${row.variant}`} aria-hidden="true" />
                    {row.label}
                  </span>
                  <span className="fw-semibold tabular-nums text-body-emphasis">{row.value}</span>
                </div>
              ))}
              <div className="border-top pt-3">
                <div className="d-flex align-items-center justify-content-between small">
                  <span className="text-muted">Taux de réussite</span>
                  <span className={`fw-semibold ${operational.successRate >= 70 ? 'text-success' : 'text-warning'}`}>
                    {operational.successRate} %
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Performance financière */}
      {financial && (
        <div className="col-lg-6">
          <Card
            className="h-100"
            title={
              <span>
                <i className="bi bi-cash-stack text-success me-2" />
                Performance financière
              </span>
            }
          >
            <div className="d-flex flex-column gap-3">
              {[
                { label: 'CA brut', value: `${formatNumber(financial.grossTotal)} FCFA`, icon: 'bi-cash-coin', variant: 'primary' },
                { label: 'Commissions', value: `${formatNumber(financial.commissionTotal)} FCFA`, icon: 'bi-percent', variant: 'warning' },
                { label: 'CA net', value: `${formatNumber(financial.netTotal)} FCFA`, icon: 'bi-wallet2', variant: 'success' },
                { label: 'Total facturé', value: `${formatNumber(financial.totalInvoiced)} FCFA`, icon: 'bi-receipt', variant: 'info' },
                { label: 'Total payé', value: `${formatNumber(financial.totalPaid)} FCFA`, icon: 'bi-check-circle', variant: 'success' },
                { label: 'En attente', value: `${formatNumber(financial.totalPending)} FCFA`, icon: 'bi-clock', variant: 'warning' },
                { label: 'En retard', value: `${formatNumber(financial.totalOverdue)} FCFA`, icon: 'bi-exclamation-circle', variant: 'danger' },
              ].map((row) => (
                <div key={row.label} className="d-flex align-items-center justify-content-between">
                  <span className="d-flex align-items-center gap-2 text-body-secondary">
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

      {/* Top prestations */}
      {prestations?.length > 0 && (
        <div className="col-12">
          <Card
            title={
              <span>
                <i className="bi bi-bar-chart-line text-primary me-2" />
                Top prestations
              </span>
            }
          >
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" aria-label="Performance par type de prestation">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th className="text-end">Missions</th>
                    <th className="text-end">CA brut</th>
                    <th className="text-end">Revenu net</th>
                  </tr>
                </thead>
                <tbody>
                  {prestations.map((p) => (
                    <tr key={p.type}>
                      <td className="fw-medium text-capitalize">{p.type}</td>
                      <td className="text-end tabular-nums">{p.count}</td>
                      <td className="text-end tabular-nums">{formatNumber(p.revenue)} FCFA</td>
                      <td className="text-end tabular-nums text-success">{formatNumber(p.netRevenue)} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PartnerOperationalPerformance;
