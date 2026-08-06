/**
 * Navix Users — RoleBadges
 * --------------------------------------------------------------------------
 * Ensemble compact des rôles d'un utilisateur sous forme de petits badges
 * (liste enrichie : `roleNames`). Limite l'affichage à trois rôles + compteur
 * des rôles restants.
 *
 * Props : names (string[]), className
 */
import { Badge } from '@/components/ui';

const MAX_VISIBLE = 3;

const RoleBadges = ({ names = [], className }) => {
  if (names.length === 0) return <span className="text-muted">—</span>;

  const visible = names.slice(0, MAX_VISIBLE);
  const rest = names.length - visible.length;

  return (
    <span className={`d-inline-flex flex-wrap gap-1 ${className || ''}`.trim()}>
      {visible.map((name) => (
        <Badge key={name} variant="info" soft size="sm">
          {name}
        </Badge>
      ))}
      {rest > 0 && (
        <Badge variant="secondary" soft size="sm">
          +{rest}
        </Badge>
      )}
    </span>
  );
};

export default RoleBadges;
