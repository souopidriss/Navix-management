/**
 * Navix Reports — Moteur d'agrégation (fonctions pures)
 * --------------------------------------------------------------------------
 * Toutes les statistiques des rapports sont calculées ici à partir des mocks
 * existants (entreprises, agences, véhicules, chauffeurs, affectations,
 * trajets, carburant, entretiens, documents, abonnements, facturation,
 * audit). Aucun composant ne duplique ce calcul : les pages, hooks et
 * futurs dashboards consomment ces fonctions pures, testables et réutilisables.
 *
 * Contrat de résultat d'un rapport :
 *   {
 *     reportType, period: { from, to, label },
 *     statistics: [{ key, label, value, raw, format, icon, variant, variation, trend }],
 *     series:     { labels: string[], datasets: [{ key, label, values, variant }] },
 *     breakdown:  { labels: string[], values: number[], variants: string[] },
 *     top:        [{ key, label, value, sublabel }],
 *     rows:       [ ...lignes du rapport ],
 *     summary:    { count, ... }
 *   }
 *
 * Multi-tenant simulé : la portée est bornée à l'entreprise de l'utilisateur
 * courant (companyScopeId) — la sécurité réelle sera appliquée par Express.js.
 */
import {
  MOCK_VEHICLES,
  MOCK_COMPANIES_BY_ID,
} from '@/features/vehicles/mocks';
import { MOCK_DRIVERS } from '@/features/drivers/mocks';
import { MOCK_ASSIGNMENTS } from '@/features/assignments/mocks';
import { MOCK_TRIPS } from '@/features/trips/mocks';
import { MOCK_FUEL_RECORDS } from '@/features/fuel/mocks';
import { MOCK_MAINTENANCE_RECORDS } from '@/features/maintenance/mocks';
import { MOCK_DOCUMENTS } from '@/features/documents/mocks';
import {
  MOCK_PLANS,
  MOCK_SUBSCRIPTIONS,
  MOCK_USAGE,
} from '@/features/subscriptions/mocks';
import { MOCK_INVOICES, MOCK_PAYMENTS } from '@/features/billing/mocks';
import { MOCK_AUDIT_LOGS } from '@/features/audit/mocks';
import { MOCK_COMPANIES } from '@/features/companies/mocks';
import { MOCK_AGENCIES } from '@/features/agencies/mocks';
import { MOCK_USERS } from '@/features/users/mocks';
import { VEHICLE_GROUPS, VEHICLE_STATUSES } from '@/features/vehicles/constants';
import {
  computeVariation,
  getVariationDirection,
  formatReportMoney,
  formatReportNumber,
  formatReportPercent,
  formatReportDistance,
  formatReportDuration,
  DEFAULT_CURRENCY,
  TREND_MONTHS,
} from '../constants';

/* --------------------------------------------------------------------------
   Utilitaires de temps
   -------------------------------------------------------------------------- */

/** Extrait la clé de date (YYYY-MM-DD) d'une valeur ISO ou calendaire. */
export const dateKey = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

/** Borne temporelle d'une période (presets + personnalisée). */
export const resolveReportDateRange = (period = '', dateFrom = '', dateTo = '') => {
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
    case 'thisWeek': {
      const day = now.getDay() || 7; // lundi = 1
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
};

/** Période précédente de même durée (fenêtre immédiatement antérieure). */
export const buildPreviousRange = ({ from = '', to = '' } = {}) => {
  if (!from || !to) return { from: '', to: '' };
  const duration = new Date(to).getTime() - new Date(from).getTime();
  if (!Number.isFinite(duration) || duration < 0) return { from: '', to: '' };
  const prevTo = new Date(from).getTime() - 1;
  const prevFrom = prevTo - duration;
  return { from: new Date(prevFrom).toISOString(), to: new Date(prevTo).toISOString() };
};

/** Filtre une liste selon une borne temporelle (true si vide ou inclus). */
export const inRange = (value, { from = '', to = '' } = {}) => {
  const key = dateKey(value);
  if (!key) return true;
  const fromKey = dateKey(from);
  const toKey = dateKey(to);
  if (fromKey && key < fromKey) return false;
  if (toKey && key > toKey) return false;
  return true;
};

/* --------------------------------------------------------------------------
   Filtres génériques
   -------------------------------------------------------------------------- */

/**
 * Restreint une liste à la portée multi-tenant et aux filtres globaux.
 * @param {Array} items
 * @param {object} ctx — { companyScopeId, filters }
 * @returns {Array}
 */
export const scoped = (items, { companyScopeId = '', filters = {} } = {}) =>
  items.filter((item) => {
    if (companyScopeId && item.companyId !== companyScopeId) return false;
    if (filters.companyId && item.companyId !== filters.companyId) return false;
    if (filters.agencyId && item.agencyId && item.agencyId !== filters.agencyId) return false;
    if (filters.vehicleId && item.vehicleId && item.vehicleId !== filters.vehicleId) return false;
    if (filters.driverId && item.driverId && item.driverId !== filters.driverId) return false;
    if (filters.status && item.status && item.status !== filters.status) return false;
    return true;
  });

/** Sélectionne les éléments d'une liste dont la date tombe dans la borne. */
export const inPeriod = (items, range, dateOf) =>
  items.filter((item) => inRange(dateOf(item), range));

/** Somme une valeur numérique sur une liste. */
export const sum = (items, pick) =>
  items.reduce((acc, item) => acc + (Number(pick(item)) || 0), 0);

/** Moyenne d'une valeur numérique sur une liste (0 si vide). */
export const average = (items, pick) => {
  if (!items.length) return 0;
  return sum(items, pick) / items.length;
};

/** Répartition des éléments par clé ({ key: count }). */
export const countBy = (items, keyOf) =>
  items.reduce((acc, item) => {
    const key = keyOf(item) ?? 'autre';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

/* --------------------------------------------------------------------------
   Helpers d'agrégation génériques (réutilisés par les dashboards)
   -------------------------------------------------------------------------- */

/** Valeur minimale d'un champ numérique sur une liste (null si vide). */
export const min = (items, pick) => {
  if (!items.length) return null;
  return Math.min(...items.map((item) => Number(pick(item)) || 0));
};

/** Valeur maximale d'un champ numérique sur une liste (null si vide). */
export const max = (items, pick) => {
  if (!items.length) return null;
  return Math.max(...items.map((item) => Number(pick(item)) || 0));
};

/** Pourcentage d'une partie par rapport à un total (null si total nul). */
export const percentage = (part, total) => {
  const p = Number(part);
  const t = Number(total);
  if (!Number.isFinite(p) || !Number.isFinite(t) || t === 0) return null;
  return (p / t) * 100;
};

/** Ratio d'une partie par rapport à un total (null si total nul). */
export const ratio = (part, total) => {
  const p = Number(part);
  const t = Number(total);
  if (!Number.isFinite(p) || !Number.isFinite(t) || t === 0) return null;
  return p / t;
};

/** Différence absolue entre deux valeurs (null si l'une n'est pas finie). */
export const difference = (a, b) => {
  const x = Number(a);
  const y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return x - y;
};

/** Regroupe une liste par clé ({ key: items[] }). */
export const groupBy = (items, keyOf) =>
  items.reduce((acc, item) => {
    const key = keyOf(item) ?? 'autre';
    acc[key] = acc[key] ?? [];
    acc[key].push(item);
    return acc;
  }, {});

/**
 * Agrége une valeur numérique par groupe.
 * @param {Array} items
 * @param {Function} keyOf — extrait la clé de groupe
 * @param {Function} valueOf — extrait la valeur numérique
 * @param {boolean} [asAverage] — moyenne au lieu de somme
 * @returns {object} — { [group]: number }
 */
export const aggregateByGroup = (items, keyOf, valueOf, { asAverage = false } = {}) =>
  Object.fromEntries(
    Object.entries(groupBy(items, keyOf)).map(([key, groupItems]) => [
      key,
      asAverage ? average(groupItems, valueOf) : sum(groupItems, valueOf),
    ]),
  );

/* --------------------------------------------------------------------------
   Formatage des indicateurs
   -------------------------------------------------------------------------- */

export const formatValue = (raw, format = 'number') => {
  switch (format) {
    case 'money':
      return formatReportMoney(raw);
    case 'percent':
      return formatReportPercent(raw);
    case 'distance':
      return formatReportDistance(raw);
    case 'duration':
      return formatReportDuration(raw);
    default:
      return formatReportNumber(raw);
  }
};

/** Construit une entrée de carte statistique avec comparaison de période. */
export const toStat = ({ key, label, raw, previous, format = 'number', icon, variant, invert = false }) => {
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
};

/* --------------------------------------------------------------------------
   Séries mensuelles
   -------------------------------------------------------------------------- */

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (date) =>
  date.toLocaleDateString('fr-FR', { month: 'short' });

/**
 * Série mensuelle agrégée (somme ou moyenne) sur la borne fournie.
 * @param {Array} items
 * @param {object} range — { from, to } (vide → TREND_MONTHS derniers mois)
 * @param {Function} dateOf — extrait la date (ISO ou YYYY-MM-DD)
 * @param {Function} valueOf — extrait la valeur numérique
 * @param {boolean} [asAverage] — moyenne au lieu de somme
 * @returns {{ labels: string[], values: number[] }}
 */
export const buildMonthlySeries = (items, range, dateOf, valueOf, { asAverage = false } = {}) => {
  const months = [];
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
};

/* --------------------------------------------------------------------------
   Aides de répartition (breakdown)
   -------------------------------------------------------------------------- */

const DEFAULT_VARIANTS = ['primary', 'info', 'success', 'warning', 'danger', 'secondary', 'dark'];

/** Convertit un compteur { key: count } en breakdown avec libellés. */
export const toBreakdown = (counter, labelOf, variantOf) => {
  const entries = Object.entries(counter).sort((a, b) => b[1] - a[1]);
  return {
    labels: entries.map(([key]) => labelOf(key)),
    values: entries.map(([, value]) => value),
    variants: entries.map(([key], index) => variantOf ? variantOf(key) : DEFAULT_VARIANTS[index % DEFAULT_VARIANTS.length]),
  };
};

/** Libellés et variantes des groupes de véhicules (A→G). */
const vehicleGroupLabel = (key) => VEHICLE_GROUPS[key]?.label ?? key;
const vehicleGroupVariant = (key) => VEHICLE_GROUPS[key]?.variant ?? 'secondary';
const vehicleStatusLabel = (key) => VEHICLE_STATUSES[key]?.label ?? key;

/** Libellé par défaut (met en majuscule la première lettre). */
const capitalize = (value) => (value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : value);

/* --------------------------------------------------------------------------
   Rapport Parc automobile (fleet)
   -------------------------------------------------------------------------- */

export const aggregateFleetReport = (ctx, range, previousRange) => {
  const vehicles = inPeriod(scoped(MOCK_VEHICLES, ctx), range, (v) => v.createdAt);
  const prevVehicles = inPeriod(scoped(MOCK_VEHICLES, ctx), previousRange, (v) => v.createdAt);

  const total = vehicles.length;
  const counts = countBy(vehicles, (v) => v.status);
  const available = counts.available ?? 0;
  const inUse = counts.in_use ?? 0;
  const availabilityRate = total ? ((available + inUse) / total) * 100 : 0;

  const groups = countBy(vehicles, (v) => v.group);

  return {
    reportType: 'fleet',
    period: { ...range },
    statistics: [
      toStat({ key: 'total', label: 'Véhicules', raw: total, previous: prevVehicles.length, format: 'number', icon: 'bi-truck', variant: 'primary' }),
      toStat({ key: 'available', label: 'Disponibles', raw: available, previous: countBy(prevVehicles, (v) => v.status).available ?? 0, format: 'number', icon: 'bi-check-circle', variant: 'success' }),
      toStat({ key: 'inUse', label: 'En mission', raw: inUse, previous: countBy(prevVehicles, (v) => v.status).in_use ?? 0, format: 'number', icon: 'bi-play-circle', variant: 'info' }),
      toStat({ key: 'availabilityRate', label: 'Taux de disponibilité', raw: availabilityRate, previous: prevVehicles.length ? ((countBy(prevVehicles, (v) => v.status).available ?? 0) / prevVehicles.length) * 100 : null, format: 'percent', icon: 'bi-graph-up', variant: 'success', invert: false }),
    ],
    series: {
      labels: [],
      datasets: [],
    },
    breakdown: toBreakdown(groups, vehicleGroupLabel, vehicleGroupVariant),
    top: Object.entries(counts)
      .map(([key, value]) => ({ key, label: vehicleStatusLabel(key), value, sublabel: `${Math.round((value / Math.max(total, 1)) * 100)} %` }))
      .sort((a, b) => b.value - a.value),
    rows: vehicles.map((vehicle) => ({
      id: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      vehicle: `${vehicle.brand} ${vehicle.model}`,
      group: vehicle.group,
      groupLabel: vehicleGroupLabel(vehicle.group),
      status: vehicle.status,
      statusLabel: vehicleStatusLabel(vehicle.status),
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      agency: vehicle.agency,
      companyName: MOCK_COMPANIES_BY_ID[vehicle.companyId]?.name ?? vehicle.companyId,
    })),
    summary: { count: total },
  };
};

/* --------------------------------------------------------------------------
   Rapport Véhicules (vehicles)
   -------------------------------------------------------------------------- */

export const aggregateVehicleReport = (ctx, range, previousRange) => {
  const vehicles = scoped(MOCK_VEHICLES, ctx);
  const fuel = scoped(MOCK_FUEL_RECORDS, ctx);
  const maintenance = scoped(MOCK_MAINTENANCE_RECORDS, ctx);
  const trips = scoped(MOCK_TRIPS, ctx);

  const periodFuel = inPeriod(fuel, range, (f) => f.createdAt);
  const periodMaintenance = inPeriod(maintenance, range, (m) => m.completedAt || m.createdAt);
  const periodTrips = inPeriod(trips, range, (t) => t.departureDate || t.createdAt);

  const totalMileage = sum(vehicles, (v) => v.mileage);
  const fuelCost = sum(periodFuel, (f) => f.totalCost);
  const maintenanceCost = sum(periodMaintenance, (m) => m.actualCost || m.estimatedCost);
  const tripCount = periodTrips.length;

  const rows = vehicles.map((vehicle) => {
    const vehicleFuel = periodFuel.filter((f) => f.vehicleId === vehicle.id);
    const vehicleMaintenance = periodMaintenance.filter((m) => m.vehicleId === vehicle.id);
    const vehicleTrips = periodTrips.filter((t) => t.vehicleId === vehicle.id);
    return {
      id: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      vehicle: `${vehicle.brand} ${vehicle.model}`,
      group: vehicle.group,
      groupLabel: vehicleGroupLabel(vehicle.group),
      status: vehicle.status,
      statusLabel: vehicleStatusLabel(vehicle.status),
      mileage: vehicle.mileage,
      fuelCost: sum(vehicleFuel, (f) => f.totalCost),
      maintenanceCost: sum(vehicleMaintenance, (m) => m.actualCost || m.estimatedCost),
      tripCount: vehicleTrips.length,
      tripDistance: sum(vehicleTrips, (t) => t.actualDistance || t.plannedDistance),
      companyName: MOCK_COMPANIES_BY_ID[vehicle.companyId]?.name ?? vehicle.companyId,
    };
  }).sort((a, b) => b.mileage - a.mileage);

  const prevFuelCost = sum(inPeriod(fuel, previousRange, (f) => f.createdAt), (f) => f.totalCost);
  const prevMaintenanceCost = sum(inPeriod(maintenance, previousRange, (m) => m.completedAt || m.createdAt), (m) => m.actualCost || m.estimatedCost);

  return {
    reportType: 'vehicles',
    period: { ...range },
    statistics: [
      toStat({ key: 'total', label: 'Véhicules', raw: vehicles.length, previous: vehicles.length, format: 'number', icon: 'bi-truck-front', variant: 'primary' }),
      toStat({ key: 'totalMileage', label: 'Kilométrage total', raw: totalMileage, previous: totalMileage, format: 'distance', icon: 'bi-speedometer2', variant: 'info' }),
      toStat({ key: 'fuelCost', label: 'Coût carburant', raw: fuelCost, previous: prevFuelCost, format: 'money', icon: 'bi-fuel-pump', variant: 'warning' }),
      toStat({ key: 'maintenanceCost', label: 'Coût entretien', raw: maintenanceCost, previous: prevMaintenanceCost, format: 'money', icon: 'bi-wrench-adjustable', variant: 'danger', invert: true }),
    ],
    series: {
      labels: [],
      datasets: [],
    },
    breakdown: toBreakdown(countBy(vehicles, (v) => v.group), vehicleGroupLabel, vehicleGroupVariant),
    top: rows.slice(0, 5).map((row) => ({
      key: row.id,
      label: `${row.vehicle} (${row.registrationNumber})`,
      value: row.mileage,
      sublabel: 'km parcourus',
    })),
    rows,
    summary: { count: vehicles.length, tripCount },
  };
};

/* --------------------------------------------------------------------------
   Rapport Chauffeurs (drivers)
   -------------------------------------------------------------------------- */

export const aggregateDriverReport = (ctx, range, previousRange) => {
  const drivers = scoped(MOCK_DRIVERS, ctx);
  const trips = inPeriod(scoped(MOCK_TRIPS, ctx), range, (t) => t.departureDate || t.createdAt);
  const prevTrips = inPeriod(scoped(MOCK_TRIPS, ctx), previousRange, (t) => t.departureDate || t.createdAt);
  const fuel = inPeriod(scoped(MOCK_FUEL_RECORDS, ctx), range, (f) => f.createdAt);

  const rows = drivers
    .map((driver) => {
      const driverTrips = trips.filter((t) => t.driverId === driver.id);
      const driverFuel = fuel.filter((f) => f.driverId === driver.id);
      const distance = sum(driverTrips, (t) => t.actualDistance || t.plannedDistance);
      const duration = sum(driverTrips, (t) => t.actualDuration || t.estimatedDuration);
      return {
        id: driver.id,
        name: driver.fullName,
        status: driver.status,
        licenseCategory: driver.licenseCategory,
        availability: driver.availability,
        companyName: MOCK_COMPANIES_BY_ID[driver.companyId]?.name ?? driver.companyId,
        tripCount: driverTrips.length,
        distance,
        duration,
        fuelRecords: driverFuel.length,
        fuelCost: sum(driverFuel, (f) => f.totalCost),
      };
    })
    .sort((a, b) => b.distance - a.distance);

  const totalDistance = sum(rows, (r) => r.distance);
  const totalDuration = sum(rows, (r) => r.duration);
  const prevDistance = sum(
    prevTrips,
    (t) => t.actualDistance || t.plannedDistance,
  );

  return {
    reportType: 'drivers',
    period: { ...range },
    statistics: [
      toStat({ key: 'total', label: 'Chauffeurs', raw: drivers.length, previous: drivers.length, format: 'number', icon: 'bi-person-badge', variant: 'primary' }),
      toStat({ key: 'tripCount', label: 'Trajets', raw: trips.length, previous: prevTrips.length, format: 'number', icon: 'bi-signpost-split', variant: 'info' }),
      toStat({ key: 'totalDistance', label: 'Distance totale', raw: totalDistance, previous: prevDistance, format: 'distance', icon: 'bi-signpost', variant: 'success' }),
      toStat({ key: 'totalDuration', label: 'Temps de conduite', raw: totalDuration, previous: sum(prevTrips, (t) => t.actualDuration || t.estimatedDuration), format: 'duration', icon: 'bi-clock', variant: 'warning' }),
    ],
    series: {
      labels: [],
      datasets: [],
    },
    breakdown: toBreakdown(countBy(drivers, (d) => d.availability), capitalize),
    top: rows.slice(0, 5).map((row) => ({
      key: row.id,
      label: row.name,
      value: row.distance,
      sublabel: `${row.tripCount} trajets`,
    })),
    rows,
    summary: { count: drivers.length, tripCount: trips.length },
  };
};

/* --------------------------------------------------------------------------
   Rapport Affectations (assignments)
   -------------------------------------------------------------------------- */

export const aggregateAssignmentReport = (ctx, range, previousRange) => {
  const assignments = scoped(MOCK_ASSIGNMENTS, ctx);
  const inPeriodList = (list, r) =>
    list.filter((a) => !r.from || !r.to || (dateKey(a.startDate) >= dateKey(r.from) && dateKey(a.startDate) <= dateKey(r.to)));

  const current = inPeriodList(assignments, range);
  const previous = inPeriodList(assignments, previousRange);
  const counts = countBy(current, (a) => a.status);
  const types = countBy(current, (a) => a.assignmentType);

  const rows = [...current].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((assignment) => {
    const vehicle = MOCK_VEHICLES.find((v) => v.id === assignment.vehicleId);
    const driver = MOCK_DRIVERS.find((d) => d.id === assignment.driverId);
    return {
      id: assignment.id,
      assignmentNumber: assignment.assignmentNumber,
      assignmentType: assignment.assignmentType,
      status: assignment.status,
      startDate: assignment.startDate,
      expectedEndDate: assignment.expectedEndDate,
      endDate: assignment.endDate || '',
      vehicle: vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber})` : '—',
      driver: driver?.fullName ?? '—',
      companyName: MOCK_COMPANIES_BY_ID[assignment.companyId]?.name ?? assignment.companyId,
      startMileage: assignment.startMileage,
      endMileage: assignment.endMileage,
    };
  });

  return {
    reportType: 'assignments',
    period: { ...range },
    statistics: [
      toStat({ key: 'total', label: 'Affectations', raw: current.length, previous: previous.length, format: 'number', icon: 'bi-shuffle', variant: 'primary' }),
      toStat({ key: 'active', label: 'Actives', raw: counts.active ?? 0, previous: countBy(previous, (a) => a.status).active ?? 0, format: 'number', icon: 'bi-toggle-on', variant: 'success' }),
      toStat({ key: 'ended', label: 'Terminées', raw: counts.ended ?? 0, previous: countBy(previous, (a) => a.status).ended ?? 0, format: 'number', icon: 'bi-check2-circle', variant: 'info' }),
      toStat({ key: 'cancelled', label: 'Annulées', raw: counts.cancelled ?? 0, previous: countBy(previous, (a) => a.status).cancelled ?? 0, format: 'number', icon: 'bi-x-circle', variant: 'danger' }),
    ],
    series: {
      labels: [],
      datasets: [],
    },
    breakdown: toBreakdown(types, capitalize),
    top: Object.entries(counts)
      .map(([key, value]) => ({ key, label: capitalize(key), value, sublabel: `${Math.round((value / Math.max(current.length, 1)) * 100)} %` }))
      .sort((a, b) => b.value - a.value),
    rows,
    summary: { count: current.length },
  };
};

/* --------------------------------------------------------------------------
   Rapport Trajets (trips)
   -------------------------------------------------------------------------- */

export const aggregateTripReport = (ctx, range, previousRange) => {
  const trips = inPeriod(scoped(MOCK_TRIPS, ctx), range, (t) => t.departureDate || t.createdAt);
  const prevTrips = inPeriod(scoped(MOCK_TRIPS, ctx), previousRange, (t) => t.departureDate || t.createdAt);

  const totalDistance = sum(trips, (t) => t.actualDistance || t.plannedDistance);
  const completed = trips.filter((t) => t.status === 'completed');
  const onTimeRate = completed.length ? (completed.filter((t) => t.actualDistance > 0).length / completed.length) * 100 : 0;
  const types = countBy(trips, (t) => t.tripType);

  const rows = [...trips].sort((a, b) => (b.departureDate || b.createdAt).localeCompare(a.departureDate || a.createdAt)).map((trip) => {
    const vehicle = MOCK_VEHICLES.find((v) => v.id === trip.vehicleId);
    const driver = MOCK_DRIVERS.find((d) => d.id === trip.driverId);
    return {
      id: trip.id,
      tripNumber: trip.tripNumber,
      tripType: trip.tripType,
      purpose: trip.purpose,
      status: trip.status,
      departureDate: trip.departureDate,
      departure: trip.departureLocation,
      arrival: trip.arrivalLocation,
      distance: trip.actualDistance || trip.plannedDistance,
      duration: trip.actualDuration || trip.estimatedDuration,
      vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
      driver: driver?.fullName ?? '—',
      companyName: MOCK_COMPANIES_BY_ID[trip.companyId]?.name ?? trip.companyId,
    };
  });

  return {
    reportType: 'trips',
    period: { ...range },
    statistics: [
      toStat({ key: 'total', label: 'Trajets', raw: trips.length, previous: prevTrips.length, format: 'number', icon: 'bi-signpost-split', variant: 'primary' }),
      toStat({ key: 'distance', label: 'Distance parcourue', raw: totalDistance, previous: sum(prevTrips, (t) => t.actualDistance || t.plannedDistance), format: 'distance', icon: 'bi-signpost', variant: 'info' }),
      toStat({ key: 'onTimeRate', label: 'Taux de complétion', raw: onTimeRate, previous: prevTrips.length ? (prevTrips.filter((t) => t.status === 'completed').length / prevTrips.length) * 100 : null, format: 'percent', icon: 'bi-check-circle', variant: 'success' }),
      toStat({ key: 'avgDistance', label: 'Distance moyenne', raw: trips.length ? totalDistance / trips.length : 0, previous: prevTrips.length ? sum(prevTrips, (t) => t.actualDistance || t.plannedDistance) / prevTrips.length : null, format: 'distance', icon: 'bi-arrow-left-right', variant: 'warning' }),
    ],
    series: buildMonthlySeries(trips, range, (t) => t.departureDate || t.createdAt, (t) => t.actualDistance || t.plannedDistance),
    breakdown: toBreakdown(types, capitalize),
    top: rows.slice(0, 5).map((row) => ({
      key: row.id,
      label: `${row.tripNumber} — ${row.purpose || row.departure}`,
      value: row.distance,
      sublabel: 'km',
    })),
    rows,
    summary: { count: trips.length, distance: totalDistance },
  };
};

/* --------------------------------------------------------------------------
   Rapport Carburant (fuel)
   -------------------------------------------------------------------------- */

export const aggregateFuelReport = (ctx, range, previousRange) => {
  const records = inPeriod(scoped(MOCK_FUEL_RECORDS, ctx), range, (f) => f.createdAt);
  const prevRecords = inPeriod(scoped(MOCK_FUEL_RECORDS, ctx), previousRange, (f) => f.createdAt);

  const totalCost = sum(records, (f) => f.totalCost);
  const totalQuantity = sum(records, (f) => f.quantity);
  const validated = records.filter((f) => f.status === 'validated');
  const anomalies = records.filter((f) => f.status === 'cancelled' || /anormal|incoh|douteux/i.test(f.notes || ''));
  const avgConsumption = validated.length ? average(validated, (f) => f.consumptionAverage) : 0;
  const fuelTypes = countBy(records, (f) => f.fuelType);

  const rows = [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((record) => {
    const vehicle = MOCK_VEHICLES.find((v) => v.id === record.vehicleId);
    const driver = MOCK_DRIVERS.find((d) => d.id === record.driverId);
    return {
      id: record.id,
      fuelNumber: record.fuelNumber,
      fuelType: record.fuelType,
      status: record.status,
      quantity: record.quantity,
      unitPrice: record.unitPrice,
      totalCost: record.totalCost,
      mileage: record.mileage,
      consumptionAverage: record.consumptionAverage,
      station: record.stationName,
      city: record.stationCity,
      vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
      driver: driver?.fullName ?? '—',
      createdAt: record.createdAt,
      companyName: MOCK_COMPANIES_BY_ID[record.companyId]?.name ?? record.companyId,
    };
  });

  return {
    reportType: 'fuel',
    period: { ...range },
    statistics: [
      toStat({ key: 'totalCost', label: 'Dépenses carburant', raw: totalCost, previous: sum(prevRecords, (f) => f.totalCost), format: 'money', icon: 'bi-cash-coin', variant: 'warning', invert: true }),
      toStat({ key: 'totalQuantity', label: 'Volume', raw: totalQuantity, previous: sum(prevRecords, (f) => f.quantity), format: 'number', icon: 'bi-fuel-pump', variant: 'primary' }),
      toStat({ key: 'avgConsumption', label: 'Consommation moyenne', raw: avgConsumption, previous: prevRecords.filter((f) => f.status === 'validated').length ? average(prevRecords.filter((f) => f.status === 'validated'), (f) => f.consumptionAverage) : null, format: 'number', icon: 'bi-speedometer2', variant: 'info', invert: true }),
      toStat({ key: 'anomalies', label: 'Anomalies', raw: anomalies.length, previous: prevRecords.filter((f) => f.status === 'cancelled' || /anormal|incoh|douteux/i.test(f.notes || '')).length, format: 'number', icon: 'bi-exclamation-triangle', variant: 'danger' }),
    ],
    series: buildMonthlySeries(records, range, (f) => f.createdAt, (f) => f.totalCost),
    breakdown: toBreakdown(fuelTypes, capitalize),
    top: rows.slice(0, 5).map((row) => ({
      key: row.id,
      label: `${row.fuelNumber} — ${row.vehicle}`,
      value: row.totalCost,
      sublabel: `${formatReportNumber(row.quantity)} L`,
    })),
    rows,
    summary: { count: records.length, totalCost },
  };
};

/* --------------------------------------------------------------------------
   Rapport Entretiens (maintenance)
   -------------------------------------------------------------------------- */

export const aggregateMaintenanceReport = (ctx, range, previousRange) => {
  const records = scoped(MOCK_MAINTENANCE_RECORDS, ctx);
  const dateOf = (m) => m.completedAt || m.scheduledDate || m.createdAt;
  const current = inPeriod(records, range, dateOf);
  const previous = inPeriod(records, previousRange, dateOf);

  const counts = countBy(current, (m) => m.status);
  const actualCost = sum(current, (m) => m.actualCost || 0);
  const estimatedCost = sum(current, (m) => m.estimatedCost || 0);
  const completed = current.filter((m) => m.status === 'completed');
  const onTimeRate = completed.length
    ? (completed.filter((m) => !m.completedAt || m.completedAt >= m.scheduledDate).length / completed.length) * 100
    : 0;
  const types = countBy(current, (m) => m.maintenanceType);

  const rows = [...current].sort((a, b) => dateOf(b).localeCompare(dateOf(a))).map((record) => {
    const vehicle = MOCK_VEHICLES.find((v) => v.id === record.vehicleId);
    return {
      id: record.id,
      maintenanceNumber: record.maintenanceNumber,
      maintenanceType: record.maintenanceType,
      priority: record.priority,
      status: record.status,
      scheduledDate: record.scheduledDate,
      completedAt: record.completedAt || '',
      estimatedCost: record.estimatedCost,
      actualCost: record.actualCost || 0,
      workshop: record.workshop,
      vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
      companyName: MOCK_COMPANIES_BY_ID[record.companyId]?.name ?? record.companyId,
    };
  });

  return {
    reportType: 'maintenance',
    period: { ...range },
    statistics: [
      toStat({ key: 'total', label: 'Entretiens', raw: current.length, previous: previous.length, format: 'number', icon: 'bi-wrench-adjustable', variant: 'primary' }),
      toStat({ key: 'actualCost', label: 'Coût réel', raw: actualCost, previous: sum(previous, (m) => m.actualCost || 0), format: 'money', icon: 'bi-cash-coin', variant: 'danger', invert: true }),
      toStat({ key: 'estimatedCost', label: 'Coût estimé', raw: estimatedCost, previous: sum(previous, (m) => m.estimatedCost || 0), format: 'money', icon: 'bi-receipt', variant: 'warning' }),
      toStat({ key: 'onTimeRate', label: 'Taux d’achèvement', raw: onTimeRate, previous: null, format: 'percent', icon: 'bi-check2-circle', variant: 'success' }),
    ],
    series: buildMonthlySeries(current, range, dateOf, (m) => m.actualCost || m.estimatedCost),
    breakdown: toBreakdown(types, capitalize),
    top: Object.entries(counts)
      .map(([key, value]) => ({ key, label: capitalize(key), value, sublabel: `${Math.round((value / Math.max(current.length, 1)) * 100)} %` }))
      .sort((a, b) => b.value - a.value),
    rows,
    summary: { count: current.length, actualCost },
  };
};

/* --------------------------------------------------------------------------
   Rapport Documents (documents)
   -------------------------------------------------------------------------- */

export const aggregateDocumentReport = (ctx, range, previousRange) => {
  const documents = inPeriod(scoped(MOCK_DOCUMENTS, ctx), range, (d) => d.createdAt);
  const prevDocuments = inPeriod(scoped(MOCK_DOCUMENTS, ctx), previousRange, (d) => d.createdAt);

  const totalSize = sum(documents, (d) => d.size || 0);
  const categories = countBy(documents, (d) => d.category || 'autre');
  const visibility = countBy(documents, (d) => d.visibility || 'private');

  const rows = [...documents].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((document) => {
    const vehicle = MOCK_VEHICLES.find((v) => v.id === document.associationId);
    return {
      id: document.id,
      name: document.name,
      category: document.category,
      extension: document.extension,
      size: document.size,
      visibility: document.visibility,
      associationType: document.associationType,
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt,
      vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
      companyName: MOCK_COMPANIES_BY_ID[document.companyId]?.name ?? document.companyId,
    };
  });

  return {
    reportType: 'documents',
    period: { ...range },
    statistics: [
      toStat({ key: 'total', label: 'Documents', raw: documents.length, previous: prevDocuments.length, format: 'number', icon: 'bi-file-earmark-text', variant: 'primary' }),
      toStat({ key: 'totalSize', label: 'Stockage utilisé', raw: totalSize, previous: sum(prevDocuments, (d) => d.size || 0), format: 'number', icon: 'bi-database', variant: 'info' }),
      toStat({ key: 'public', label: 'Publics', raw: visibility.public ?? 0, previous: countBy(prevDocuments, (d) => d.visibility || 'private').public ?? 0, format: 'number', icon: 'bi-eye', variant: 'success' }),
      toStat({ key: 'private', label: 'Privés', raw: visibility.private ?? 0, previous: countBy(prevDocuments, (d) => d.visibility || 'private').private ?? 0, format: 'number', icon: 'bi-lock', variant: 'warning' }),
    ],
    series: buildMonthlySeries(documents, range, (d) => d.createdAt, (d) => d.size || 0),
    breakdown: toBreakdown(categories, capitalize),
    top: rows.slice(0, 5).map((row) => ({
      key: row.id,
      label: row.name,
      value: row.size,
      sublabel: `${row.category} — ${row.extension}`,
    })),
    rows,
    summary: { count: documents.length },
  };
};

/* --------------------------------------------------------------------------
   Rapport Finances (financial)
   -------------------------------------------------------------------------- */

export const aggregateFinancialReport = (ctx, range, previousRange) => {
  const invoices = inPeriod(scoped(MOCK_INVOICES, ctx), range, (i) => i.issuedDate);
  const prevInvoices = inPeriod(scoped(MOCK_INVOICES, ctx), previousRange, (i) => i.issuedDate);
  const payments = inPeriod(scoped(MOCK_PAYMENTS, ctx), range, (p) => p.paymentDate || p.createdAt);
  const prevPayments = inPeriod(scoped(MOCK_PAYMENTS, ctx), previousRange, (p) => p.paymentDate || p.createdAt);

  const totalInvoiced = sum(invoices, (i) => i.total || 0);
  const totalPaid = sum(payments.filter((p) => p.status === 'successful'), (p) => p.amount || 0);
  const outstanding = sum(invoices, (i) => i.amountDue ?? i.total ?? 0);
  const statuses = countBy(invoices, (i) => i.status);

  const rows = [...invoices]
    .sort((a, b) => (b.issuedDate || b.createdAt || '').localeCompare(a.issuedDate || a.createdAt || ''))
    .map((invoice) => {
    const company = MOCK_COMPANIES.find((c) => c.id === invoice.companyId);
    return {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      currency: invoice.currency,
      issuedDate: invoice.issuedDate,
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate || '',
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      amountPaid: invoice.amountPaid,
      amountDue: invoice.amountDue,
      companyName: company?.name ?? invoice.companyId,
    };
  });

  return {
    reportType: 'financial',
    period: { ...range },
    statistics: [
      toStat({ key: 'totalInvoiced', label: 'Facturé', raw: totalInvoiced, previous: sum(prevInvoices, (i) => i.total || 0), format: 'money', icon: 'bi-receipt', variant: 'primary' }),
      toStat({ key: 'totalPaid', label: 'Encaissé', raw: totalPaid, previous: sum(prevPayments.filter((p) => p.status === 'successful'), (p) => p.amount || 0), format: 'money', icon: 'bi-cash-coin', variant: 'success' }),
      toStat({ key: 'outstanding', label: 'En attente', raw: outstanding, previous: sum(prevInvoices, (i) => i.amountDue ?? i.total ?? 0), format: 'money', icon: 'bi-hourglass-split', variant: 'warning' }),
      toStat({ key: 'collectionRate', label: 'Taux de recouvrement', raw: totalInvoiced ? (totalPaid / totalInvoiced) * 100 : 0, previous: prevInvoices.length && sum(prevInvoices, (i) => i.total || 0) ? (sum(prevPayments.filter((p) => p.status === 'successful'), (p) => p.amount || 0) / sum(prevInvoices, (i) => i.total || 0)) * 100 : null, format: 'percent', icon: 'bi-graph-up-arrow', variant: 'success' }),
    ],
    series: {
      labels: buildMonthlySeries(invoices, range, (i) => i.issuedDate, (i) => i.total || 0).labels,
      datasets: [
        { key: 'invoiced', label: 'Facturé', values: buildMonthlySeries(invoices, range, (i) => i.issuedDate, (i) => i.total || 0).values, variant: 'primary' },
        { key: 'paid', label: 'Encaissé', values: buildMonthlySeries(payments.filter((p) => p.status === 'successful'), range, (p) => p.paymentDate || p.createdAt, (p) => p.amount || 0).values, variant: 'success' },
      ],
    },
    breakdown: toBreakdown(statuses, capitalize),
    top: rows.slice(0, 5).map((row) => ({
      key: row.id,
      label: row.number,
      value: row.total,
      sublabel: row.companyName,
    })),
    rows,
    summary: { count: invoices.length, totalInvoiced, totalPaid },
  };
};

/* --------------------------------------------------------------------------
   Rapport Abonnements (subscriptions)
   -------------------------------------------------------------------------- */

export const aggregateSubscriptionReport = (ctx, range, _previousRange) => {
  const subscriptions = scoped(MOCK_SUBSCRIPTIONS, ctx);
  const plans = MOCK_PLANS;

  const statuses = countBy(subscriptions, (s) => s.status);
  const active = subscriptions.filter((s) => s.status === 'active');
  const mrr = sum(active, (s) => s.price || 0);
  const byPlan = subscriptions.reduce((acc, subscription) => {
    const code = plans.find((p) => p.id === subscription.planId)?.code ?? subscription.planId;
    acc[code] = (acc[code] ?? 0) + 1;
    return acc;
  }, {});

  const rows = [...subscriptions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((subscription) => {
    const plan = plans.find((p) => p.id === subscription.planId);
    const company = MOCK_COMPANIES.find((c) => c.id === subscription.companyId);
    return {
      id: subscription.id,
      companyName: company?.name ?? subscription.companyId,
      plan: plan?.name ?? '—',
      planCode: plan?.code ?? '—',
      status: subscription.status,
      price: subscription.price,
      currency: subscription.currency,
      billingInterval: subscription.billingInterval,
      currentPeriodEnd: subscription.currentPeriodEnd,
      renewalDate: subscription.renewalDate || '',
      startDate: subscription.startDate,
    };
  });

  const planLabels = plans.reduce((acc, plan) => {
    acc[plan.code] = plan.name;
    return acc;
  }, {});

  return {
    reportType: 'subscriptions',
    period: { ...range },
    statistics: [
      toStat({ key: 'total', label: 'Abonnements', raw: subscriptions.length, previous: subscriptions.length, format: 'number', icon: 'bi-credit-card', variant: 'primary' }),
      toStat({ key: 'active', label: 'Actifs', raw: active.length, previous: active.length, format: 'number', icon: 'bi-toggle-on', variant: 'success' }),
      toStat({ key: 'mrr', label: 'Revenu mensuel (MRR)', raw: mrr, previous: mrr, format: 'money', icon: 'bi-graph-up', variant: 'info' }),
      toStat({ key: 'trialing', label: 'En essai', raw: statuses.trialing ?? 0, previous: statuses.trialing ?? 0, format: 'number', icon: 'bi-hourglass-split', variant: 'warning' }),
    ],
    series: {
      labels: [],
      datasets: [],
    },
    breakdown: toBreakdown(byPlan, (key) => planLabels[key] ?? key),
    top: rows.slice(0, 5).map((row) => ({
      key: row.id,
      label: row.companyName,
      value: row.price,
      sublabel: `${row.plan} — ${row.status}`,
    })),
    rows,
    summary: { count: subscriptions.length, mrr },
  };
};

/* --------------------------------------------------------------------------
   Rapport Journal des actions (audit)
   -------------------------------------------------------------------------- */

export const aggregateAuditReport = (ctx, range, previousRange) => {
  const logs = inPeriod(scoped(MOCK_AUDIT_LOGS, ctx), range, (l) => l.createdAt);
  const prevLogs = inPeriod(scoped(MOCK_AUDIT_LOGS, ctx), previousRange, (l) => l.createdAt);

  const statuses = countBy(logs, (l) => l.status);
  const severities = countBy(logs, (l) => l.severity);
  const types = countBy(logs, (l) => l.actionType);

  const rows = [...logs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((log) => ({
    id: log.id,
    userName: log.userName,
    action: log.action,
    actionType: log.actionType,
    resourceType: log.resourceType,
    resourceName: log.resourceName,
    status: log.status,
    severity: log.severity,
    description: log.description,
    companyName: log.companyName,
    createdAt: log.createdAt,
  }));

  return {
    reportType: 'audit',
    period: { ...range },
    statistics: [
      toStat({ key: 'total', label: 'Événements', raw: logs.length, previous: prevLogs.length, format: 'number', icon: 'bi-journal-text', variant: 'primary' }),
      toStat({ key: 'success', label: 'Réussis', raw: statuses.success ?? 0, previous: countBy(prevLogs, (l) => l.status).success ?? 0, format: 'number', icon: 'bi-check-circle', variant: 'success' }),
      toStat({ key: 'failed', label: 'Échoués', raw: statuses.failed ?? 0, previous: countBy(prevLogs, (l) => l.status).failed ?? 0, format: 'number', icon: 'bi-x-octagon', variant: 'danger' }),
      toStat({ key: 'critical', label: 'Critiques', raw: severities.critical ?? 0, previous: countBy(prevLogs, (l) => l.severity).critical ?? 0, format: 'number', icon: 'bi-exclamation-octagon', variant: 'danger' }),
    ],
    series: buildMonthlySeries(logs, range, (l) => l.createdAt, () => 1),
    breakdown: toBreakdown(types, capitalize),
    top: rows.slice(0, 5).map((row) => ({
      key: row.id,
      label: `${row.userName} — ${row.resourceName || row.resourceType}`,
      value: 1,
      sublabel: row.action,
    })),
    rows,
    summary: { count: logs.length },
  };
};

/* --------------------------------------------------------------------------
   Rapport Entreprises (companies — consolidation plateforme)
   -------------------------------------------------------------------------- */

export const aggregateCompanyReport = (ctx, range, _previousRange) => {
  const companies = MOCK_COMPANIES;
  const scopedCompanies = ctx.companyScopeId
    ? companies.filter((c) => c.id === ctx.companyScopeId)
    : companies;

  const statuses = countBy(scopedCompanies, (c) => c.status);
  const activeCount = statuses.active ?? 0;
  const totalVehicles = sum(scopedCompanies, (c) => c.vehicleCount || 0);
  const totalDrivers = sum(scopedCompanies, (c) => c.driverCount || 0);

  const rows = scopedCompanies.map((company) => {
    const plan = plansByCode[company.subscriptionPlan] ?? null;
    return {
      id: company.id,
      name: company.name,
      code: company.code,
      country: company.country,
      city: company.city,
      status: company.status,
      subscriptionPlan: company.subscriptionPlan,
      subscriptionStatus: company.subscriptionStatus,
      vehicleCount: company.vehicleCount,
      driverCount: company.driverCount,
      agencyCount: company.agencyCount,
      ownerName: company.owner?.name ?? '—',
      planLabel: plan?.name ?? company.subscriptionPlan,
      createdAt: company.createdAt,
    };
  }).sort((a, b) => b.vehicleCount - a.vehicleCount);

  return {
    reportType: 'companies',
    period: { ...range },
    statistics: [
      toStat({ key: 'total', label: 'Entreprises', raw: scopedCompanies.length, previous: scopedCompanies.length, format: 'number', icon: 'bi-buildings', variant: 'primary' }),
      toStat({ key: 'active', label: 'Actives', raw: activeCount, previous: activeCount, format: 'number', icon: 'bi-toggle-on', variant: 'success' }),
      toStat({ key: 'vehicles', label: 'Véhicules', raw: totalVehicles, previous: totalVehicles, format: 'number', icon: 'bi-truck', variant: 'info' }),
      toStat({ key: 'drivers', label: 'Chauffeurs', raw: totalDrivers, previous: totalDrivers, format: 'number', icon: 'bi-person-badge', variant: 'warning' }),
    ],
    series: {
      labels: [],
      datasets: [],
    },
    breakdown: toBreakdown(statuses, capitalize),
    top: rows.slice(0, 5).map((row) => ({
      key: row.id,
      label: row.name,
      value: row.vehicleCount,
      sublabel: `${row.driverCount} chauffeurs`,
    })),
    rows,
    summary: { count: scopedCompanies.length, totalVehicles },
  };
};

/* Carte plan code → plan (partagée par le rapport entreprises). */
const plansByCode = MOCK_PLANS.reduce((acc, plan) => {
  acc[plan.code] = plan;
  return acc;
}, {});

/* --------------------------------------------------------------------------
   Rapport personnalisé (constructeur)
   -------------------------------------------------------------------------- */

const AGGREGATE_BY_SOURCE = {
  fleet: aggregateFleetReport,
  vehicles: aggregateVehicleReport,
  drivers: aggregateDriverReport,
  assignments: aggregateAssignmentReport,
  trips: aggregateTripReport,
  fuel: aggregateFuelReport,
  maintenance: aggregateMaintenanceReport,
  documents: aggregateDocumentReport,
  financial: aggregateFinancialReport,
  subscriptions: aggregateSubscriptionReport,
  audit: aggregateAuditReport,
  companies: aggregateCompanyReport,
};

/** Indicateurs proposés par source du rapport personnalisé. */
export const CUSTOM_INDICATORS_BY_SOURCE = {
  fleet: [
    { key: 'total', label: 'Véhicules', format: 'number' },
    { key: 'availabilityRate', label: 'Taux de disponibilité', format: 'percent' },
  ],
  vehicles: [
    { key: 'total', label: 'Véhicules', format: 'number' },
    { key: 'totalMileage', label: 'Kilométrage total', format: 'distance' },
    { key: 'fuelCost', label: 'Coût carburant', format: 'money' },
    { key: 'maintenanceCost', label: 'Coût entretien', format: 'money' },
  ],
  drivers: [
    { key: 'tripCount', label: 'Trajets', format: 'number' },
    { key: 'totalDistance', label: 'Distance totale', format: 'distance' },
    { key: 'totalDuration', label: 'Temps de conduite', format: 'duration' },
  ],
  assignments: [
    { key: 'total', label: 'Affectations', format: 'number' },
    { key: 'active', label: 'Actives', format: 'number' },
  ],
  trips: [
    { key: 'total', label: 'Trajets', format: 'number' },
    { key: 'distance', label: 'Distance parcourue', format: 'distance' },
    { key: 'onTimeRate', label: 'Taux de complétion', format: 'percent' },
  ],
  fuel: [
    { key: 'totalCost', label: 'Dépenses carburant', format: 'money' },
    { key: 'totalQuantity', label: 'Volume', format: 'number' },
    { key: 'avgConsumption', label: 'Consommation moyenne', format: 'number' },
    { key: 'anomalies', label: 'Anomalies', format: 'number' },
  ],
  maintenance: [
    { key: 'total', label: 'Entretiens', format: 'number' },
    { key: 'actualCost', label: 'Coût réel', format: 'money' },
    { key: 'estimatedCost', label: 'Coût estimé', format: 'money' },
  ],
  documents: [
    { key: 'total', label: 'Documents', format: 'number' },
    { key: 'totalSize', label: 'Stockage utilisé', format: 'number' },
  ],
  financial: [
    { key: 'totalInvoiced', label: 'Facturé', format: 'money' },
    { key: 'totalPaid', label: 'Encaissé', format: 'money' },
    { key: 'outstanding', label: 'En attente', format: 'money' },
  ],
  subscriptions: [
    { key: 'total', label: 'Abonnements', format: 'number' },
    { key: 'active', label: 'Actifs', format: 'number' },
    { key: 'mrr', label: 'MRR', format: 'money' },
  ],
  audit: [
    { key: 'total', label: 'Événements', format: 'number' },
    { key: 'failed', label: 'Échoués', format: 'number' },
    { key: 'critical', label: 'Critiques', format: 'number' },
  ],
  companies: [
    { key: 'total', label: 'Entreprises', format: 'number' },
    { key: 'vehicles', label: 'Véhicules', format: 'number' },
  ],
};

/**
 * Construit un rapport personnalisé à partir d'une source et d'indicateurs.
 * @param {object} config — { source, indicators, period, dateFrom, dateTo, filters }
 * @param {object} ctx — { companyScopeId }
 * @returns {object} — rapport au même contrat que les agrégats
 */
export const buildCustomReport = (config = {}, ctx = {}) => {
  const { source = 'fleet', indicators = [], period = 'thisMonth', dateFrom = '', dateTo = '', filters = {} } = config;
  const aggregate = AGGREGATE_BY_SOURCE[source] ?? aggregateFleetReport;
  const range = resolveReportDateRange(period, dateFrom, dateTo);
  const base = aggregate({ companyScopeId: ctx.companyScopeId ?? '', filters }, range, buildPreviousRange(range));

  const candidates = CUSTOM_INDICATORS_BY_SOURCE[source] ?? [];
  const selected = indicators.length
    ? candidates.filter((candidate) => indicators.includes(candidate.key))
    : candidates.slice(0, 3);

  return {
    ...base,
    reportType: 'custom',
    source,
    statistics: selected.map((candidate) => {
      const stat = base.statistics.find((s) => s.key === candidate.key);
      if (stat) return stat;
      return toStat({ key: candidate.key, label: candidate.label, raw: 0, previous: 0, format: candidate.format });
    }),
    rows: base.rows,
    summary: { ...base.summary, source },
  };
};

/* --------------------------------------------------------------------------
   Aperçu analytique (dashboard cross-domaines)
   -------------------------------------------------------------------------- */

const statOf = (report, key) => report?.statistics?.find((stat) => stat.key === key) ?? null;

const vehicleGroupOf = (vehicleId) => MOCK_VEHICLES.find((v) => v.id === vehicleId)?.group ?? 'autre';

/**
 * Aperçu analytique consolidé : réutilise les agrégats par catégorie pour les
 * cartes de pilotage et compose les indicateurs transverses (coût par km,
 * taux d'utilisation, répartition des coûts par groupe) avec les helpers
 * génériques. Aucune duplication de logique métier.
 *
 * @param {object} ctx — { companyScopeId, filters }
 * @param {object} range — borne courante { from, to }
 * @param {object} previousRange — borne précédente { from, to }
 * @returns {object} — contrat de rapport (statistics, series, breakdown, top)
 */
export const aggregateOverviewReport = (ctx, range, previousRange) => {
  const fleet = aggregateFleetReport(ctx, range, previousRange);
  const trips = aggregateTripReport(ctx, range, previousRange);
  const fuel = aggregateFuelReport(ctx, range, previousRange);
  const maintenance = aggregateMaintenanceReport(ctx, range, previousRange);
  const financial = aggregateFinancialReport(ctx, range, previousRange);

  const vehicles = scoped(MOCK_VEHICLES, ctx);
  const fuelRecords = scoped(MOCK_FUEL_RECORDS, ctx);
  const maintenanceRecords = scoped(MOCK_MAINTENANCE_RECORDS, ctx);
  const tripRecords = scoped(MOCK_TRIPS, ctx);
  const maintenanceDateOf = (m) => m.completedAt || m.scheduledDate || m.createdAt;
  const tripDateOf = (t) => t.departureDate || t.createdAt;

  const currentFuel = inPeriod(fuelRecords, range, (f) => f.createdAt);
  const previousFuel = inPeriod(fuelRecords, previousRange, (f) => f.createdAt);
  const currentMaintenance = inPeriod(maintenanceRecords, range, maintenanceDateOf);
  const previousMaintenance = inPeriod(maintenanceRecords, previousRange, maintenanceDateOf);
  const currentTrips = inPeriod(tripRecords, range, tripDateOf);
  const previousTrips = inPeriod(tripRecords, previousRange, tripDateOf);

  /* Coût d'exploitation par kilomètre (carburant + entretien / distance). */
  const currentCosts = sum(currentFuel, (f) => f.totalCost) + sum(currentMaintenance, (m) => m.actualCost || m.estimatedCost);
  const previousCosts = sum(previousFuel, (f) => f.totalCost) + sum(previousMaintenance, (m) => m.actualCost || m.estimatedCost);
  const currentDistance = sum(currentTrips, (t) => t.actualDistance || t.plannedDistance);
  const previousDistance = sum(previousTrips, (t) => t.actualDistance || t.plannedDistance);
  const costPerKm = currentDistance > 0 ? currentCosts / currentDistance : 0;
  const previousCostPerKm = previousDistance > 0 ? previousCosts / previousDistance : null;

  /* Taux d'utilisation de la flotte (véhicules en mission / parc). */
  const vehiclesInPeriod = inPeriod(vehicles, range, (v) => v.createdAt);
  const previousVehiclesInPeriod = inPeriod(vehicles, previousRange, (v) => v.createdAt);
  const inUseCount = countBy(vehiclesInPeriod, (v) => v.status).in_use ?? 0;
  const previousInUseCount = countBy(previousVehiclesInPeriod, (v) => v.status).in_use ?? 0;
  const utilization = percentage(inUseCount, vehiclesInPeriod.length);
  const previousUtilization = percentage(previousInUseCount, previousVehiclesInPeriod.length);

  /* Répartition des coûts d'exploitation par groupe de véhicules. */
  const costEntries = [
    ...currentFuel.map((f) => ({ group: vehicleGroupOf(f.vehicleId), cost: f.totalCost })),
    ...currentMaintenance.map((m) => ({ group: vehicleGroupOf(m.vehicleId), cost: m.actualCost || m.estimatedCost })),
  ];
  const costsByGroup = aggregateByGroup(costEntries, (entry) => entry.group, (entry) => entry.cost);

  /* Top 5 véhicules par coût d'exploitation. */
  const costByVehicle = new Map();
  currentFuel.forEach((f) => costByVehicle.set(f.vehicleId, (costByVehicle.get(f.vehicleId) ?? 0) + f.totalCost));
  currentMaintenance.forEach((m) => costByVehicle.set(m.vehicleId, (costByVehicle.get(m.vehicleId) ?? 0) + (m.actualCost || m.estimatedCost)));
  const top = [...costByVehicle.entries()]
    .map(([vehicleId, cost]) => {
      const vehicle = MOCK_VEHICLES.find((v) => v.id === vehicleId);
      return {
        key: vehicleId,
        label: vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber})` : vehicleId,
        value: cost,
        sublabel: 'coûts d’exploitation',
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const fuelSeries = buildMonthlySeries(currentFuel, range, (f) => f.createdAt, (f) => f.totalCost);
  const maintenanceSeries = buildMonthlySeries(
    currentMaintenance,
    range,
    maintenanceDateOf,
    (m) => m.actualCost || m.estimatedCost,
  );

  return {
    reportType: 'overview',
    period: { ...range },
    statistics: [
      statOf(fleet, 'total'),
      statOf(fleet, 'available'),
      statOf(fleet, 'inUse'),
      statOf(fleet, 'availabilityRate'),
      statOf(trips, 'total'),
      statOf(trips, 'distance'),
      statOf(fuel, 'totalCost'),
      statOf(maintenance, 'actualCost'),
      toStat({
        key: 'costPerKm',
        label: 'Coût d’exploitation / km',
        raw: costPerKm,
        previous: previousCostPerKm,
        format: 'money',
        icon: 'bi-cash-stack',
        variant: 'warning',
        invert: true,
      }),
      toStat({
        key: 'utilization',
        label: 'Taux d’utilisation',
        raw: utilization ?? 0,
        previous: previousUtilization,
        format: 'percent',
        icon: 'bi-graph-up-arrow',
        variant: 'info',
      }),
      statOf(fuel, 'avgConsumption'),
      statOf(financial, 'totalInvoiced'),
      statOf(financial, 'totalPaid'),
      statOf(financial, 'collectionRate'),
    ].filter(Boolean),
    series: {
      labels: fuelSeries.labels,
      datasets: [
        { key: 'fuel', label: 'Carburant', values: fuelSeries.values, variant: 'warning' },
        { key: 'maintenance', label: 'Entretien', values: maintenanceSeries.values, variant: 'danger' },
      ],
    },
    breakdown: toBreakdown(costsByGroup, vehicleGroupLabel, vehicleGroupVariant),
    top,
    rows: [],
    summary: { count: vehiclesInPeriod.length, distance: currentDistance, costs: currentCosts },
  };
};

/* --------------------------------------------------------------------------
   Catalogue d'agrégats
   -------------------------------------------------------------------------- */

export const AGGREGATE_FUNCTIONS = {
  fleet: aggregateFleetReport,
  vehicles: aggregateVehicleReport,
  drivers: aggregateDriverReport,
  assignments: aggregateAssignmentReport,
  trips: aggregateTripReport,
  fuel: aggregateFuelReport,
  maintenance: aggregateMaintenanceReport,
  documents: aggregateDocumentReport,
  financial: aggregateFinancialReport,
  subscriptions: aggregateSubscriptionReport,
  audit: aggregateAuditReport,
  companies: aggregateCompanyReport,
};

/** Labels d'entreprises (pour filtres et tableaux). */
export const buildCompaniesOptions = () =>
  MOCK_COMPANIES.map((company) => ({ value: company.id, label: company.name }));

/** Labels d'agences. */
export const buildAgenciesOptions = () =>
  MOCK_AGENCIES.map((agency) => ({ value: agency.id, label: agency.name }));

/** Labels de véhicules. */
export const buildVehiclesOptions = () =>
  MOCK_VEHICLES.map((vehicle) => ({
    value: vehicle.id,
    label: `${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber})`,
  }));

/** Labels de chauffeurs. */
export const buildDriversOptions = () =>
  MOCK_DRIVERS.map((driver) => ({ value: driver.id, label: driver.fullName }));

/** Labels d'utilisateurs (rapport personnalisé). */
export const buildUsersOptions = () =>
  MOCK_USERS.map((user) => ({ value: user.id, label: user.name ?? user.fullName ?? user.id }));

export const DEFAULT_CURRENCY_VALUE = DEFAULT_CURRENCY;

/** Devise par défaut des montants des rapports financiers. */
export const REPORT_DEFAULT_CURRENCY = DEFAULT_CURRENCY;
