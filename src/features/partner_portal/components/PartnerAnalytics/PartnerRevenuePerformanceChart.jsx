/**
 * Navix Partner Portal — PartnerRevenuePerformanceChart
 * --------------------------------------------------------------------------
 * Graphique d'évolution du CA brut, commissions et CA net.
 * Réutilise le AreaChart existant de la librairie Reports.
 */
import Card from '@/components/ui/Card';
import AreaChart from '@/features/reports/components/charts/AreaChart';
import { formatNumber } from '@/utils/format';

const formatCurrency = (value) => `${formatNumber(value)} FCFA`;

const PartnerRevenuePerformanceChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <Card className="h-100" title={<span><i className="bi bi-graph-up-arrow text-success me-2" />Évolution du CA</span>}>
        <div className="placeholder-glow p-3"><div className="placeholder rounded" style={{ height: 240 }} /></div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="h-100" title={<span><i className="bi bi-graph-up-arrow text-success me-2" />Évolution du CA</span>}>
        <p className="text-secondary text-center py-4 mb-0">Aucune donnée disponible pour cette période.</p>
      </Card>
    );
  }

  const chartData = {
    labels: data.evolution?.labels || [],
    datasets: [
      {
        key: 'gross',
        label: 'CA brut',
        values: data.evolution?.grossValues || [],
        variant: 'primary',
      },
      {
        key: 'commission',
        label: 'Commissions',
        values: data.evolution?.commissionValues || [],
        variant: 'warning',
      },
      {
        key: 'net',
        label: 'CA net',
        values: data.evolution?.netValues || [],
        variant: 'success',
      },
    ],
  };

  return (
    <Card
      className="h-100"
      title={
        <div className="d-flex align-items-center justify-content-between w-100">
          <span>
            <i className="bi bi-graph-up-arrow text-success me-2" />
            Évolution du CA
          </span>
          <span className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary">{formatCurrency(data.grossTotal)}</span>
          </span>
        </div>
      }
    >
      <AreaChart
        data={chartData}
        height={260}
        showDots
        legend
        title="Évolution du chiffre d'affaires"
        formatValue={formatCurrency}
      />
    </Card>
  );
};

export default PartnerRevenuePerformanceChart;
