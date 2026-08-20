import reportRepository from '../../repositories/ReportRepository.js';
import {
  resolvePeriod, buildPreviousRange, toStat, countBy, sum, average, percentage,
  buildMonthlySeries, toBreakdown, capitalize, vehicleGroupLabel, vehicleGroupVariant,
  vehicleStatusLabel, vehicleStatusVariant,
} from '../../utils/report.utils.js';
import {
  REPORT_TYPE_META, CUSTOM_INDICATORS_BY_SOURCE,
} from './index.js';

function buildReportBase(reportType, range, _previousRange) {
  return {
    reportType,
    period: { from: range.from || '', to: range.to || '' },
    statistics: [],
    series: { labels: [], datasets: [] },
    breakdown: { labels: [], values: [], variants: [] },
    top: [],
    rows: [],
    summary: {},
  };
}

/* -----------------------------------------------------------------------
   VEHICLE LOOKUP MAP
   ----------------------------------------------------------------------- */

async function getVehicleMap(companyId) {
  const vehicles = await reportRepository.getVehicleNames(companyId);
  return new Map(vehicles.map((v) => [v.id, v]));
}

async function getDriverMap(companyId) {
  const drivers = await reportRepository.getDriverNames(companyId);
  return new Map(drivers.map((d) => [d.id, d]));
}

/* -----------------------------------------------------------------------
   FLEET REPORT
   ----------------------------------------------------------------------- */

async function generateFleetReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const vehicles = await reportRepository.getFleetData(companyId, range);
  const prevVehicles = previousRange.from
    ? await reportRepository.getFleetData(companyId, previousRange)
    : [];

  const total = vehicles.length;
  const counts = countBy(vehicles, (v) => v.status);
  const available = counts.available ?? 0;
  const inUse = counts.in_use ?? 0;
  const availabilityRate = total ? ((available + inUse) / total) * 100 : 0;

  const prevCounts = countBy(prevVehicles, (v) => v.status);
  const prevAvailable = prevCounts.available ?? 0;
  const prevInUse = prevCounts.in_use ?? 0;
  const prevAvailabilityRate = prevVehicles.length ? ((prevAvailable + prevInUse) / prevVehicles.length) * 100 : null;

  const groups = countBy(vehicles, (v) => v.group_code || 'autre');

  const report = buildReportBase('fleet', range, previousRange);
  report.statistics = [
    toStat({ key: 'total', label: 'Véhicules', raw: total, previous: prevVehicles.length, format: 'number', icon: 'bi-truck', variant: 'primary' }),
    toStat({ key: 'available', label: 'Disponibles', raw: available, previous: prevAvailable, format: 'number', icon: 'bi-check-circle', variant: 'success' }),
    toStat({ key: 'inUse', label: 'En mission', raw: inUse, previous: prevInUse, format: 'number', icon: 'bi-play-circle', variant: 'info' }),
    toStat({ key: 'availabilityRate', label: 'Taux de disponibilité', raw: availabilityRate, previous: prevAvailabilityRate, format: 'percent', icon: 'bi-graph-up', variant: 'success' }),
  ];
  report.breakdown = toBreakdown(groups, vehicleGroupLabel, vehicleGroupVariant);
  report.top = Object.entries(counts)
    .map(([key, value]) => ({ key, label: vehicleStatusLabel(key), value, sublabel: `${Math.round((value / Math.max(total, 1)) * 100)} %` }))
    .sort((a, b) => b.value - a.value);
  report.rows = vehicles.map((v) => ({
    id: v.id,
    registrationNumber: v.registration_number,
    vehicle: `${v.brand} ${v.model}`,
    group: v.group_code || 'autre',
    groupLabel: vehicleGroupLabel(v.group_code || 'autre'),
    status: v.status,
    statusLabel: vehicleStatusLabel(v.status),
    mileage: v.mileage || 0,
    fuelType: v.fuel_type,
    companyName: '',
  }));
  report.summary = { count: total };

  return report;
}

/* -----------------------------------------------------------------------
   VEHICLE REPORT
   ----------------------------------------------------------------------- */

async function generateVehicleReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const data = await reportRepository.getVehicleReportData(companyId, range);
  const fuelCostMap = new Map(data.fuelCosts.map((f) => [f.vehicle_id, Number(f.fuel_cost) || 0]));
  const maintCostMap = new Map(data.maintenanceCosts.map((m) => [m.vehicle_id, Number(m.maintenance_cost) || 0]));
  const tripCountMap = new Map(data.tripCounts.map((t) => [t.vehicle_id, { count: Number(t.trip_count) || 0, distance: Number(t.trip_distance) || 0 }]));

  const totalMileage = sum(data.vehicles, (v) => v.mileage || 0);
  const fuelCost = sum(data.vehicles, (v) => fuelCostMap.get(v.id) || 0);
  const maintenanceCost = sum(data.vehicles, (v) => maintCostMap.get(v.id) || 0);
  const tripCount = sum([...tripCountMap.values()], (t) => t.count);

  const report = buildReportBase('vehicles', range, previousRange);
  report.statistics = [
    toStat({ key: 'total', label: 'Véhicules', raw: data.vehicles.length, previous: data.vehicles.length, format: 'number', icon: 'bi-truck-front', variant: 'primary' }),
    toStat({ key: 'totalMileage', label: 'Kilométrage total', raw: totalMileage, previous: totalMileage, format: 'distance', icon: 'bi-speedometer2', variant: 'info' }),
    toStat({ key: 'fuelCost', label: 'Coût carburant', raw: fuelCost, previous: fuelCost, format: 'money', icon: 'bi-fuel-pump', variant: 'warning' }),
    toStat({ key: 'maintenanceCost', label: 'Coût entretien', raw: maintenanceCost, previous: maintenanceCost, format: 'money', icon: 'bi-wrench-adjustable', variant: 'danger', invert: true }),
  ];
  report.breakdown = toBreakdown(countBy(data.vehicles, (v) => v.group_code || 'autre'), vehicleGroupLabel, vehicleGroupVariant);
  report.rows = data.vehicles.map((v) => ({
    id: v.id,
    registrationNumber: v.registration_number,
    vehicle: `${v.brand} ${v.model}`,
    group: v.group_code || 'autre',
    groupLabel: vehicleGroupLabel(v.group_code || 'autre'),
    status: v.status,
    statusLabel: vehicleStatusLabel(v.status),
    mileage: v.mileage || 0,
    fuelCost: fuelCostMap.get(v.id) || 0,
    maintenanceCost: maintCostMap.get(v.id) || 0,
    tripCount: tripCountMap.get(v.id)?.count || 0,
    tripDistance: tripCountMap.get(v.id)?.distance || 0,
    companyName: '',
  })).sort((a, b) => b.mileage - a.mileage);
  report.top = report.rows.slice(0, 5).map((r) => ({ key: r.id, label: `${r.vehicle} (${r.registrationNumber})`, value: r.mileage, sublabel: 'km' }));
  report.summary = { count: data.vehicles.length, tripCount };

  return report;
}

/* -----------------------------------------------------------------------
   DRIVER REPORT
   ----------------------------------------------------------------------- */

async function generateDriverReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const data = await reportRepository.getDriverReportData(companyId, range);
  const tripMap = new Map(data.trips.map((t) => [t.driver_id, t]));
  const fuelMap = new Map(data.fuelRecords.map((f) => [f.driver_id, f]));

  const rows = data.drivers.map((d) => {
    const t = tripMap.get(d.id) || {};
    const f = fuelMap.get(d.id) || {};
    return {
      id: d.id,
      name: d.full_name,
      status: d.status,
      licenseCategory: d.license_category || '',
      availability: d.availability || '',
      companyName: '',
      tripCount: Number(t.trip_count) || 0,
      distance: Number(t.distance) || 0,
      duration: Number(t.duration) || 0,
      fuelRecords: Number(f.fuel_count) || 0,
      fuelCost: Number(f.fuel_cost) || 0,
    };
  }).sort((a, b) => b.distance - a.distance);

  const totalDistance = sum(rows, (r) => r.distance);
  const totalDuration = sum(rows, (r) => r.duration);

  const report = buildReportBase('drivers', range, previousRange);
  report.statistics = [
    toStat({ key: 'total', label: 'Chauffeurs', raw: data.drivers.length, previous: data.drivers.length, format: 'number', icon: 'bi-person-badge', variant: 'primary' }),
    toStat({ key: 'tripCount', label: 'Trajets', raw: sum(rows, (r) => r.tripCount), previous: sum(rows, (r) => r.tripCount), format: 'number', icon: 'bi-signpost-split', variant: 'info' }),
    toStat({ key: 'totalDistance', label: 'Distance totale', raw: totalDistance, previous: totalDistance, format: 'distance', icon: 'bi-signpost', variant: 'success' }),
    toStat({ key: 'totalDuration', label: 'Temps de conduite', raw: totalDuration, previous: totalDuration, format: 'duration', icon: 'bi-clock', variant: 'warning' }),
  ];
  report.breakdown = toBreakdown(countBy(data.drivers, (d) => d.availability || 'autre'), capitalize);
  report.top = rows.slice(0, 5).map((r) => ({ key: r.id, label: r.name, value: r.distance, sublabel: `${r.tripCount} trajets` }));
  report.rows = rows;
  report.summary = { count: data.drivers.length, tripCount: sum(rows, (r) => r.tripCount) };

  return report;
}

/* -----------------------------------------------------------------------
   ASSIGNMENT REPORT
   ----------------------------------------------------------------------- */

async function generateAssignmentReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const assignments = await reportRepository.getAssignmentReportData(companyId, range);
  const vehicleMap = await getVehicleMap(companyId);
  const driverMap = await getDriverMap(companyId);

  const counts = countBy(assignments, (a) => a.status);
  const types = countBy(assignments, (a) => a.assignment_type || 'autre');

  const rows = assignments.map((a) => {
    const v = vehicleMap.get(a.vehicle_id);
    const d = driverMap.get(a.driver_id);
    return {
      id: a.id,
      assignmentNumber: a.assignment_number,
      assignmentType: a.assignment_type || '—',
      status: a.status,
      startDate: a.start_date || '',
      expectedEndDate: a.expected_end_date || '',
      endDate: a.end_date || '',
      vehicle: v ? `${v.name} (${v.registration_number})` : '—',
      driver: d?.full_name ?? '—',
      companyName: '',
      startMileage: a.start_mileage || null,
      endMileage: a.end_mileage || null,
    };
  }).sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));

  const report = buildReportBase('assignments', range, previousRange);
  report.statistics = [
    toStat({ key: 'total', label: 'Affectations', raw: assignments.length, previous: assignments.length, format: 'number', icon: 'bi-shuffle', variant: 'primary' }),
    toStat({ key: 'active', label: 'Actives', raw: counts.active ?? 0, previous: counts.active ?? 0, format: 'number', icon: 'bi-toggle-on', variant: 'success' }),
    toStat({ key: 'ended', label: 'Terminées', raw: counts.ended ?? 0, previous: counts.ended ?? 0, format: 'number', icon: 'bi-check2-circle', variant: 'info' }),
    toStat({ key: 'cancelled', label: 'Annulées', raw: counts.cancelled ?? 0, previous: counts.cancelled ?? 0, format: 'number', icon: 'bi-x-circle', variant: 'danger' }),
  ];
  report.breakdown = toBreakdown(types, capitalize);
  report.top = Object.entries(counts).map(([key, value]) => ({ key, label: capitalize(key), value, sublabel: `${Math.round((value / Math.max(assignments.length, 1)) * 100)} %` })).sort((a, b) => b.value - a.value);
  report.rows = rows;
  report.summary = { count: assignments.length };

  return report;
}

/* -----------------------------------------------------------------------
   TRIP REPORT
   ----------------------------------------------------------------------- */

async function generateTripReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const trips = await reportRepository.getTripReportData(companyId, range);
  const vehicleMap = await getVehicleMap(companyId);
  const driverMap = await getDriverMap(companyId);

  const totalDistance = sum(trips, (t) => Number(t.distance) || 0);
  const completed = trips.filter((t) => t.status === 'completed');
  const onTimeRate = completed.length ? (completed.filter((t) => Number(t.distance) > 0).length / completed.length) * 100 : 0;
  const types = countBy(trips, (t) => t.trip_type);

  const rows = trips.map((t) => {
    const v = vehicleMap.get(t.vehicle_id);
    const d = driverMap.get(t.driver_id);
    return {
      id: t.id,
      tripNumber: t.trip_number,
      tripType: t.trip_type,
      purpose: t.purpose || '',
      status: t.status,
      departureDate: t.departure_date || '',
      departure: t.departure_location || '',
      arrival: t.arrival_location || '',
      distance: Number(t.distance) || 0,
      duration: Number(t.duration) || 0,
      vehicle: v?.name ?? '—',
      driver: d?.full_name ?? '—',
      companyName: '',
    };
  }).sort((a, b) => (b.departureDate || '').localeCompare(a.departureDate || ''));

  const series = buildMonthlySeries(trips, range, (t) => t.departure_date || t.created_at, (t) => Number(t.distance) || 0);

  const report = buildReportBase('trips', range, previousRange);
  report.statistics = [
    toStat({ key: 'total', label: 'Trajets', raw: trips.length, previous: trips.length, format: 'number', icon: 'bi-signpost-split', variant: 'primary' }),
    toStat({ key: 'distance', label: 'Distance parcourue', raw: totalDistance, previous: totalDistance, format: 'distance', icon: 'bi-signpost', variant: 'info' }),
    toStat({ key: 'onTimeRate', label: 'Taux de complétion', raw: onTimeRate, previous: null, format: 'percent', icon: 'bi-check-circle', variant: 'success' }),
    toStat({ key: 'avgDistance', label: 'Distance moyenne', raw: trips.length ? totalDistance / trips.length : 0, previous: null, format: 'distance', icon: 'bi-arrow-left-right', variant: 'warning' }),
  ];
  report.series = { labels: series.labels, datasets: [{ key: 'distance', label: 'Distance', values: series.values, variant: 'info' }] };
  report.breakdown = toBreakdown(types, capitalize);
  report.top = rows.slice(0, 5).map((r) => ({ key: r.id, label: `${r.tripNumber} — ${r.purpose || r.departure}`, value: r.distance, sublabel: 'km' }));
  report.rows = rows;
  report.summary = { count: trips.length, distance: totalDistance };

  return report;
}

/* -----------------------------------------------------------------------
   FUEL REPORT
   ----------------------------------------------------------------------- */

async function generateFuelReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const records = await reportRepository.getFuelReportData(companyId, range);
  const vehicleMap = await getVehicleMap(companyId);
  const driverMap = await getDriverMap(companyId);

  const totalCost = sum(records, (r) => Number(r.total_amount) || 0);
  const totalQuantity = sum(records, (r) => Number(r.quantity) || 0);
  const validated = records.filter((r) => r.status === 'validated');
  const avgConsumption = validated.length ? average(validated, (r) => Number(r.quantity) || 0) : 0;
  const anomalies = records.filter((r) => r.status === 'cancelled');
  const fuelTypes = countBy(records, (r) => r.fuel_type);

  const rows = records.map((r) => {
    const v = vehicleMap.get(r.vehicle_id);
    const d = driverMap.get(r.driver_id);
    return {
      id: r.id,
      fuelNumber: r.fuel_number,
      vehicle: v?.name ?? '—',
      driver: d?.full_name ?? '—',
      fuelType: r.fuel_type,
      status: r.status,
      quantity: Number(r.quantity) || 0,
      unitPrice: Number(r.unit_price) || 0,
      totalCost: Number(r.total_amount) || 0,
      consumptionAverage: 0,
      station: r.station_name || '',
      city: r.station_city || '',
      createdAt: r.created_at || r.filled_at,
      companyName: '',
    };
  }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const series = buildMonthlySeries(records, range, (r) => r.created_at || r.filled_at, (r) => Number(r.quantity) || 0);

  const report = buildReportBase('fuel', range, previousRange);
  report.statistics = [
    toStat({ key: 'totalCost', label: 'Dépenses carburant', raw: totalCost, previous: totalCost, format: 'money', icon: 'bi-cash-coin', variant: 'warning', invert: true }),
    toStat({ key: 'totalQuantity', label: 'Volume', raw: totalQuantity, previous: totalQuantity, format: 'number', icon: 'bi-fuel-pump', variant: 'primary' }),
    toStat({ key: 'avgConsumption', label: 'Consommation moyenne', raw: avgConsumption, previous: null, format: 'number', icon: 'bi-speedometer2', variant: 'info', invert: true }),
    toStat({ key: 'anomalies', label: 'Anomalies', raw: anomalies.length, previous: anomalies.length, format: 'number', icon: 'bi-exclamation-triangle', variant: 'danger' }),
  ];
  report.series = { labels: series.labels, datasets: [{ key: 'totalQuantity', label: 'Consommation (L)', values: series.values, variant: 'warning' }] };
  report.breakdown = toBreakdown(fuelTypes, capitalize);
  report.top = rows.slice(0, 5).map((r) => ({ key: r.id, label: `${r.fuelNumber} — ${r.vehicle}`, value: r.totalCost, sublabel: `${r.quantity.toLocaleString('fr-FR')} L` }));
  report.rows = rows;
  report.summary = { count: records.length, totalCost };

  return report;
}

/* -----------------------------------------------------------------------
   MAINTENANCE REPORT
   ----------------------------------------------------------------------- */

async function generateMaintenanceReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const records = await reportRepository.getMaintenanceReportData(companyId, range);
  const vehicleMap = await getVehicleMap(companyId);

  const counts = countBy(records, (r) => r.status);
  const actualCost = sum(records, (r) => Number(r.actual_cost) || 0);
  const estimatedCost = sum(records, (r) => Number(r.estimated_cost) || 0);
  const completed = records.filter((r) => r.status === 'completed');
  const onTimeRate = completed.length
    ? (completed.filter((r) => !r.completed_at || r.completed_at >= r.scheduled_date).length / completed.length) * 100
    : 0;
  const types = countBy(records, (r) => r.maintenance_type);

  const rows = records.map((r) => {
    const v = vehicleMap.get(r.vehicle_id);
    return {
      id: r.id,
      maintenanceNumber: r.maintenance_number,
      maintenanceType: r.maintenance_type,
      priority: r.priority,
      status: r.status,
      scheduledDate: r.scheduled_date || '',
      completedAt: r.completed_at || '',
      estimatedCost: Number(r.estimated_cost) || 0,
      actualCost: Number(r.actual_cost) || 0,
      workshop: r.workshop || '',
      vehicle: v?.name ?? '—',
      companyName: '',
    };
  }).sort((a, b) => (b.scheduledDate || b.completedAt || '').localeCompare(a.scheduledDate || a.completedAt || ''));

  const series = buildMonthlySeries(records, range, (r) => r.completed_at || r.scheduled_date || r.created_at, (r) => Number(r.actual_cost) || Number(r.estimated_cost) || 0);

  const report = buildReportBase('maintenance', range, previousRange);
  report.statistics = [
    toStat({ key: 'total', label: 'Entretiens', raw: records.length, previous: records.length, format: 'number', icon: 'bi-wrench-adjustable', variant: 'primary' }),
    toStat({ key: 'actualCost', label: 'Coût réel', raw: actualCost, previous: actualCost, format: 'money', icon: 'bi-cash-coin', variant: 'danger', invert: true }),
    toStat({ key: 'estimatedCost', label: 'Coût estimé', raw: estimatedCost, previous: estimatedCost, format: 'money', icon: 'bi-receipt', variant: 'warning' }),
    toStat({ key: 'onTimeRate', label: "Taux d'achèvement", raw: onTimeRate, previous: null, format: 'percent', icon: 'bi-check2-circle', variant: 'success' }),
  ];
  report.series = { labels: series.labels, datasets: [{ key: 'actualCost', label: 'Coût réel', values: series.values, variant: 'danger' }] };
  report.breakdown = toBreakdown(types, capitalize);
  report.top = Object.entries(counts).map(([key, value]) => ({ key, label: capitalize(key), value, sublabel: `${Math.round((value / Math.max(records.length, 1)) * 100)} %` })).sort((a, b) => b.value - a.value);
  report.rows = rows;
  report.summary = { count: records.length, actualCost };

  return report;
}

/* -----------------------------------------------------------------------
   DOCUMENT REPORT
   ----------------------------------------------------------------------- */

async function generateDocumentReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const documents = await reportRepository.getDocumentReportData(companyId, range);
  const vehicleMap = await getVehicleMap(companyId);

  const totalSize = sum(documents, (d) => Number(d.size) || 0);
  const categories = countBy(documents, (d) => d.category || 'autre');
  const visibility = countBy(documents, (d) => d.visibility || 'private');

  const rows = documents.map((d) => {
    const v = vehicleMap.get(d.entity_id);
    return {
      id: d.id,
      name: d.name,
      category: d.category || '—',
      extension: d.extension || '',
      size: Number(d.size) || 0,
      visibility: d.visibility || '',
      associationType: d.association_type || '',
      uploadedBy: d.uploaded_by || '',
      createdAt: d.created_at || '',
      vehicle: v?.name ?? '—',
      companyName: '',
    };
  }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const series = buildMonthlySeries(documents, range, (d) => d.created_at, (d) => Number(d.size) || 0);

  const report = buildReportBase('documents', range, previousRange);
  report.statistics = [
    toStat({ key: 'total', label: 'Documents', raw: documents.length, previous: documents.length, format: 'number', icon: 'bi-file-earmark-text', variant: 'primary' }),
    toStat({ key: 'totalSize', label: 'Stockage utilisé', raw: totalSize, previous: totalSize, format: 'number', icon: 'bi-database', variant: 'info' }),
    toStat({ key: 'public', label: 'Publics', raw: visibility.public ?? 0, previous: visibility.public ?? 0, format: 'number', icon: 'bi-eye', variant: 'success' }),
    toStat({ key: 'private', label: 'Privés', raw: visibility.private ?? 0, previous: visibility.private ?? 0, format: 'number', icon: 'bi-lock', variant: 'warning' }),
  ];
  report.series = { labels: series.labels, datasets: [{ key: 'size', label: 'Stockage', values: series.values, variant: 'info' }] };
  report.breakdown = toBreakdown(categories, capitalize);
  report.top = rows.slice(0, 5).map((r) => ({ key: r.id, label: r.name, value: r.size, sublabel: `${r.category} — ${r.extension}` }));
  report.rows = rows;
  report.summary = { count: documents.length };

  return report;
}

/* -----------------------------------------------------------------------
   FINANCIAL REPORT
   ----------------------------------------------------------------------- */

async function generateFinancialReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const data = await reportRepository.getFinancialReportData(companyId, range);

  const totalInvoiced = sum(data.invoices, (i) => Number(i.total) || 0);
  const totalPaid = sum(data.payments.filter((p) => p.status === 'completed'), (p) => Number(p.amount) || 0);
  const outstanding = sum(data.invoices, (i) => Number(i.amount_due) || 0);
  const statuses = countBy(data.invoices, (i) => i.status);

  const rows = data.invoices.map((i) => ({
    id: i.id,
    number: i.number,
    status: i.status,
    currency: i.currency,
    issuedDate: i.issued_date || '',
    dueDate: i.due_date || '',
    paidDate: i.paid_date || '',
    subtotal: Number(i.subtotal) || 0,
    taxAmount: Number(i.tax_amount) || 0,
    total: Number(i.total) || 0,
    amountPaid: Number(i.amount_paid) || 0,
    amountDue: Number(i.amount_due) || 0,
    companyName: '',
  })).sort((a, b) => (b.issuedDate || '').localeCompare(a.issuedDate || ''));

  const invoicedSeries = buildMonthlySeries(data.invoices, range, (i) => i.issued_date || i.created_at, (i) => Number(i.total) || 0);
  const paidSeries = buildMonthlySeries(data.payments.filter((p) => p.status === 'completed'), range, (p) => p.payment_date || p.created_at, (p) => Number(p.amount) || 0);

  const report = buildReportBase('financial', range, previousRange);
  report.statistics = [
    toStat({ key: 'totalInvoiced', label: 'Facturé', raw: totalInvoiced, previous: totalInvoiced, format: 'money', icon: 'bi-receipt', variant: 'primary' }),
    toStat({ key: 'totalPaid', label: 'Encaissé', raw: totalPaid, previous: totalPaid, format: 'money', icon: 'bi-cash-coin', variant: 'success' }),
    toStat({ key: 'outstanding', label: 'En attente', raw: outstanding, previous: outstanding, format: 'money', icon: 'bi-hourglass-split', variant: 'warning' }),
    toStat({ key: 'collectionRate', label: 'Taux de recouvrement', raw: totalInvoiced ? (totalPaid / totalInvoiced) * 100 : 0, previous: null, format: 'percent', icon: 'bi-graph-up-arrow', variant: 'success' }),
  ];
  report.series = {
    labels: invoicedSeries.labels,
    datasets: [
      { key: 'invoiced', label: 'Facturé', values: invoicedSeries.values, variant: 'primary' },
      { key: 'paid', label: 'Encaissé', values: paidSeries.values, variant: 'success' },
    ],
  };
  report.breakdown = toBreakdown(statuses, capitalize);
  report.top = rows.slice(0, 5).map((r) => ({ key: r.id, label: r.number, value: r.total, sublabel: r.companyName }));
  report.rows = rows;
  report.summary = { count: data.invoices.length, totalInvoiced, totalPaid };

  return report;
}

/* -----------------------------------------------------------------------
   SUBSCRIPTION REPORT
   ----------------------------------------------------------------------- */

async function generateSubscriptionReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const subscriptions = await reportRepository.getSubscriptionReportData(companyId);
  const plans = await reportRepository.getPlanNames();
  const planMap = new Map(plans.map((p) => [p.id, p]));

  const statuses = countBy(subscriptions, (s) => s.status);
  const active = subscriptions.filter((s) => s.status === 'active');
  const mrr = sum(active, (s) => Number(s.price) || 0);
  const byPlan = subscriptions.reduce((acc, s) => {
    const plan = planMap.get(s.plan_id);
    const code = plan?.code ?? s.plan_id;
    acc[code] = (acc[code] ?? 0) + 1;
    return acc;
  }, {});

  const rows = subscriptions.map((s) => {
    const plan = planMap.get(s.plan_id);
    return {
      id: s.id,
      companyName: '',
      plan: plan?.name ?? '—',
      planCode: plan?.code ?? '—',
      status: s.status,
      price: Number(s.price) || 0,
      currency: s.currency,
      billingInterval: s.billing_interval,
      currentPeriodEnd: s.current_period_end || '',
      renewalDate: s.renewal_date || '',
      startDate: s.start_date || '',
    };
  }).sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));

  const planLabels = {};
  plans.forEach((p) => { planLabels[p.code] = p.name; });

  const report = buildReportBase('subscriptions', range, previousRange);
  report.statistics = [
    toStat({ key: 'total', label: 'Abonnements', raw: subscriptions.length, previous: subscriptions.length, format: 'number', icon: 'bi-credit-card', variant: 'primary' }),
    toStat({ key: 'active', label: 'Actifs', raw: active.length, previous: active.length, format: 'number', icon: 'bi-toggle-on', variant: 'success' }),
    toStat({ key: 'mrr', label: 'Revenu mensuel (MRR)', raw: mrr, previous: mrr, format: 'money', icon: 'bi-graph-up', variant: 'info' }),
    toStat({ key: 'trialing', label: 'En essai', raw: statuses.trialing ?? 0, previous: statuses.trialing ?? 0, format: 'number', icon: 'bi-hourglass-split', variant: 'warning' }),
  ];
  report.breakdown = toBreakdown(byPlan, (key) => planLabels[key] ?? key);
  report.top = rows.slice(0, 5).map((r) => ({ key: r.id, label: r.companyName || r.plan, value: r.price, sublabel: `${r.plan} — ${r.status}` }));
  report.rows = rows;
  report.summary = { count: subscriptions.length, mrr };

  return report;
}

/* -----------------------------------------------------------------------
   AUDIT REPORT
   ----------------------------------------------------------------------- */

async function generateAuditReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const logs = await reportRepository.getAuditReportData(companyId, range);

  const statuses = countBy(logs, (l) => l.status);
  const severities = countBy(logs, (l) => l.severity);
  const types = countBy(logs, (l) => l.action_type);

  const rows = logs.map((l) => ({
    id: l.id,
    userName: '',
    action: l.action,
    actionType: l.action_type || '',
    resourceType: l.entity_type || '',
    resourceName: l.entity_id || '',
    status: l.status || '',
    severity: l.severity || '',
    description: l.description || '',
    companyName: '',
    createdAt: l.created_at || '',
  })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const series = buildMonthlySeries(logs, range, (l) => l.created_at, () => 1);

  const report = buildReportBase('audit', range, previousRange);
  report.statistics = [
    toStat({ key: 'total', label: 'Événements', raw: logs.length, previous: logs.length, format: 'number', icon: 'bi-journal-text', variant: 'primary' }),
    toStat({ key: 'success', label: 'Réussis', raw: statuses.success ?? 0, previous: statuses.success ?? 0, format: 'number', icon: 'bi-check-circle', variant: 'success' }),
    toStat({ key: 'failed', label: 'Échoués', raw: statuses.failed ?? 0, previous: statuses.failed ?? 0, format: 'number', icon: 'bi-x-octagon', variant: 'danger' }),
    toStat({ key: 'critical', label: 'Critiques', raw: severities.critical ?? 0, previous: severities.critical ?? 0, format: 'number', icon: 'bi-exclamation-octagon', variant: 'danger' }),
  ];
  report.series = { labels: series.labels, datasets: [{ key: 'events', label: 'Événements', values: series.values, variant: 'primary' }] };
  report.breakdown = toBreakdown(types, capitalize);
  report.top = rows.slice(0, 5).map((r) => ({ key: r.id, label: `${r.userName || r.resourceType}`, value: 1, sublabel: r.action }));
  report.rows = rows;
  report.summary = { count: logs.length };

  return report;
}

/* -----------------------------------------------------------------------
   COMPANY REPORT
   ----------------------------------------------------------------------- */

async function generateCompanyReport(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const data = await reportRepository.getCompanyReportData(companyId);
  const vehicleCountMap = new Map(data.vehicleCounts.map((v) => [v.company_id, Number(v.vehicle_count) || 0]));
  const driverCountMap = new Map(data.driverCounts.map((d) => [d.company_id, Number(d.driver_count) || 0]));
  const agencyCountMap = new Map(data.agencyCounts.map((a) => [a.company_id, Number(a.agency_count) || 0]));

  const statuses = countBy(data.companies, (c) => c.status);
  const totalVehicles = sum([...vehicleCountMap.values()], (v) => v);
  const totalDrivers = sum([...driverCountMap.values()], (d) => d);

  const rows = data.companies.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code || '',
    country: c.country || '',
    city: c.city || '',
    status: c.status,
    subscriptionPlan: c.subscription_plan || '',
    subscriptionStatus: c.subscription_status || '',
    vehicleCount: vehicleCountMap.get(c.id) || 0,
    driverCount: driverCountMap.get(c.id) || 0,
    agencyCount: agencyCountMap.get(c.id) || 0,
    ownerName: '',
    planLabel: c.subscription_plan || '',
    createdAt: c.created_at || '',
  })).sort((a, b) => b.vehicleCount - a.vehicleCount);

  const report = buildReportBase('companies', range, previousRange);
  report.statistics = [
    toStat({ key: 'total', label: 'Entreprises', raw: data.companies.length, previous: data.companies.length, format: 'number', icon: 'bi-buildings', variant: 'primary' }),
    toStat({ key: 'active', label: 'Actives', raw: statuses.active ?? 0, previous: statuses.active ?? 0, format: 'number', icon: 'bi-toggle-on', variant: 'success' }),
    toStat({ key: 'vehicles', label: 'Véhicules', raw: totalVehicles, previous: totalVehicles, format: 'number', icon: 'bi-truck', variant: 'info' }),
    toStat({ key: 'drivers', label: 'Chauffeurs', raw: totalDrivers, previous: totalDrivers, format: 'number', icon: 'bi-person-badge', variant: 'warning' }),
  ];
  report.breakdown = toBreakdown(statuses, capitalize);
  report.top = rows.slice(0, 5).map((r) => ({ key: r.id, label: r.name, value: r.vehicleCount, sublabel: `${r.driverCount} chauffeurs` }));
  report.rows = rows;
  report.summary = { count: data.companies.length, totalVehicles };

  return report;
}

/* -----------------------------------------------------------------------
   DASHBOARD / OVERVIEW
   ----------------------------------------------------------------------- */

async function generateDashboardMetrics(companyId, filters) {
  const range = resolvePeriod(filters.period, filters.dateFrom, filters.dateTo);
  const previousRange = buildPreviousRange(range);

  const data = await reportRepository.getDashboardData(companyId, range);
  const prevData = previousRange.from ? await reportRepository.getDashboardData(companyId, previousRange) : null;

  const vehicles = data.vehicles;
  const prevVehicles = prevData?.vehicles || [];
  const total = vehicles.length;
  const prevTotal = prevVehicles.length;
  const counts = countBy(vehicles, (v) => v.status);
  const prevCounts = countBy(prevVehicles, (v) => v.status);
  const available = counts.available ?? 0;
  const prevAvailable = prevCounts.available ?? 0;
  const inUse = counts.in_use ?? 0;
  const prevInUse = prevCounts.in_use ?? 0;
  const availabilityRate = total ? ((available + inUse) / total) * 100 : 0;
  const prevAvailabilityRate = prevTotal ? ((prevAvailable + prevInUse) / prevTotal) * 100 : null;

  const trips = data.trips;
  const totalDistance = sum(trips, (t) => Number(t.distance) || 0);
  const maintenanceVehicles = counts.maintenance ?? 0;
  const prevMaintenanceVehicles = prevCounts.maintenance ?? 0;

  const fuelRecords = data.fuel;
  const fuelCost = sum(fuelRecords, (r) => Number(r.total_amount) || 0);
  const fuelQuantity = sum(fuelRecords, (r) => Number(r.quantity) || 0);

  const maintenanceRecords = data.maintenance;
  const actualCost = sum(maintenanceRecords, (r) => Number(r.actual_cost) || 0);
  const estimatedCost = sum(maintenanceRecords, (r) => Number(r.estimated_cost) || 0);

  const financialData = data.financial;
  const totalInvoiced = sum(financialData.invoices, (i) => Number(i.total) || 0);
  const totalPaid = sum(financialData.payments.filter((p) => p.status === 'completed'), (p) => Number(p.amount) || 0);
  const collectionRate = totalInvoiced ? (totalPaid / totalInvoiced) * 100 : 0;

  const currentCosts = fuelCost + actualCost;
  const costPerKm = totalDistance > 0 ? currentCosts / totalDistance : 0;
  const utilization = percentage(inUse, total);
  const drivers = data.drivers;

  const fuelSeries = buildMonthlySeries(fuelRecords, range, (r) => r.created_at || r.filled_at, (r) => Number(r.total_amount) || 0);
  const maintenanceSeries = buildMonthlySeries(maintenanceRecords, range, (r) => r.completed_at || r.scheduled_date || r.created_at, (r) => Number(r.actual_cost) || Number(r.estimated_cost) || 0);

  const statusBreakdown = toBreakdown(counts, vehicleStatusLabel, vehicleStatusVariant);

  const report = buildReportBase('overview', range, previousRange);
  report.statistics = [
    toStat({ key: 'total', label: 'Véhicules', raw: total, previous: prevTotal, format: 'number', icon: 'bi-truck', variant: 'primary' }),
    toStat({ key: 'available', label: 'Disponibles', raw: available, previous: prevAvailable, format: 'number', icon: 'bi-check-circle', variant: 'success' }),
    toStat({ key: 'inUse', label: 'En mission', raw: inUse, previous: prevInUse, format: 'number', icon: 'bi-play-circle', variant: 'info' }),
    toStat({ key: 'availabilityRate', label: 'Taux de disponibilité', raw: availabilityRate, previous: prevAvailabilityRate, format: 'percent', icon: 'bi-graph-up', variant: 'success' }),
    toStat({ key: 'tripCount', label: 'Trajets', raw: trips.length, previous: prevData?.trips?.length || 0, format: 'number', icon: 'bi-signpost-split', variant: 'info' }),
    toStat({ key: 'distance', label: 'Distance parcourue', raw: totalDistance, previous: sum(prevData?.trips || [], (t) => Number(t.distance) || 0), format: 'distance', icon: 'bi-signpost', variant: 'info' }),
    toStat({ key: 'maintenanceVehicles', label: 'Véhicules en maintenance', raw: maintenanceVehicles, previous: prevMaintenanceVehicles, format: 'number', icon: 'bi-wrench-adjustable', variant: 'warning' }),
    toStat({ key: 'drivers', label: 'Chauffeurs', raw: drivers.length, previous: prevData?.drivers?.length || 0, format: 'number', icon: 'bi-person-badge', variant: 'info' }),
    toStat({ key: 'totalCost', label: 'Dépenses carburant', raw: fuelCost, previous: fuelCost, format: 'money', icon: 'bi-fuel-pump', variant: 'warning', invert: true }),
    toStat({ key: 'totalQuantity', label: 'Volume carburant', raw: fuelQuantity, previous: fuelQuantity, format: 'number', icon: 'bi-fuel-pump', variant: 'primary' }),
    toStat({ key: 'actualCost', label: 'Coût entretien', raw: actualCost, previous: actualCost, format: 'money', icon: 'bi-wrench-adjustable', variant: 'danger', invert: true }),
    toStat({ key: 'estimatedCost', label: 'Coût estimé', raw: estimatedCost, previous: estimatedCost, format: 'money', icon: 'bi-receipt', variant: 'warning' }),
    toStat({ key: 'costPerKm', label: "Coût d'exploitation / km", raw: costPerKm, previous: null, format: 'money', icon: 'bi-cash-stack', variant: 'warning', invert: true }),
    toStat({ key: 'utilization', label: "Taux d'utilisation", raw: utilization ?? 0, previous: null, format: 'percent', icon: 'bi-graph-up-arrow', variant: 'info' }),
    toStat({ key: 'totalInvoiced', label: 'Facturé', raw: totalInvoiced, previous: totalInvoiced, format: 'money', icon: 'bi-receipt', variant: 'primary' }),
    toStat({ key: 'totalPaid', label: 'Encaissé', raw: totalPaid, previous: totalPaid, format: 'money', icon: 'bi-cash-coin', variant: 'success' }),
    toStat({ key: 'collectionRate', label: 'Taux de recouvrement', raw: collectionRate, previous: null, format: 'percent', icon: 'bi-graph-up-arrow', variant: 'success' }),
  ];

  report.series = {
    labels: fuelSeries.labels,
    datasets: [
      { key: 'fuel', label: 'Carburant', values: fuelSeries.values, variant: 'warning' },
      { key: 'maintenance', label: 'Entretien', values: maintenanceSeries.values, variant: 'danger' },
    ],
  };
  report.breakdown = statusBreakdown;
  report.statusBreakdown = statusBreakdown;
  report.rows = [];
  report.summary = { count: total, distance: totalDistance, costs: currentCosts };

  return report;
}

/* -----------------------------------------------------------------------
   CUSTOM REPORT
   ----------------------------------------------------------------------- */

const REPORT_GENERATORS = {
  fleet: generateFleetReport,
  vehicles: generateVehicleReport,
  drivers: generateDriverReport,
  assignments: generateAssignmentReport,
  trips: generateTripReport,
  fuel: generateFuelReport,
  maintenance: generateMaintenanceReport,
  documents: generateDocumentReport,
  financial: generateFinancialReport,
  subscriptions: generateSubscriptionReport,
  audit: generateAuditReport,
  companies: generateCompanyReport,
  invoices: generateFinancialReport,
};

async function generateCustomReport(config, companyId) {
  const source = config.source || 'fleet';
  const generator = REPORT_GENERATORS[source] || generateFleetReport;
  const base = await generator(companyId, {
    period: config.period || 'thisMonth',
    dateFrom: config.dateFrom,
    dateTo: config.dateTo,
  });

  const candidates = CUSTOM_INDICATORS_BY_SOURCE[source] || [];
  const selected = config.indicators && config.indicators.length
    ? candidates.filter((c) => config.indicators.includes(c.key))
    : candidates.slice(0, 3);

  return {
    ...base,
    reportType: 'custom',
    source,
    statistics: selected.map((c) => {
      const stat = base.statistics.find((s) => s.key === c.key);
      if (stat) return stat;
      return toStat({ key: c.key, label: c.label, raw: 0, previous: 0, format: c.format });
    }),
    rows: base.rows,
    summary: { ...base.summary, source },
  };
}

/* -----------------------------------------------------------------------
   MAIN GENERATOR
   ----------------------------------------------------------------------- */

const GENERATORS = {
  fleet: generateFleetReport,
  vehicles: generateVehicleReport,
  drivers: generateDriverReport,
  assignments: generateAssignmentReport,
  trips: generateTripReport,
  fuel: generateFuelReport,
  maintenance: generateMaintenanceReport,
  documents: generateDocumentReport,
  financial: generateFinancialReport,
  subscriptions: generateSubscriptionReport,
  audit: generateAuditReport,
  companies: generateCompanyReport,
};

export async function generateReport(reportType, companyId, filters = {}) {
  const generator = GENERATORS[reportType];
  if (!generator) throw new Error(`Type de rapport inconnu: ${reportType}`);
  const report = await generator(companyId, filters);
  const meta = REPORT_TYPE_META[reportType];
  return {
    ...report,
    meta: meta || { id: reportType, label: reportType, description: '', icon: 'bi-file-earmark-bar-graph', variant: 'secondary' },
    periodLabel: filters.period ? REPORT_TYPE_META[reportType]?.label || 'Rapport' : 'Personnalisée',
    comparison: {
      current: report.period,
      previous: buildPreviousRange(report.period),
    },
  };
}

export async function generateReportByType(reportType, companyId, filters = {}) {
  return generateReport(reportType, companyId, filters);
}

export { generateDashboardMetrics, generateCustomReport, GENERATORS };
