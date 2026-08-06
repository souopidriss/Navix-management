/**
 * Navix Reports — Descripteurs de colonnes (déclaratif)
 * --------------------------------------------------------------------------
 * Les pages décrivent leurs tableaux de façon 100 % déclarative :
 * `reportColumn(key, label, { format, badge, ... })`.
 *
 * `format`  : clé de formateur (money | number | percent | distance | duration |
 *             date | datetime) — résolu par ReportContentView.
 * `badge`   : getter (value) => { label, variant } — rendu StatusBadge.
 * `render`  : rendu personnalisé (prioritaire sur format/badge).
 */
export const reportColumn = (key, label, options = {}) => ({
  key,
  label,
  align: options.align,
  sortable: options.sortable ?? true,
  width: options.width,
  srOnly: options.srOnly,
  format: options.format,
  badge: options.badge,
  render: options.render,
  searchValue: options.searchValue,
  sortValue: options.sortValue,
});

export const moneyColumn = (key, label, options = {}) =>
  reportColumn(key, label, { ...options, align: 'end', format: 'money' });

export const numberColumn = (key, label, options = {}) =>
  reportColumn(key, label, { ...options, align: 'end', format: 'number' });

export const distanceColumn = (key, label, options = {}) =>
  reportColumn(key, label, { ...options, align: 'end', format: 'distance' });

export const durationColumn = (key, label, options = {}) =>
  reportColumn(key, label, { ...options, align: 'end', format: 'duration' });

export const percentColumn = (key, label, options = {}) =>
  reportColumn(key, label, { ...options, align: 'end', format: 'percent' });
