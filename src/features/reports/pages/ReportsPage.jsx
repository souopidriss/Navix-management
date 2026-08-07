/**
 * Navix Reports — Hub (/reports)
 * --------------------------------------------------------------------------
 * Point d'entrée du module : liste des catégories de rapports autorisées par
 * les permissions RBAC de l'utilisateur + aperçu des rapports enregistrés.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader, StatusBadge, LoadingState } from '@/components/core';
import { Card } from '@/components/ui';
import { useRbacStore } from '@/features/rbac';
import { ROUTES } from '@/routes/route.constants';
import { ReportCategoryCard, TopItems, ReportsOverview } from '../components';
import { useSavedReports } from '../hooks';
import { filterReportTypesByPermission, getReportType, getReportStatus, formatReportDate } from '../constants';
import '../components/ReportComponents.css';

const ReportsPage = () => {
  const navigate = useNavigate();
  const permissions = useRbacStore((state) => state.permissions);
  const { savedReports, isSaving } = useSavedReports();

  const categories = useMemo(
    () => filterReportTypesByPermission(permissions).map((key) => getReportType(key)),
    [permissions],
  );

  const openReport = (route) => navigate(route);

  const savedTop = useMemo(
    () =>
      savedReports
        .filter((report) => report.status === 'active')
        .slice(0, 5)
        .map((report) => ({
          key: report.id,
          label: report.name,
          sublabel: getReportType(report.reportType).label,
          value: formatReportDate(report.updatedAt),
        })),
    [savedReports],
  );

  const breadcrumbs = [{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Rapports' }];

  return (
    <PageContainer>
      <PageHeader
        title="Rapports & Analytics"
        subtitle="Explorez les rapports de votre flotte : parc, carburant, finances, conformité et plus encore."
        breadcrumbs={breadcrumbs}
        icon="bi-file-earmark-bar-graph"
      />

      <ReportsOverview />

      <h6 className="text-uppercase small text-secondary mb-3">Catégories de rapports</h6>
      <div className="navix-report-hub mb-4">
        {categories.map((category) => (
          <ReportCategoryCard key={category.id} category={category} onOpen={() => openReport(category.route)} />
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <Card title="Rapports enregistrés" subtitle={isSaving ? 'Chargement…' : `${savedReports.length} rapport(s)`} flush>
            {isSaving && savedReports.length === 0 ? (
              <LoadingState variant="cards" rows={2} label="Chargement des rapports enregistrés…" />
            ) : savedReports.length === 0 ? (
              <p className="small text-secondary m-0 p-3">Aucun rapport enregistré pour le moment.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {savedReports.map((report) => {
                  const meta = getReportType(report.reportType);
                  const status = getReportStatus(report.status);
                  return (
                    <li key={report.id} className="list-group-item d-flex align-items-center gap-3 px-3">
                      <span className="navix-report-category__icon navix-report-category__icon--secondary" aria-hidden="true">
                        <i className={`bi ${meta.icon}`} />
                      </span>
                      <div className="flex-grow-1 min-width-0">
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-start navix-report-saved__name"
                          onClick={() => openReport(meta.route)}
                        >
                          {report.name}
                        </button>
                        <span className="d-block small text-secondary text-truncate">{report.description}</span>
                      </div>
                      <StatusBadge variant={status.variant} label={status.label} size="sm" />
                      <span className="small text-secondary text-nowrap d-none d-md-inline">{formatReportDate(report.updatedAt)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="col-12 col-lg-5">
          <TopItems items={savedTop} title="Rapports actifs récents" formatValue={(value) => value} />
        </div>
      </div>
    </PageContainer>
  );
};

export default ReportsPage;
