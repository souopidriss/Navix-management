/**
 * Navix Subscriptions — FeatureBadge
 * --------------------------------------------------------------------------
 * Badge générique d'une fonctionnalité SaaS : icône + libellé, résolu via les
 * constantes métier (FEATURES). Accepte un code ('vehicles') ou un objet
 * fonctionnalité.
 */
import { Badge } from '@/components/ui';
import { getFeature } from '../constants';

const FeatureBadge = ({ feature, size, variant = 'secondary', className }) => {
  const meta = getFeature(typeof feature === 'string' ? feature : feature?.code);
  return (
    <Badge variant={variant} size={size} className={className}>
      <i className={`bi ${meta.icon} me-1`} aria-hidden="true" />
      {meta.label}
    </Badge>
  );
};

export default FeatureBadge;
