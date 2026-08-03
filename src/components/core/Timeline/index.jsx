/**
 * Navix Core — Timeline
 * --------------------------------------------------------------------------
 * Chronologie verticale générique : point/jalon, icône, titre, date et
 * description. Adaptée aux historiques (trajets, maintenance, audits…).
 *
 * Props :
 *   items     : tableau d'événements
 *               [{ id, title, description?, date?, icon?, variant?, active? }]
 *               variant : primary | success | warning | danger | info | secondary
 *   align     : 'left' | 'alternate'            (défaut : 'left')
 *   className : classes additionnelles
 *
 * Exemple :
 *   <Timeline
 *     items={[
 *       { id: '1', title: 'Départ', date: '12 h 05', icon: 'bi-sign-turn-right', variant: 'success' },
 *       { id: '2', title: 'Arrivée', date: '18 h 40', icon: 'bi-flag', variant: 'info' },
 *     ]}
 *   />
 */
import { memo } from 'react';
import './Timeline.css';

const Timeline = ({ items = [], align = 'left', className }) => (
  <ol className={`navix-timeline navix-timeline--${align} ${className || ''}`.trim()}>
    {items.map((item) => (
      <li key={item.id} className="navix-timeline__item">
        <span
          className={`navix-timeline__marker navix-timeline__marker--${item.variant || 'primary'} ${
            item.active ? 'navix-timeline__marker--active' : ''
          }`}
          aria-hidden="true"
        >
          {item.icon && <i className={`bi ${item.icon}`} />}
        </span>
        <div className="navix-timeline__content">
          <div className="navix-timeline__head">
            <h3 className="navix-timeline__title">{item.title}</h3>
            {item.date && <time className="navix-timeline__date">{item.date}</time>}
          </div>
          {item.description && <p className="navix-timeline__description">{item.description}</p>}
        </div>
      </li>
    ))}
  </ol>
);

export default memo(Timeline);
