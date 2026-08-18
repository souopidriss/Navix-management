/**
 * Navix Partner Portal — PartnerDocumentStats (PROMPT 066)
 * --------------------------------------------------------------------------
 * 4 cartes KPI documentaires : Documents / Valides / Expire bientôt /
 * Espace utilisé. Les compteurs proviennent de `partnerDocumentService`
 * (portefeuille réel du partenaire, 48 documents) ; l'espace utilisé est la
 * valeur de démonstration 1,8 Go (pas de backend de stockage).
 */
import { formatDocumentSize } from '@/features/documents/constants';
import { MetricCard } from '@/components/core';

const PartnerDocumentStats = ({ stats = {}, loading = false }) => {
  const total = stats.total || 0;
  const percent = (value) => (total ? Math.round((value / total) * 100) : 0);

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Documents"
          value={total}
          icon="bi-file-earmark-text"
          variant="primary"
          loading={loading}
          variation="portefeuille total"
          trend="neutral"
          trendLabel="documents référencés"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Valides"
          value={stats.valid ?? 0}
          icon="bi-check2-circle"
          variant="success"
          loading={loading}
          variation={`${percent(stats.valid ?? 0)} % des documents`}
          trend="up"
          trendLabel="échéances à jour"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Expire bientôt"
          value={stats.expiring ?? 0}
          icon="bi-clock-history"
          variant="warning"
          loading={loading}
          variation="sous 30 jours"
          trend="neutral"
          trendLabel="à renouveler"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Espace utilisé"
          value={formatDocumentSize(stats.storageBytes)}
          icon="bi-hdd"
          variant="info"
          loading={loading}
          variation="quota partenaire"
          trend="neutral"
          trendLabel="valeur de démonstration"
        />
      </div>
    </div>
  );
};

export default PartnerDocumentStats;
