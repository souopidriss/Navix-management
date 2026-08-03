/**
 * Navix Core — LoadingState
 * --------------------------------------------------------------------------
 * État de chargement par skeleton loader (aucun spinner). Plusieurs gabarits
 * prêts à l'emploi : texte, tableau, cartes, formulaire, avatar.
 *
 * Props :
 *   variant   : 'text' | 'table' | 'cards' | 'form' | 'avatar'  (défaut : 'text')
 *   lines     : nombre de lignes de texte / champs               (défaut : 4)
 *   rows      : nombre de rangées (table, cards)                 (défaut : 4)
 *   cols      : nombre de colonnes (table)                       (défaut : 4)
 *   label     : texte accessible                                 (défaut : 'Chargement…')
 *   className : classes additionnelles
 *
 * Exemple :
 *   <LoadingState variant="table" rows={6} cols={5} />
 *   <LoadingState variant="cards" rows={3} />
 */
import { memo } from 'react';
import '../_shared/skeleton.css';
import './LoadingState.css';

const TextSkeleton = ({ lines = 4 }) => (
  <div className="navix-loading__text" aria-hidden="true">
    {Array.from({ length: lines }, (_, index) => (
      <span key={index} className="navix-skeleton" style={{ width: `${100 - index * 12}%` }} />
    ))}
  </div>
);

const TableSkeleton = ({ rows = 4, cols = 4 }) => (
  <div className="navix-loading__table" role="presentation" aria-hidden="true">
    <div className="navix-loading__thead">
      {Array.from({ length: cols }, (_, index) => (
        <span key={index} className="navix-skeleton" />
      ))}
    </div>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div className="navix-loading__tr" key={rowIndex}>
        {Array.from({ length: cols }, (_, colIndex) => (
          <span key={colIndex} className="navix-skeleton" style={{ width: `${100 - (colIndex % 3) * 15}%` }} />
        ))}
      </div>
    ))}
  </div>
);

const CardsSkeleton = ({ rows = 4 }) => (
  <div className="navix-loading__cards">
    {Array.from({ length: rows }, (_, index) => (
      <div className="navix-loading__card" key={index} aria-hidden="true">
        <span className="navix-skeleton navix-loading__card-icon" />
        <div className="navix-loading__card-lines">
          <span className="navix-skeleton" style={{ width: '55%' }} />
          <span className="navix-skeleton" style={{ width: '85%' }} />
          <span className="navix-skeleton" style={{ width: '70%' }} />
        </div>
      </div>
    ))}
  </div>
);

const FormSkeleton = ({ lines = 4 }) => (
  <div className="navix-loading__form" aria-hidden="true">
    {Array.from({ length: lines }, (_, index) => (
      <div className="navix-loading__field" key={index}>
        <span className="navix-skeleton navix-loading__field-label" />
        <span className="navix-skeleton navix-loading__field-input" />
      </div>
    ))}
  </div>
);

const AvatarSkeleton = ({ lines = 3 }) => (
  <div className="navix-loading__avatar-row" aria-hidden="true">
    <span className="navix-skeleton navix-loading__avatar" />
    <div className="navix-loading__text navix-loading__avatar-lines">
      {Array.from({ length: lines }, (_, index) => (
        <span key={index} className="navix-skeleton" style={{ width: `${100 - index * 25}%` }} />
      ))}
    </div>
  </div>
);

const VARIANTS = {
  text: TextSkeleton,
  table: TableSkeleton,
  cards: CardsSkeleton,
  form: FormSkeleton,
  avatar: AvatarSkeleton,
};

const LoadingState = ({ variant = 'text', lines = 4, rows = 4, cols = 4, label = 'Chargement…', className }) => {
  const Variant = VARIANTS[variant] || TextSkeleton;

  return (
    <div className={`navix-loading ${className || ''}`.trim()} role="status" aria-busy="true">
      <span className="visually-hidden">{label}</span>
      <Variant lines={lines} rows={rows} cols={cols} />
    </div>
  );
};

export default memo(LoadingState);
