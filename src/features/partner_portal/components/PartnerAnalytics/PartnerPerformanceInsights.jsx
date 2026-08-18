/**
 * Navix Partner Portal — PartnerPerformanceInsights
 * --------------------------------------------------------------------------
 * Insights basés sur les données Analytics. READ-ONLY.
 * Affiche uniquement des insights générés depuis les données réelles.
 */
import { Card } from '@/components/ui';

const INSIGHT_VARIANTS = {
  positive: { bg: 'bg-success-subtle', text: 'text-success', border: 'border-success' },
  warning: { bg: 'bg-warning-subtle', text: 'text-warning', border: 'border-warning' },
  danger: { bg: 'bg-danger-subtle', text: 'text-danger', border: 'border-danger' },
  info: { bg: 'bg-info-subtle', text: 'text-info', border: 'border-info' },
};

const PartnerPerformanceInsights = ({ insights = [], loading = false }) => {
  if (loading) {
    return (
      <Card
        className="mb-4"
        title={
          <span>
            <i className="bi bi-lightbulb text-warning me-2" />
            Insights
          </span>
        }
      >
        <div className="placeholder-glow p-3"><div className="placeholder rounded" style={{ height: 100 }} /></div>
      </Card>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card
      className="mb-4"
      title={
        <span>
          <i className="bi bi-lightbulb text-warning me-2" />
          Insights
        </span>
      }
    >
      <div className="d-flex flex-column gap-2">
        {insights.map((insight, index) => {
          const style = INSIGHT_VARIANTS[insight.type] || INSIGHT_VARIANTS.info;
          return (
            <div
              key={index}
              className={`d-flex align-items-start gap-3 p-3 rounded-3 border ${style.border} ${style.bg}`}
            >
              <i className={`bi ${insight.icon} ${style.text} mt-1`} aria-hidden="true" />
              <span className={`small ${style.text}`}>{insight.text}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PartnerPerformanceInsights;
