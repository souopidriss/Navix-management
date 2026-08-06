/**
 * Navix Reports — Charts
 * --------------------------------------------------------------------------
 * Graphiques du module Reports, 100 % CSS / SVG natif (aucune bibliothèque
 * externe). API commune : `data = { labels, datasets: [{ key, label, values,
 * variant }] }` pour barres/courbes/aires, `{ labels, values, variants }`
 * pour l'anneau, `values[]` pour la sparkline.
 */
export { default as BarChart } from './BarChart';
export { default as LineChart } from './LineChart';
export { default as AreaChart } from './AreaChart';
export { default as DonutChart } from './DonutChart';
export { default as Sparkline } from './Sparkline';
export { VARIANT_COLORS, computeLineGeometry } from './chart.utils';
