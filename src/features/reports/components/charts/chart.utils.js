/**
 * Navix Reports — chart.utils
 * --------------------------------------------------------------------------
 * Utilitaires partagés des graphiques du module Reports.
 * Les graphiques sont 100 % CSS / SVG natifs (aucune bibliothèque externe).
 * Les couleurs sont toujours référencées via des variables CSS Bootstrap
 * (thème clair/sombre) — aucune couleur hardcodée.
 */

export const VARIANT_COLORS = {
  primary: 'var(--bs-primary)',
  info: 'var(--bs-info)',
  success: 'var(--bs-success)',
  warning: 'var(--bs-warning)',
  danger: 'var(--bs-danger)',
  secondary: 'var(--bs-secondary)',
  dark: 'var(--bs-dark)',
  light: 'var(--bs-light)',
};

export const LINE_VIEW_W = 640;
export const LINE_VIEW_H = 240;
export const LINE_PAD_TOP = 14;
export const LINE_PAD_BOTTOM = 12;

/**
 * Géométrie d'un graphique en courbes (SVG viewBox 0 0 640 240).
 * La courbe occupe toute la largeur : les libellés d'axe (HTML) s'alignent
 * exactement sous les points via un flex space-between.
 */
export const computeLineGeometry = (labels = []) => {
  const count = labels.length;
  const step = count > 1 ? LINE_VIEW_W / (count - 1) : 0;
  const x = (index) => (count > 1 ? index * step : LINE_VIEW_W / 2);
  const y = (value, max) =>
    LINE_PAD_TOP + (LINE_VIEW_H - LINE_PAD_TOP - LINE_PAD_BOTTOM) * (1 - Number(value || 0) / max);

  const linePath = (values = [], max) =>
    values.map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(value, max).toFixed(1)}`).join(' ');

  const areaPath = (values = [], max) => {
    if (values.length === 0) return '';
    const base = LINE_VIEW_H - LINE_PAD_BOTTOM;
    return `${linePath(values, max)} L${x(values.length - 1).toFixed(1)},${base} L${x(0).toFixed(1)},${base} Z`;
  };

  const gridLines = (max) => [0, 0.5, 1].map((ratio) => y(max * ratio, max));

  return { x, y, linePath, areaPath, gridLines, viewW: LINE_VIEW_W, viewH: LINE_VIEW_H };
};
