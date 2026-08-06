/**
 * Navix Audit — AuditOverview
 * --------------------------------------------------------------------------
 * Indicateurs du journal des actions (total, aujourd'hui, succès, échecs)
 * rendus via StatsCards de Core UI. Les valeurs proviennent du hook
 * `useAuditStatistics` (dérivées de la liste source du store).
 *
 * Props :
 *   stats  : { cards, alerts } — cartes principales et alertes
 *   loading : booléen — skeleton pendant le chargement
 */
import { StatsCards } from '@/components/core';

const AuditOverview = ({ cards = [], alerts = [], loading = false }) => (
  <>
    <StatsCards stats={cards} loading={loading} columns={4} />
    {alerts.length > 0 && <StatsCards stats={alerts} loading={loading} columns={2} />}
  </>
);

export default AuditOverview;
