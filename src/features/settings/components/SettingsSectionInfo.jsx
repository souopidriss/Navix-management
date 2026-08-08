/**
 * Navix Settings — SettingsSectionInfo
 * --------------------------------------------------------------------------
 * Carte d'information d'une section : description, périmètre (entreprise,
 * utilisateur ou plateforme) et dernière mise à jour. Pure présentation.
 */
import { Card, Badge } from '@/components/ui';
import { getSettingsSection } from '../constants';

const SCOPE_LABELS = {
  company: 'Entreprise',
  user: 'Utilisateur',
  platform: 'Plateforme',
};

const getScope = (sectionKey) => {
  if (['user', 'appearance', 'tables'].includes(sectionKey)) return 'user';
  if (['saas', 'system'].includes(sectionKey)) return 'platform';
  return 'company';
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const SettingsSectionInfo = ({ section, updatedAt, extra }) => {
  const sectionMeta = getSettingsSection(section);
  const scope = getScope(section);

  return (
    <Card title={sectionMeta.label} subtitle={sectionMeta.description}>
      <dl className="mb-0 settings-info">
        <div className="d-flex justify-content-between align-items-center py-1">
          <dt className="mb-0 text-secondary small">Périmètre</dt>
          <dd className="mb-0">
            <Badge variant="info">{SCOPE_LABELS[scope]}</Badge>
          </dd>
        </div>
        <div className="d-flex justify-content-between align-items-center py-1">
          <dt className="mb-0 text-secondary small">Dernière mise à jour</dt>
          <dd className="mb-0">{formatDate(updatedAt)}</dd>
        </div>
        {extra}
      </dl>
    </Card>
  );
};

export default SettingsSectionInfo;
