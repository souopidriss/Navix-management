/**
 * Navix Partner Portal — PartnerRequestPerformanceCard
 * --------------------------------------------------------------------------
 * Performance des demandes : reçues, acceptées, refusées, en attente, taux d'acceptation.
 */
import Card from '@/components/ui/Card';

const PartnerRequestPerformanceCard = ({ data, loading = false }) => {
  if (loading) {
    return (
      <Card className="h-100" title={<span><i className="bi bi-inbox text-warning me-2" />Demandes</span>}>
        <div className="placeholder-glow p-3"><div className="placeholder rounded" style={{ height: 180 }} /></div>
      </Card>
    );
  }

  if (!data || data.total === 0) {
    return (
      <Card className="h-100" title={<span><i className="bi bi-inbox text-warning me-2" />Demandes</span>}>
        <p className="text-secondary text-center py-4 mb-0">Aucune donnée disponible pour cette période.</p>
      </Card>
    );
  }

  const rows = [
    { label: 'Reçues', value: data.total, variant: 'primary', icon: 'bi-inbox' },
    { label: 'Acceptées', value: data.accepted, variant: 'success', icon: 'bi-check-circle' },
    { label: 'Refusées', value: data.rejected, variant: 'danger', icon: 'bi-x-circle' },
    { label: 'En attente', value: data.pending, variant: 'warning', icon: 'bi-clock' },
    { label: 'Converties', value: data.converted, variant: 'info', icon: 'bi-arrow-right-circle' },
  ];

  return (
    <Card
      className="h-100"
      title={
        <div className="d-flex align-items-center justify-content-between w-100">
          <span>
            <i className="bi bi-inbox text-warning me-2" />
            Demandes
          </span>
          <span className="badge bg-warning-subtle text-warning">{data.total} reçues</span>
        </div>
      }
    >
      <div className="d-flex flex-column gap-2 mb-3">
        {rows.map((row) => (
          <div key={row.label} className="d-flex align-items-center justify-content-between">
            <span className="d-flex align-items-center gap-2 text-body-secondary small">
              <i className={`bi ${row.icon} text-${row.variant}`} aria-hidden="true" />
              {row.label}
            </span>
            <span className="fw-semibold tabular-nums">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="border-top pt-3">
        <div className="d-flex align-items-center justify-content-between small">
          <span className="text-muted">Taux d'acceptation</span>
          <span className={`fw-semibold ${data.acceptanceRate >= 60 ? 'text-success' : data.acceptanceRate >= 30 ? 'text-warning' : 'text-danger'}`}>
            {data.acceptanceRate} %
          </span>
        </div>
        <div className="progress mt-1" style={{ height: 6 }}>
          <div
            className={`progress-bar ${data.acceptanceRate >= 60 ? 'bg-success' : data.acceptanceRate >= 30 ? 'bg-warning' : 'bg-danger'}`}
            style={{ width: `${data.acceptanceRate}%` }}
          />
        </div>
        <p className="text-muted small mt-2 mb-0">
          Calcul : {data.accepted} / {data.total} × 100 = {data.acceptanceRate} %
        </p>
      </div>
    </Card>
  );
};

export default PartnerRequestPerformanceCard;
