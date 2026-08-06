/**
 * Navix Reports — ReportPageShell
 * --------------------------------------------------------------------------
 * Structure commune de toutes les pages de rapport : en-tête (titre,
 * description, période, actions), bandeau d'erreur et contenu.
 *
 * Props :
 *   meta        : méta de la catégorie (getReportType) — { label, description, icon }
 *   breadcrumbs : liste de breadcrumbs (optionnel)
 *   periodLabel : libellé de la période courante (ex. « Ce mois »)
 *   actions     : nœud d'actions de l'en-tête (export, filtres…)
 *   error       : message d'erreur (optionnel) — affiche ErrorState
 *   onRetry     : () => void — recharge le rapport
 *   children    : contenu de la page
 */
import { PageContainer, PageHeader, ErrorState } from '@/components/core';
import './ReportComponents.css';

const ReportPageShell = ({
  meta,
  breadcrumbs,
  periodLabel,
  actions,
  error,
  onRetry,
  children,
}) => {
  const subtitle = periodLabel
    ? `${meta.description} — Période : ${periodLabel}.`
    : meta.description;

  return (
    <PageContainer>
      <PageHeader
        title={meta.label}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        icon={meta.icon}
        actions={actions}
      />
      {error && (
        <div className="mb-4">
          <ErrorState
            title="Impossible de générer le rapport"
            description={error}
            retry={onRetry}
          />
        </div>
      )}
      {children}
    </PageContainer>
  );
};

export default ReportPageShell;
