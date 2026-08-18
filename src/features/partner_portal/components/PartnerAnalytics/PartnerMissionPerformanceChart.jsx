/**
 * Navix Partner Portal — PartnerMissionPerformanceChart
 * --------------------------------------------------------------------------
 * Graphique de performance des missions : réalisées, en cours, annulées, refusées.
 * Réutilise le BarChart existant.
 */
import Card from '@/components/ui/Card';
import BarChart from '@/features/reports/components/charts/BarChart';
import VariationBadge from '@/features/reports/components/VariationBadge';

const PartnerMissionPerformanceChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <Card className="h-100" title={<span><i className="bi bi-signpost-split text-info me-2" />Performance des missions</span>}>
        <div className="placeholder-glow p-3"><div className="placeholder rounded" style={{ height: 220 }} /></div>
      </Card>
    );
  }

  if (!data || data.total === 0) {
    return (
      <Card className="h-100" title={<span><i className="bi bi-signpost-split text-info me-2" />Performance des missions</span>}>
        <p className="text-secondary text-center py-4 mb-0">Aucune donnée disponible pour cette période.</p>
      </Card>
    );
  }

  const chartData = {
    labels: ['Terminées', 'En cours', 'Planifiées', 'Annulées'],
    datasets: [{
      key: 'missions',
      label: 'Missions',
      values: [data.completed, data.inProgress, data.scheduled, data.cancelled],
      variant: 'primary',
    }],
  };

  return (
    <Card
      className="h-100"
      title={
        <div className="d-flex align-items-center justify-content-between w-100">
          <span>
            <i className="bi bi-signpost-split text-info me-2" />
            Performance des missions
          </span>
          <span className="d-flex align-items-center gap-2">
            <span className="badge bg-info-subtle text-info">{data.total} missions</span>
            {data.missionsVariation !== 0 && (
              <VariationBadge value={data.missionsVariation} />
            )}
          </span>
        </div>
      }
    >
      <BarChart
        data={chartData}
        height={220}
        title="Répartition des missions par statut"
        showValues
        legend={false}
      />
      <div className="mt-3">
        <div className="d-flex align-items-center justify-content-between small">
          <span className="text-muted">Taux de réussite</span>
          <span className={`fw-semibold ${data.successRate >= 70 ? 'text-success' : data.successRate >= 40 ? 'text-warning' : 'text-danger'}`}>
            {data.successRate} %
          </span>
        </div>
        <div className="progress mt-1" style={{ height: 6 }}>
          <div
            className={`progress-bar ${data.successRate >= 70 ? 'bg-success' : data.successRate >= 40 ? 'bg-warning' : 'bg-danger'}`}
            style={{ width: `${data.successRate}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

export default PartnerMissionPerformanceChart;
