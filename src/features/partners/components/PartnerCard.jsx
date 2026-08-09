/**
 * Navix Partners — PartnerCard
 * --------------------------------------------------------------------------
 * Carte de partenaire (affichage mobile/tablette, remplace le tableau sur
 * petits écrans) : avatar initiales, nom, code, type, statut, entreprise,
 * contact, ville/pays et actions rapides. Utilise l'ActionDropdown core.
 *
 * Props :
 *   partner    : partenaire à afficher
 *   company    : entreprise associée (optionnel)
 *   onView     : (id: string) => void
 *   onEdit     : (id: string) => void
 *   onDelete   : (partner: object) => void
 *   canEdit    : booléen — autorise l'action Modifier
 *   canDelete  : booléen — autorise l'action Supprimer
 */
import { ActionDropdown } from '@/components/core';
import { Button } from '@/components/ui';
import { getPartnerType } from '../constants';
import PartnerStatusBadge from './PartnerStatusBadge';
import PartnerTypeBadge from './PartnerTypeBadge';
import './PartnerCard.css';

const PartnerCard = ({
  partner,
  company,
  onView,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const typeMeta = getPartnerType(partner.type);
  const initials = (partner.name || '?')
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="navix-partner-card">
      <div className="navix-partner-card__header">
        <div
          className={`navix-partner-card__avatar navix-partner-card__avatar--${typeMeta.variant}`}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="navix-partner-card__titles">
          <button
            type="button"
            className="navix-partner-card__name"
            onClick={() => onView(partner.id)}
          >
            {partner.name}
          </button>
          <span className="navix-partner-card__code">{partner.code}</span>
        </div>
        <ActionDropdown
          items={[
            {
              key: 'view',
              label: 'Voir le détail',
              icon: 'bi-eye',
              onClick: () => onView(partner.id),
            },
            {
              key: 'edit',
              label: 'Modifier',
              icon: 'bi-pencil',
              show: () => canEdit,
              onClick: () => onEdit(partner.id),
            },
            {
              key: 'delete',
              label: 'Supprimer',
              icon: 'bi-trash3',
              danger: true,
              show: () => canDelete,
              onClick: () => onDelete(partner),
            },
          ]}
          ariaLabel={`Actions pour ${partner.name}`}
        />
      </div>

      <div className="navix-partner-card__badges">
        <PartnerTypeBadge type={partner.type} />
        <PartnerStatusBadge status={partner.status} />
      </div>

      <dl className="navix-partner-card__meta">
        <div>
          <dt>
            <i className="bi bi-building" aria-hidden="true" /> Entreprise
          </dt>
          <dd>{company?.name ?? '—'}</dd>
        </div>
        <div>
          <dt>
            <i className="bi bi-person" aria-hidden="true" /> Contact
          </dt>
          <dd>{partner.contactName || '—'}</dd>
        </div>
        <div>
          <dt>
            <i className="bi bi-envelope" aria-hidden="true" /> Email
          </dt>
          <dd>{partner.email || '—'}</dd>
        </div>
        <div>
          <dt>
            <i className="bi bi-geo-alt" aria-hidden="true" /> Localisation
          </dt>
          <dd>
            {partner.city || '—'}
            {partner.country ? `, ${partner.country}` : ''}
          </dd>
        </div>
      </dl>

      <div className="navix-partner-card__footer">
        <Button variant="outline" size="sm" onClick={() => onView(partner.id)}>
          <i className="bi bi-eye me-1" aria-hidden="true" /> Détails
        </Button>
      </div>
    </article>
  );
};

export default PartnerCard;
