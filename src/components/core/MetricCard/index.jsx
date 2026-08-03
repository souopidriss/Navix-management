/**
 * Navix Core — MetricCard
 * --------------------------------------------------------------------------
 * Carte de métrique unitaire : label, valeur, icône, couleur et variation.
 * Aucune logique métier — purement une vitrine de données chiffrées.
 *
 * Props :
 *   label       : libellé de la métrique
 *   value       : valeur affichée (string | number | node)
 *   icon        : classe d'icône Bootstrap Icons, ex. 'bi-fuel-pump'
 *   variant     : primary | success | warning | danger | info |
 *                 secondary | dark                                (défaut : 'primary')
 *   variation   : variation affichée (ex. '+12,5 %' ou un node)
 *   trend       : 'up' | 'down' | 'neutral' — flèche de tendance   (défaut : 'neutral')
 *   trendLabel  : libellé accessible de la tendance (ex. 'en hausse')
 *   href        : lien optionnel (rend le corps cliquable)
 *   loading     : booléen — affiche un squelette
 *   className   : classes additionnelles
 *
 * Exemple :
 *   <MetricCard
 *     label="Coût total"
 *     value="2 450 000 FCFA"
 *     icon="bi-cash-stack"
 *     variant="success"
 *     variation="+12,5 %"
 *     trend="up"
 *     trendLabel="en hausse"
 *   />
 */
import { memo } from 'react';
import { Card } from '@/components/ui';
import './MetricCard.css';

const TREND_ICONS = {
  up: 'bi-arrow-up-right',
  down: 'bi-arrow-down-right',
  neutral: 'bi-arrow-right',
};

const MetricCard = ({
  label,
  value,
  icon,
  variant = 'primary',
  variation,
  trend = 'neutral',
  trendLabel,
  href,
  loading = false,
  className,
  ...rest
}) => {
  const classes = ['navix-metric', `navix-metric--${variant}`, className].filter(Boolean).join(' ');

  const body = (
    <>
      <span className="navix-metric__top">
        {icon && (
          <span className="navix-metric__icon" aria-hidden="true">
            <i className={`bi ${icon}`} />
          </span>
        )}
        {variation !== undefined && (
          <span className="navix-metric__variation" role="text" aria-label={trendLabel}>
            <i className={`bi ${TREND_ICONS[trend] || TREND_ICONS.neutral}`} aria-hidden="true" />
            <span>{variation}</span>
          </span>
        )}
      </span>
      <span className="navix-metric__value">{loading ? <span className="navix-skeleton navix-metric__skeleton" /> : value}</span>
      <span className="navix-metric__label">{label}</span>
    </>
  );

  const content = href ? (
    <a className={`${classes} navix-metric--link`} href={href} {...rest}>
      {body}
    </a>
  ) : (
    <span className={classes} {...rest}>
      {body}
    </span>
  );

  return <Card className="navix-metric__card">{content}</Card>;
};

export default memo(MetricCard);
