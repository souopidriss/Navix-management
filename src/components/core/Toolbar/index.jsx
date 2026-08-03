/**
 * Navix Core — Toolbar
 * --------------------------------------------------------------------------
 * Conteneur générique pour les zones d'action au-dessus d'une liste : champ
 * de recherche, barre de filtres, boutons. Dispose les enfants sur une
 * ligne avec retour à la ligne automatique sur petit écran.
 *
 * Props :
 *   children  : contenu (SearchBar, FilterBar, Button, …)
 *   align     : 'start' | 'between' | 'end' — alignement horizontal (défaut : 'between')
 *   gap       : espacement entre les enfants (sm | md | lg)       (défaut : 'md')
 *   wrap      : booléen — autorise le retour à la ligne            (défaut : true)
 *   className : classes additionnelles
 *   ...rest   : autres attributs (aria-*, data-*, etc.)
 *
 * Exemple :
 *   <Toolbar>
 *     <SearchBar value={search} onChange={setSearch} />
 *     <Button icon="bi-plus-lg">Créer</Button>
 *   </Toolbar>
 */
import { memo } from 'react';
import './Toolbar.css';

const ALIGNMENTS = {
  start: 'navix-toolbar--start',
  between: 'navix-toolbar--between',
  end: 'navix-toolbar--end',
};

const GAPS = {
  sm: 'navix-toolbar--gap-sm',
  md: '',
  lg: 'navix-toolbar--gap-lg',
};

const Toolbar = ({ children, align = 'between', gap = 'md', wrap = true, className, ...rest }) => {
  const classes = [
    'navix-toolbar',
    ALIGNMENTS[align] || ALIGNMENTS.between,
    GAPS[gap],
    !wrap && 'navix-toolbar--nowrap',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
};

export default memo(Toolbar);
