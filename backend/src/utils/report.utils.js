const VEHICLE_GROUPS = {
  A: { label: 'Groupe A', variant: 'primary' },
  B: { label: 'Groupe B', variant: 'info' },
  C: { label: 'Groupe C', variant: 'success' },
  D: { label: 'Groupe D', variant: 'warning' },
  E: { label: 'Groupe E', variant: 'danger' },
  F: { label: 'Groupe F', variant: 'secondary' },
  G: { label: 'Groupe G', variant: 'dark' },
};

const VEHICLE_STATUSES = {
  available: { label: 'Disponible', variant: 'success' },
  in_use: { label: 'En mission', variant: 'info' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
  out_of_service: { label: 'Hors service', variant: 'danger' },
};

const VARIANTS = ['primary', 'info', 'success', 'warning', 'danger', 'secondary', 'dark'];

const capitalize = (value) => (value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : value);

export function resolvePeriod(period = '', dateFrom = '', dateTo = '') {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const iso = (d) => d.toISOString();

  switch (period) {
    case 'today': {
      const start = startOfDay(now);
      return { from: iso(start), to: iso(now) };
    }
    case 'yesterday': {
      const end = startOfDay(now);
      const start = new Date(end.getTime() - 86400000);
      return { from: iso(start), to: iso(new Date(end.getTime() - 1)) };
    }
    case 'last7': {
      const start = new Date(now.getTime() - 6 * 86400000);
      return { from: iso(startOfDay(start)), to: iso(now) };
    }
    case 'last30': {
      const start = new Date(now.getTime() - 29 * 86400000);
      return { from: iso(startOfDay(start)), to: iso(now) };
    }
    case 'last90': {
      const start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      return { from: iso(startOfDay(start)), to: iso(now) };
    }
    case 'last180': {
      const start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      return { from: iso(startOfDay(start)), to: iso(now) };
    }
    case 'last365': {
      const start = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
      return { from: iso(startOfDay(start)), to: iso(now) };
    }
    case 'thisWeek': {
      const day = now.getDay() || 7;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
      return { from: iso(start), to: iso(now) };
    }
    case 'lastWeek': {
      const day = now.getDay() || 7;
      const end = startOfDay(now);
      end.setDate(end.getDate() - day);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return { from: iso(start), to: iso(new Date(end.getTime() - 1)) };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: iso(start), to: iso(now) };
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from: iso(start), to: iso(end) };
    }
    case 'thisQuarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      return { from: iso(start), to: iso(now) };
    }
    case 'lastQuarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3 - 3, 1);
      const end = new Date(now.getFullYear(), quarter * 3, 0, 23, 59, 59, 999);
      return { from: iso(start), to: iso(end) };
    }
    case 'thisYear': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { from: iso(start), to: iso(now) };
    }
    case 'lastYear': {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear(), 0, 0, 23, 59, 59, 999);
      return { from: iso(start), to: iso(end) };
    }
    case 'custom':
      return {
        from: dateFrom ? `${dateFrom}T00:00:00.000` : '',
        to: dateTo ? `${dateTo}T23:59:59.999` : '',
      };
    default:
      return { from: '', to: '' };
  }
}

export function buildPreviousRange({ from = '', to = '' } = {}) {
  if (!from || !to) return { from: '', to: '' };
  const duration = new Date(to).getTime() - new Date(from).getTime();
  if (!Number.isFinite(duration) || duration < 0) return { from: '', to: '' };
  const prevTo = new Date(from).getTime() - 1;
  const prevFrom = prevTo - duration;
  return { from: new Date(prevFrom).toISOString(), to: new Date(prevTo).toISOString() };
}

export function dateKey(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(date) {
  return date.toLocaleDateString('fr-FR', { month: 'short' });
}

export function buildMonthlySeries(items, range, dateOf, valueOf, { asAverage = false } = {}) {
  const months = [];
  const TREND_MONTHS = 6;

  if (range.from && range.to) {
    const cursor = new Date(range.from);
    cursor.setDate(1);
    const end = new Date(range.to);
    while (cursor <= end) {
      months.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    if (!months.length) months.push(new Date(range.from));
  } else {
    const now = new Date();
    for (let i = TREND_MONTHS - 1; i >= 0; i -= 1) {
      months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
    }
  }

  const buckets = new Map(months.map((m) => [monthKey(m), []]));
  items.forEach((item) => {
    const date = new Date(dateOf(item));
    if (Number.isNaN(date.getTime())) return;
    const key = monthKey(date);
    if (!buckets.has(key)) return;
    const value = Number(valueOf(item)) || 0;
    buckets.get(key).push(value);
  });

  return {
    labels: months.map(monthLabel),
    values: months.map((m) => {
      const bucket = buckets.get(monthKey(m)) ?? [];
      if (!bucket.length) return 0;
      return asAverage ? bucket.reduce((a, b) => a + b, 0) / bucket.length : bucket.reduce((a, b) => a + b, 0);
    }),
  };
}

export function computeVariation(current, previous) {
  const cur = Number(current);
  const prev = Number(previous);
  if (!Number.isFinite(cur) || !Number.isFinite(prev) || prev === 0) return null;
  return ((cur - prev) / Math.abs(prev)) * 100;
}

export function getVariationDirection(variation, { invert = false } = {}) {
  if (!Number.isFinite(variation)) return 'neutral';
  if (variation === 0) return 'neutral';
  const positive = invert ? variation < 0 : variation > 0;
  return positive ? 'up' : 'down';
}

export function formatValue(raw, format = 'number') {
  const n = Number(raw);
  if (!Number.isFinite(n)) return '—';
  switch (format) {
    case 'money': return `${n.toLocaleString('fr-FR')} XAF`;
    case 'percent': return `${Math.round(n * 100) / 100} %`;
    case 'distance': return `${n.toLocaleString('fr-FR')} km`;
    case 'duration': {
      const h = Math.floor(n);
      const m = Math.round((n - h) * 60);
      if (h === 0) return `${m} min`;
      if (m === 0) return `${h} h`;
      return `${h} h ${m}`;
    }
    default: return n.toLocaleString('fr-FR');
  }
}

export function toStat({ key, label, raw, previous, format = 'number', icon, variant, invert = false }) {
  const variation = computeVariation(raw, previous);
  return {
    key,
    label,
    value: formatValue(raw, format),
    raw,
    format,
    icon,
    variant,
    variation,
    trend: getVariationDirection(variation, { invert }),
  };
}

export function countBy(items, keyOf) {
  return items.reduce((acc, item) => {
    const key = keyOf(item) ?? 'autre';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export function sum(items, pick) {
  return items.reduce((acc, item) => acc + (Number(pick(item)) || 0), 0);
}

export function average(items, pick) {
  if (!items.length) return 0;
  return sum(items, pick) / items.length;
}

export function percentage(part, total) {
  const p = Number(part);
  const t = Number(total);
  if (!Number.isFinite(p) || !Number.isFinite(t) || t === 0) return null;
  return (p / t) * 100;
}

export function toBreakdown(counter, labelOf, variantOf) {
  const entries = Object.entries(counter).sort((a, b) => b[1] - a[1]);
  return {
    labels: entries.map(([key]) => labelOf(key)),
    values: entries.map(([, value]) => value),
    variants: entries.map(([key], index) => (variantOf ? variantOf(key) : VARIANTS[index % VARIANTS.length])),
  };
}

export function vehicleGroupLabel(key) {
  return VEHICLE_GROUPS[key]?.label ?? key;
}

export function vehicleGroupVariant(key) {
  return VEHICLE_GROUPS[key]?.variant ?? 'secondary';
}

export function vehicleStatusLabel(key) {
  return VEHICLE_STATUSES[key]?.label ?? capitalize(key);
}

export function vehicleStatusVariant(key) {
  return VEHICLE_STATUSES[key]?.variant ?? 'secondary';
}

export { capitalize, VEHICLE_GROUPS, VEHICLE_STATUSES, VARIANTS };
