/**
 * Navix Audit — ExportAuditButton
 * --------------------------------------------------------------------------
 * Export du journal des actions selon les critères courants.
 *  - CSV   : généré et téléchargé 100 % côté client (aucune bibliothèque).
 *  - Excel / PDF : export simulé (architecture uniquement) via le store —
 *    la génération réelle sera produite côté Express.js (format serveur,
 *    horodatage, traçabilité). Aucune bibliothèque d'export n'est installée.
 *
 * Props :
 *   isLoading   : booléen — charge la liste (bouton inactif)
 *   isGenerating : booléen — export en cours
 *   onExport     : (format) => void — callback store (toasts gérés par le hook)
 */
import { useMemo } from 'react';
import { ActionDropdown, ExportButton } from '@/components/core';
import { useAuditStore } from '../store';
import { getAuditScopeCompanyId } from '../hooks';
import { sanitizeAuditFilters } from '../schemas';
import { applyAuditFilters, sortAuditLogs } from '../services';

const EXPORT_COLUMNS = [
  { key: 'createdAt', label: 'Date' },
  { key: 'userName', label: 'Utilisateur' },
  { key: 'companyName', label: 'Entreprise' },
  { key: 'agencyName', label: 'Agence' },
  { key: 'action', label: 'Action' },
  { key: 'actionType', label: "Famille d'action" },
  { key: 'resourceType', label: 'Ressource' },
  { key: 'resourceName', label: 'Nom de la ressource' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Statut' },
  { key: 'severity', label: 'Sévérité' },
  { key: 'ipAddress', label: 'Adresse IP' },
];

/** Liste complète selon les critères courants (mêmes règles que la page). */
const useFilteredLogs = () => {
  const logs = useAuditStore((state) => state.logs);
  const search = useAuditStore((state) => state.search);
  const filters = useAuditStore((state) => state.filters);
  const sort = useAuditStore((state) => state.sort);

  return useMemo(() => {
    const safeFilters = sanitizeAuditFilters({ ...filters, search });
    const filtered = applyAuditFilters(logs, safeFilters, getAuditScopeCompanyId());
    return sortAuditLogs(filtered, sort.by, sort.direction);
  }, [logs, search, filters, sort]);
};

const ExportAuditButton = ({ isLoading = false, isGenerating = false, onExport }) => {
  const data = useFilteredLogs();

  return (
    <ActionDropdown
      align="end"
      triggerIcon="bi-download"
      triggerLabel="Exporter le journal"
      ariaLabel="Exporter le journal des actions"
      buttonVariant="outline"
      size="sm"
      items={[
        {
          key: 'csv',
          label: 'CSV (téléchargement)',
          icon: 'bi-filetype-csv',
          disabled: isLoading || isGenerating || data.length === 0,
          onClick: () => onExport?.('csv', data),
        },
        {
          key: 'excel',
          label: 'Excel (simulation)',
          icon: 'bi-file-earmark-excel',
          disabled: isLoading || isGenerating || data.length === 0,
          onClick: () => onExport?.('excel', data),
        },
        {
          key: 'pdf',
          label: 'PDF (simulation)',
          icon: 'bi-file-earmark-pdf',
          disabled: isLoading || isGenerating || data.length === 0,
          onClick: () => onExport?.('pdf', data),
        },
      ]}
    />
  );
};

/**
 * Variante compacte : bouton unique CSV téléchargeable (action du header).
 */
export const ExportAuditCsvButton = ({ disabled = false }) => {
  const data = useFilteredLogs();
  return (
    <ExportButton
      format="csv"
      data={data}
      columns={EXPORT_COLUMNS}
      filename="journal-des-actions"
      label="Exporter"
      icon="bi-download"
      variant="outline"
      size="sm"
      disabled={disabled || data.length === 0}
    />
  );
};

export default ExportAuditButton;
