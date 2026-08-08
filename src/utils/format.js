/**
 * Navix Formatting — Utilitaires partagés de formatage
 * --------------------------------------------------------------------------
 * formatDate / formatTime / formatDateTime : mise en forme basée sur dayjs
 * (mêmes jetons que les formats de paramètres, ex. DD/MM/YYYY, HH:mm).
 * formatNumber / formatCurrency : Intl.NumberFormat, la devise est une
 * configuration (méta fournie par l'appelant, ex. CURRENCIES du module
 * billing) — jamais de monnaie en dur.
 */
import dayjs from 'dayjs';

const dateFormatter = (value, format) => {
  if (!value) return '';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(format) : String(value);
};

/** Date formatée (ex. 31/12/2026). */
export const formatDate = (value, format = 'DD/MM/YYYY') => dateFormatter(value, format);

/** Heure formatée (ex. 14:05 ou 02:05 PM). */
export const formatTime = (value, format = 'HH:mm') => dateFormatter(value, format);

/** Date + heure formatées. */
export const formatDateTime = (value, dateFormat = 'DD/MM/YYYY', timeFormat = 'HH:mm') => {
  if (!value) return '';
  const date = formatDate(value, dateFormat);
  const time = formatTime(value, timeFormat);
  return date && time ? `${date} ${time}` : date || time;
};

/** Nombre formaté selon une locale (ex. 1 234 567,89). */
export const formatNumber = (value, { locale = 'fr-FR', maximumFractionDigits = 2 } = {}) => {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(number);
};

/**
 * Montant formaté selon la configuration de devise.
 * @param {number} value — montant
 * @param {string} currency — code devise (ex. 'XAF')
 * @param {object} [options]
 * @param {'symbol'|'code'|'full'} [options.display='symbol'] — mode d'affichage
 * @param {string} [options.locale='fr-FR'] — locale numérique
 * @param {object} [options.meta] — méta devise { label, symbol, code } (ex. CURRENCIES)
 * @returns {string} — ex. « 1 250 FCFA », « 1 250 XAF », « 1 250 Franc CFA (XAF) »
 */
export const formatCurrency = (
  value,
  currency = 'XAF',
  { display = 'symbol', locale = 'fr-FR', meta } = {},
) => {
  if (value === null || value === undefined || value === '') return '';
  const amount = formatNumber(value, { locale });
  if (display === 'code') return `${amount} ${currency}`;
  if (meta) {
    if (display === 'full') return `${amount} ${meta.label}`;
    return `${amount} ${meta.symbol ?? currency}`;
  }
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(value));
  } catch {
    return `${amount} ${currency}`;
  }
};
