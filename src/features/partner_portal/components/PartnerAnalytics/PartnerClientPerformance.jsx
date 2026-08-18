/**
 * Navix Partner Portal — PartnerClientPerformance
 * --------------------------------------------------------------------------
 * Performance clients : actifs, revenus, top clients par CA.
 */
import { Card } from '@/components/ui';
import { formatNumber } from '@/utils/format';

const PartnerClientPerformance = ({ data, loading = false }) => {
  if (loading) {
    return (
      <Card className="h-100" title={<span><i className="bi bi-people text-primary me-2" />Clients</span>}>
        <div className="placeholder-glow p-3"><div className="placeholder rounded" style={{ height: 180 }} /></div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="h-100" title={<span><i className="bi bi-people text-primary me-2" />Clients</span>}>
        <p className="text-secondary text-center py-4 mb-0">Aucune donnée disponible pour cette période.</p>
      </Card>
    );
  }

  return (
    <Card
      className="h-100"
      title={
        <div className="d-flex align-items-center justify-content-between w-100">
          <span>
            <i className="bi bi-people text-primary me-2" />
            Clients
          </span>
          <span className="badge bg-primary-subtle text-primary">{data.active} actifs</span>
        </div>
      }
    >
      <div className="row g-3 mb-3">
        <div className="col-6">
          <div className="text-center p-2 rounded-3 border bg-body-tertiary">
            <div className="fw-bold text-body-emphasis fs-5">{data.active}</div>
            <div className="small text-muted">Actifs</div>
          </div>
        </div>
        <div className="col-6">
          <div className="text-center p-2 rounded-3 border bg-body-tertiary">
            <div className="fw-bold text-body-emphasis fs-5">{data.total}</div>
            <div className="small text-muted">Total</div>
          </div>
        </div>
      </div>
      {data.topClients?.length > 0 && (
        <>
          <h6 className="small text-muted text-uppercase mb-2">Top clients par revenu</h6>
          <div className="d-flex flex-column gap-2">
            {data.topClients.map((client, index) => (
              <div key={client.id} className="d-flex align-items-center justify-content-between small">
                <span className="d-flex align-items-center gap-2">
                  <span className={`badge bg-${index < 3 ? 'primary' : 'secondary'}-subtle text-${index < 3 ? 'primary' : 'secondary'} rounded-circle`} style={{ width: 22, height: 22 }}>
                    {index + 1}
                  </span>
                  <span className="text-body-emphasis fw-medium text-truncate" style={{ maxWidth: 140 }}>
                    {client.name}
                  </span>
                </span>
                <span className="text-muted tabular-nums">
                  {client.missions} missions · {formatNumber(client.revenue)} FCFA
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default PartnerClientPerformance;
