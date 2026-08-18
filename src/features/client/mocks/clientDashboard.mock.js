/**
 * Navix Client — Mock données Dashboard Premium
 * --------------------------------------------------------------------------
 * Données de démonstration pour le Dashboard Client Entreprise / Particulier.
 * Localisation 100% Cameroun 🇨🇲 — Monnaie FCFA (XAF).
 *
 * Cohérence métier (PROMPT 055) :
 *   - Flotte : 14 véhicules = 9 en circulation + 3 disponibles + 1 maintenance
 *     + 1 hors service.
 *   - Répartition : Motos (2) + V. légers (3) + Utilitaires (4) + Camions (2)
 *     + Engins (1) + Bus (1) + V. spéciaux (1) = 14.
 *   - Trajets : 7 jours (20) ~ 87/mois ; kilométrage mensuel 40 250 km.
 *   - Maintenance : OK 9 + À surveiller 3 + Urgent 2 = 14 véhicules.
 *   - Finance : solde 42 850 000 FCFA (wallet), entrées 14 500 000 FCFA
 *     (facture FAC-2026-0814), sorties 25 830 000 FCFA (dépenses juillet).
 */
import { ROUTES } from '@/routes/route.constants';
import { PERMISSIONS } from '@/features/rbac/constants';

/* ==============================
   KPI RANGÉE 1 — FLOTTE & ÉQUIPE
   ============================== */
export const MOCK_CLIENT_DASHBOARD_METRICS_ENTERPRISE = [
  {
    key: 'total_vehicles',
    label: 'Total véhicules',
    value: 14,
    trend: +8.5,
    trendLabel: '↑ 8.5% vs mois dernier',
    icon: 'bi-truck',
    variant: 'primary',
  },
  {
    key: 'vehicles_in_use',
    label: 'En circulation',
    value: 9,
    trend: +3,
    trendLabel: '↑ 3 vs mois dernier',
    icon: 'bi-play-circle',
    variant: 'info',
  },
  {
    key: 'vehicles_available',
    label: 'Disponibles',
    value: 3,
    trend: -2,
    trendLabel: '↓ 2 vs mois dernier',
    icon: 'bi-check-circle',
    variant: 'success',
  },
  {
    key: 'active_drivers',
    label: 'Chauffeurs actifs',
    value: 11,
    trend: +1,
    trendLabel: '↑ 1 ce mois-ci',
    icon: 'bi-person-badge',
    variant: 'warning',
  },
];

/* ==============================
   KPI RANGÉE 2 — EXPLOITATION DU MOIS
   ============================== */
export const MOCK_CLIENT_DASHBOARD_METRICS_ENTERPRISE_SECONDARY = [
  {
    key: 'trips_month',
    label: 'Trajets du mois',
    value: 87,
    trend: +12.7,
    trendLabel: '↑ 12.7%',
    icon: 'bi-signpost-split',
    variant: 'info',
  },
  {
    key: 'mileage_month',
    label: 'Kilométrage du mois',
    value: '40 250 km',
    trend: +5.2,
    trendLabel: '↑ 5.2%',
    icon: 'bi-speedometer2',
    variant: 'primary',
  },
  {
    key: 'fuel_consumption',
    label: 'Consommation',
    value: '18 450 L',
    trend: -6.2,
    trendLabel: '↓ 6.2%',
    icon: 'bi-fuel-pump',
    variant: 'success',
  },
  {
    key: 'maintenance_cost',
    label: 'Coûts de maintenance',
    value: '6 600 000 FCFA',
    trend: -7.1,
    trendLabel: '↓ 7.1%',
    icon: 'bi-wrench-adjustable',
    variant: 'warning',
    isMonetary: true,
    rawAmount: 6600000,
  },
];

export const MOCK_CLIENT_DASHBOARD_METRICS_INDIVIDUAL = [
  {
    key: 'services',
    label: 'Services actifs',
    value: 1,
    trend: 0,
    trendLabel: 'Stable',
    icon: 'bi-grid-fill',
    variant: 'primary',
  },
  {
    key: 'trips',
    label: 'Trajets ce mois',
    value: 4,
    trend: +33,
    trendLabel: '↑ 33%',
    icon: 'bi-signpost-split',
    variant: 'info',
  },
  {
    key: 'spend',
    label: 'Dépenses du mois',
    value: '285 000 FCFA',
    trend: +12,
    trendLabel: '↑ 12%',
    icon: 'bi-cash-stack',
    variant: 'warning',
    isMonetary: true,
    rawAmount: 285000,
  },
  {
    key: 'requests',
    label: 'Demandes en cours',
    value: 1,
    trend: 0,
    trendLabel: 'En attente',
    icon: 'bi-clipboard-plus',
    variant: 'warning',
  },
];

/* ==============================
   FLOTTE CLIENT — 14 VÉHICULES
   ==============================
   Format métier complet (modèle Vehicle) pour la gestion de flotte client.
   `companyId` = Transports Express Cameroun (isolation multi-tenant).
   Distribution cohérente : 9 en circulation · 3 disponibles · 1 en
   maintenance · 1 hors service (avail. 86 % / util. 64 %). */
const TEC_COMPANY_ID = '01J8A2B3C4D5E6F7G8H9J0K1L2';

export const MOCK_CLIENT_FLEET = [
  { id: 'V-CLT-101', companyId: TEC_COMPANY_ID, registrationNumber: 'LT 1234 AB', vin: 'JTMHV05J2N4012345', engineNumber: '2GD1112345', brand: 'Toyota', model: 'Hilux', version: 'Double Cabine', year: 2023, color: 'Blanc', fuelType: 'diesel', transmission: 'manuelle', mileage: 68500, capacity: 5, group: 'C', category: 'Pick-up', status: 'in_use', purchaseDate: '2023-04-10', insuranceExpiry: '2027-04-09', inspectionExpiry: '2026-12-18', registrationExpiry: '2028-04-10', currentDriver: 'Jean Mbarga', driver: 'Jean Mbarga', agency: 'Agence Douala', location: 'Douala', kmMonth: 4850, photo: '', qrCode: 'QRV-LT1234AB', nextServiceKm: 850, fuelAvg: 12.5, notes: 'Véhicule de liaison inter-agences.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-10T10:00:00.000Z' },
  { id: 'V-CLT-102', companyId: TEC_COMPANY_ID, registrationNumber: 'CE 4587 AA', vin: 'JTEBU5JR0N5123457', engineNumber: '1GD 334456', brand: 'Toyota', model: 'Land Cruiser', version: 'V6', year: 2022, color: 'Sable', fuelType: 'diesel', transmission: 'manuelle', mileage: 71250, capacity: 5, group: 'B', category: 'SUV', status: 'in_use', purchaseDate: '2022-06-15', insuranceExpiry: '2026-11-30', inspectionExpiry: '2026-12-20', registrationExpiry: '2027-06-15', currentDriver: 'Paul Atangana', driver: 'Paul Atangana', agency: 'Agence Yaoundé', location: 'Yaoundé', kmMonth: 3980, photo: '', qrCode: 'QRV-CE4587AA', nextServiceKm: 6200, fuelAvg: 14.2, notes: 'Liaison VIP — Bastos.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-11T09:15:00.000Z' },
  { id: 'V-CLT-103', companyId: TEC_COMPANY_ID, registrationNumber: 'EN 2345 B', vin: 'KMAZC21A2LZ012346', engineNumber: 'S6D114 332201', brand: 'Mitsubishi', model: 'L200', version: 'Double Cabine 4WD', year: 2022, color: 'Gris', fuelType: 'diesel', transmission: 'manuelle', mileage: 68740, capacity: 5, group: 'C', category: 'Pick-up', status: 'in_use', purchaseDate: '2022-09-01', insuranceExpiry: '2027-08-31', inspectionExpiry: '2027-03-05', registrationExpiry: '2027-09-01', currentDriver: 'Mathieu Kamga', driver: 'Mathieu Kamga', agency: 'Agence Bafoussam', location: 'Bafoussam', kmMonth: 4120, photo: '', qrCode: 'QRV-EN2345B', nextServiceKm: 3200, fuelAvg: 11.8, notes: '', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-07-29T15:40:00.000Z' },
  { id: 'V-CLT-104', companyId: TEC_COMPANY_ID, registrationNumber: 'LT 9876 CD', vin: 'JN8AS5MV7BW123456', engineNumber: 'YD25 998877', brand: 'Nissan', model: 'Patrol', version: 'SE 4x4', year: 2021, color: 'Noir', fuelType: 'diesel', transmission: 'automatique', mileage: 62100, capacity: 7, group: 'B', category: 'SUV', status: 'available', purchaseDate: '2021-05-20', insuranceExpiry: '2026-09-30', inspectionExpiry: '2026-10-12', registrationExpiry: '2027-05-20', currentDriver: '', driver: '', agency: 'Agence Kribi', location: 'Kribi', kmMonth: 2140, photo: '', qrCode: 'QRV-LT9876CD', nextServiceKm: 1500, fuelAvg: 13.6, notes: 'Réserve — chantier portuaire.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-12T07:20:00.000Z' },
  { id: 'V-CLT-105', companyId: TEC_COMPANY_ID, registrationNumber: 'CE 3698 EF', vin: 'JACJZ55G3L7123456', engineNumber: '4JJ1 112233', brand: 'Isuzu', model: 'D-Max', version: '3.0 Turbo', year: 2023, color: 'Blanc', fuelType: 'diesel', transmission: 'manuelle', mileage: 59800, capacity: 5, group: 'C', category: 'Pick-up', status: 'maintenance', purchaseDate: '2023-02-08', insuranceExpiry: '2027-02-07', inspectionExpiry: '2026-11-25', registrationExpiry: '2028-02-08', currentDriver: '', driver: '', agency: 'Agence Garoua', location: 'Garoua', kmMonth: 1250, photo: '', qrCode: 'QRV-CE3698EF', nextServiceKm: 0, fuelAvg: 12.1, notes: 'Remplacement embrayage en atelier — garage agréé Garoua.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-13T11:05:00.000Z' },
  { id: 'V-CLT-106', companyId: TEC_COMPANY_ID, registrationNumber: 'NW 7712 GH', vin: 'JTFST22P500123457', engineNumber: '2TR 778900', brand: 'Toyota', model: 'Hiace', version: 'Minibus', year: 2021, color: 'Blanc', fuelType: 'diesel', transmission: 'manuelle', mileage: 88100, capacity: 12, group: 'C', category: 'Fourgon', status: 'in_use', purchaseDate: '2021-11-02', insuranceExpiry: '2026-10-31', inspectionExpiry: '2027-02-15', registrationExpiry: '2027-11-02', currentDriver: 'Serge Talla', driver: 'Serge Talla', agency: 'Agence Yaoundé', location: 'Yaoundé', kmMonth: 3350, photo: '', qrCode: 'QRV-NW7712GH', nextServiceKm: 4200, fuelAvg: 12.9, notes: 'Navette urbaine — ligne Yaoundé centre.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-05T16:50:00.000Z' },
  { id: 'V-CLT-107', companyId: TEC_COMPANY_ID, registrationNumber: 'LT 2210 JK', vin: '4T1B11HK0LU123456', engineNumber: '2.5 889900', brand: 'Toyota', model: 'Camry', version: 'XSE', year: 2020, color: 'Argent', fuelType: 'essence', transmission: 'automatique', mileage: 78300, capacity: 5, group: 'B', category: 'Berline', status: 'in_use', purchaseDate: '2020-07-30', insuranceExpiry: '2027-07-29', inspectionExpiry: '2027-01-20', registrationExpiry: '2027-07-30', currentDriver: 'Moussa Kone', driver: 'Moussa Kone', agency: 'Agence Douala', location: 'Douala', kmMonth: 2980, photo: '', qrCode: 'QRV-LT2210JK', nextServiceKm: 7800, fuelAvg: 9.4, notes: 'Véhicule de direction.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-02T09:30:00.000Z' },
  { id: 'V-CLT-108', companyId: TEC_COMPANY_ID, registrationNumber: 'CE 9034 LM', vin: 'JHDFC4J27XL123457', engineNumber: 'J08E 111235', brand: 'Hino', model: '500', version: 'FT 6x4', year: 2019, color: 'Rouge', fuelType: 'diesel', transmission: 'manuelle', mileage: 154600, capacity: 12, group: 'D', category: 'Camion', status: 'in_use', purchaseDate: '2019-12-05', insuranceExpiry: '2026-10-31', inspectionExpiry: '2026-10-12', registrationExpiry: '2026-12-05', currentDriver: 'Seydou Traoré', driver: 'Seydou Traoré', agency: 'Agence Garoua', location: 'Garoua', kmMonth: 5240, photo: '', qrCode: 'QRV-CE9034LM', nextServiceKm: 950, fuelAvg: 28.5, notes: 'Transport longue distance Garoua–Kribi.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-10T08:00:00.000Z' },
  { id: 'V-CLT-109', companyId: TEC_COMPANY_ID, registrationNumber: 'LT 4467 EF', vin: 'YV2JZ6CC5LA123457', engineNumber: 'D13K 556678', brand: 'Volvo', model: 'FH', version: 'Globetrotter', year: 2020, color: 'Bleu', fuelType: 'diesel', transmission: 'automatique', mileage: 210300, capacity: 40, group: 'D', category: 'Semi-remorque', status: 'in_use', purchaseDate: '2020-08-08', insuranceExpiry: '2026-08-31', inspectionExpiry: '2026-08-25', registrationExpiry: '2026-08-08', currentDriver: 'Adama Bamba', driver: 'Adama Bamba', agency: 'Agence Douala', location: 'Douala', kmMonth: 6100, photo: '', qrCode: 'QRV-LT4467EF', nextServiceKm: 1800, fuelAvg: 30.2, notes: 'Tracteur routier long parcours — corridor Douala–Ngaoundéré.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-14T06:40:00.000Z' },
  { id: 'V-CLT-110', companyId: TEC_COMPANY_ID, registrationNumber: 'EN 8120 OP', vin: 'JTFHS004511234568', engineNumber: 'N04C 123457', brand: 'Toyota', model: 'Coaster', version: 'BB50', year: 2021, color: 'Blanc', fuelType: 'diesel', transmission: 'manuelle', mileage: 88100, capacity: 30, group: 'F', category: 'Bus', status: 'available', purchaseDate: '2021-04-18', insuranceExpiry: '2027-03-20', inspectionExpiry: '2027-02-01', registrationExpiry: '2027-04-18', currentDriver: 'Rasmata Ouédraogo', driver: 'Rasmata Ouédraogo', agency: 'Agence Bafoussam', location: 'Bafoussam', kmMonth: 2750, photo: '', qrCode: 'QRV-EN8120OP', nextServiceKm: 2600, fuelAvg: 15.3, notes: 'Navette inter-ville.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-07-30T14:10:00.000Z' },
  { id: 'V-CLT-111', companyId: TEC_COMPANY_ID, registrationNumber: 'OP 8120 YZ', vin: 'JYARM31E9PA123457', engineNumber: 'CP2 789013', brand: 'Yamaha', model: 'MT-07', version: 'ABS', year: 2023, color: 'Noir', fuelType: 'essence', transmission: 'manuelle', mileage: 9200, capacity: 2, group: 'A', category: 'Moto Sport', status: 'in_use', purchaseDate: '2023-01-30', insuranceExpiry: '2026-12-20', inspectionExpiry: '', registrationExpiry: '2027-01-30', currentDriver: 'Komi Agbeko', driver: 'Komi Agbeko', agency: 'Agence Douala', location: 'Douala', kmMonth: 980, photo: '', qrCode: 'QRV-OP8120YZ', nextServiceKm: 1400, fuelAvg: 4.6, notes: 'Messagerie rapide intra-ville.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-09T12:30:00.000Z' },
  { id: 'V-CLT-112', companyId: TEC_COMPANY_ID, registrationNumber: 'LT 9901 ST', vin: 'MD2A38FV1HWC12345', engineNumber: 'DH100 445566', brand: 'Bajaj', model: 'Boxer', version: 'MotoTaxi', year: 2022, color: 'Jaune', fuelType: 'essence', transmission: 'manuelle', mileage: 18400, capacity: 2, group: 'A', category: 'Mototaxi', status: 'available', purchaseDate: '2022-02-14', insuranceExpiry: '2026-11-30', inspectionExpiry: '', registrationExpiry: '2027-02-14', currentDriver: 'Jean Effa', driver: 'Jean Effa', agency: 'Agence Douala', location: 'Douala', kmMonth: 640, photo: '', qrCode: 'QRV-LT9901ST', nextServiceKm: 600, fuelAvg: 2.8, notes: 'Mototaxi — Akwa/Bonanjo.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-06T17:25:00.000Z' },
  { id: 'V-CLT-113', companyId: TEC_COMPANY_ID, registrationNumber: 'CE 8821 UV', vin: 'KMATZC21A2LZ012347', engineNumber: 'SAA6D114E 332202', brand: 'Komatsu', model: 'PC210', version: 'LC-8', year: 2019, color: 'Jaune', fuelType: 'diesel', transmission: 'manuelle', mileage: 6200, capacity: 1, group: 'E', category: 'Pelle mécanique', status: 'out_of_service', purchaseDate: '2019-05-20', insuranceExpiry: '2026-09-15', inspectionExpiry: '2026-09-15', registrationExpiry: '2027-05-20', currentDriver: '', driver: '', agency: 'Agence Ebolowa', location: 'Ebolowa', kmMonth: 0, photo: '', qrCode: 'QRV-CE8821UV', nextServiceKm: 0, fuelAvg: 18.0, notes: 'Engin de chantier — panne hydraulique, en attente de pièces.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-03T09:00:00.000Z' },
  { id: 'V-CLT-114', companyId: TEC_COMPANY_ID, registrationNumber: 'NW 5590 WX', vin: 'JTFST22P500123458', engineNumber: '2TR 779901', brand: 'Toyota', model: 'Hiace', version: 'Ambulance', year: 2022, color: 'Blanc', fuelType: 'diesel', transmission: 'manuelle', mileage: 41500, capacity: 6, group: 'G', category: 'Ambulance', status: 'in_use', purchaseDate: '2022-10-01', insuranceExpiry: '2027-09-30', inspectionExpiry: '2027-04-18', registrationExpiry: '2027-10-01', currentDriver: 'Serge Kouassi', driver: 'Serge Kouassi', agency: 'Agence Yaoundé', location: 'Yaoundé', kmMonth: 1870, photo: '', qrCode: 'QRV-NW5590WX', nextServiceKm: 3100, fuelAvg: 11.4, notes: 'Ambulance médicalisée — CHU de rattachement.', createdAt: '2025-06-20T08:30:00.000Z', updatedAt: '2026-08-11T18:20:00.000Z' },
];

/* État de la flotte (synthèse cohérente). */
export const MOCK_CLIENT_FLEET_STATUS = {
  total: 14,
  in_use: 9,
  available: 3,
  maintenance: 1,
  out_of_service: 1,
  availabilityRate: 86,
  utilizationRate: 64,
};

/* Répartition de la flotte par groupe (catégories du module Véhicules). */
export const MOCK_CLIENT_FLEET_CATEGORIES = [
  { group: 'A', label: 'Motos', count: 2 },
  { group: 'B', label: 'Véhicules légers', count: 3 },
  { group: 'C', label: 'Utilitaires', count: 4 },
  { group: 'D', label: 'Camions', count: 2 },
  { group: 'E', label: 'Engins', count: 1 },
  { group: 'F', label: 'Bus', count: 1 },
  { group: 'G', label: 'Véhicules spéciaux', count: 1 },
];

/* ==============================
   ACTIVITÉ DES TRAJETS — 7 JOURS
   ============================== */
export const MOCK_CLIENT_TRIPS_WEEKLY = [
  { label: 'Lun', total: 3 },
  { label: 'Mar', total: 4 },
  { label: 'Mer', total: 3 },
  { label: 'Jeu', total: 4 },
  { label: 'Ven', total: 3 },
  { label: 'Sam', total: 2 },
  { label: 'Dim', total: 1 },
];

/* ==============================
   TRAJETS EN COURS
   ============================== */
export const MOCK_CLIENT_TRIPS_ONGOING = [
  {
    id: 'TRP-CLT-001',
    driver: 'Jean Mbarga',
    vehicle: 'Toyota Hilux',
    registrationNumber: 'LT 1234 AB',
    departure: 'Douala',
    destination: 'Yaoundé',
    departureTime: '06:00',
    status: 'in_progress',
  },
  {
    id: 'TRP-CLT-002',
    driver: 'Adama Bamba',
    vehicle: 'Volvo FH',
    registrationNumber: 'LT 4467 EF',
    departure: 'Douala',
    destination: 'Garoua',
    departureTime: '05:30',
    status: 'in_progress',
  },
  {
    id: 'TRP-CLT-003',
    driver: 'Paul Atangana',
    vehicle: 'Toyota Land Cruiser',
    registrationNumber: 'CE 4587 AA',
    departure: 'Yaoundé',
    destination: 'Bertoua',
    departureTime: '08:15',
    status: 'in_progress',
  },
];

/* ==============================
   PROCHAINS TRAJETS
   ============================== */
export const MOCK_CLIENT_UPCOMING_TRIPS = [
  {
    id: 'TRP-CLT-101',
    driver: 'Moussa Kone',
    vehicle: 'Toyota Camry',
    registrationNumber: 'LT 2210 JK',
    departure: 'Douala',
    destination: 'Kribi',
    departureTime: '14:30',
    status: 'scheduled',
  },
  {
    id: 'TRP-CLT-102',
    driver: 'Seydou Traoré',
    vehicle: 'Hino 500',
    registrationNumber: 'CE 9034 LM',
    departure: 'Garoua',
    destination: 'Ngaoundéré',
    departureTime: '16:00',
    status: 'scheduled',
  },
  {
    id: 'TRP-CLT-103',
    driver: 'Serge Kouassi',
    vehicle: 'Hiace Ambulance',
    registrationNumber: 'NW 5590 WX',
    departure: 'Yaoundé',
    destination: 'Bafoussam',
    departureTime: '18:45',
    status: 'scheduled',
  },
];

/* ==============================
   MAINTENANCE CLIENT
   ============================== */
export const MOCK_CLIENT_MAINTENANCE = {
  nextService: {
    vehicle: 'Toyota Hilux',
    registrationNumber: 'LT 1234 AB',
    type: 'Vidange + filtre à huile',
    remainingKm: 850,
    intervalKm: 10000,
  },
  statusCounts: { ok: 9, watch: 3, urgent: 2 },
  upcoming: 3,
  overdue: 1,
};

/* ==============================
   ÉVOLUTION MENSUELLE DES DÉPENSES (6 mois)
   ============================== */
export const MOCK_CLIENT_MONTHLY_EVOLUTION = [
  { label: 'Fév', month: 'Fév', total: 19800000, fuel: 9100000, maintenance: 4500000 },
  { label: 'Mars', month: 'Mars', total: 22400000, fuel: 10200000, maintenance: 5600000 },
  { label: 'Avr', month: 'Avr', total: 20900000, fuel: 9800000, maintenance: 4800000 },
  { label: 'Mai', month: 'Mai', total: 24100000, fuel: 11300000, maintenance: 6200000 },
  { label: 'Juin', month: 'Juin', total: 27300000, fuel: 12400000, maintenance: 7100000 },
  { label: 'Juil', month: 'Juil', total: 25830000, fuel: 11500000, maintenance: 6600000 },
];

/* ==============================
   DÉPENSES PAR CATÉGORIE (pour Donut)
   ============================== */
export const MOCK_CLIENT_FINANCIAL_DATA = {
  monthFuel: 11500000,
  monthMaintenance: 6600000,
  monthOther: 7730000,
  monthTotal: 25830000,
};

/* ==============================
   RÉSUMÉ FINANCIER (fondation — PROMPT 059)
   ============================== */
export const MOCK_CLIENT_FINANCE_SUMMARY = {
  balance: 42850000, // 42 850 000 FCFA — solde wallet
  incomeMonth: 14500000, // 14 500 000 FCFA — facture FAC-2026-0814
  expenseMonth: 25830000, // 25 830 000 FCFA — dépenses du mois (juillet)
  currency: 'XAF',
};

/* ==============================
   VÉHICULES LES PLUS UTILISÉS (contexte client)
   ============================== */
export const MOCK_CLIENT_TOP_VEHICLES = [
  {
    id: 'V-CLT-001',
    registrationNumber: 'LT 1234 AB',
    brand: 'Toyota',
    model: 'Hilux',
    year: 2023,
    mileage: 8562,
    group: 'C',
    status: 'in_use',
    location: 'Douala',
    trips: 28,
    insuranceExpiry: '2027-01-01',
    inspectionExpiry: '2026-12-15',
    registrationExpiry: '2027-03-01',
  },
  {
    id: 'V-CLT-002',
    registrationNumber: 'CE 4587 AA',
    brand: 'Toyota',
    model: 'Land Cruiser',
    year: 2022,
    mileage: 7125,
    group: 'D',
    status: 'in_use',
    location: 'Yaoundé',
    trips: 22,
    insuranceExpiry: '2026-11-01',
    inspectionExpiry: '2027-01-20',
    registrationExpiry: '2027-02-01',
  },
  {
    id: 'V-CLT-003',
    registrationNumber: 'EN 2345 B',
    brand: 'Mitsubishi',
    model: 'L200',
    year: 2022,
    mileage: 6874,
    group: 'C',
    status: 'in_use',
    location: 'Bafoussam',
    trips: 19,
    insuranceExpiry: '2026-10-01',
    inspectionExpiry: '2026-09-15',
    registrationExpiry: '2026-12-01',
  },
  {
    id: 'V-CLT-004',
    registrationNumber: 'LT 9876 CD',
    brand: 'Nissan',
    model: 'Patrol',
    year: 2021,
    mileage: 6210,
    group: 'D',
    status: 'available',
    location: 'Kribi',
    trips: 17,
    insuranceExpiry: '2027-02-01',
    inspectionExpiry: '2027-01-01',
    registrationExpiry: '2027-03-01',
  },
  {
    id: 'V-CLT-005',
    registrationNumber: 'CE 3698 EF',
    brand: 'Isuzu',
    model: 'D-Max',
    year: 2023,
    mileage: 5980,
    group: 'C',
    status: 'maintenance',
    location: 'Garoua',
    trips: 15,
    insuranceExpiry: '2027-01-01',
    inspectionExpiry: '2027-04-01',
    registrationExpiry: '2027-06-01',
  },
];

/* ==============================
   ALERTES CLIENT (catégories + gravité)
   ============================== */
export const MOCK_CLIENT_ALERTS = {
  critical: 1,
  warning: 3,
  info: 2,
  items: [
    {
      id: 'ALT-CLT-001',
      type: 'vehicle_immobilized',
      category: 'maintenance',
      severity: 'critical',
      entityType: 'vehicle',
      entityId: 'V-CLT-005',
      title: 'Véhicule immobilisé en maintenance',
      description: 'Isuzu D-Max CE 3698 EF immobilisé à Garoua — Intervention requise rapidement.',
      createdAt: '2026-08-13T08:00:00.000Z',
    },
    {
      id: 'ALT-CLT-002',
      type: 'insurance_expiry',
      category: 'assurance',
      severity: 'warning',
      entityType: 'vehicle',
      entityId: 'V-CLT-003',
      title: 'Assurance expirant bientôt',
      description: 'Mitsubishi L200 EN 2345 B — Assurance expire le 01/10/2026.',
      createdAt: '2026-08-12T10:00:00.000Z',
    },
    {
      id: 'ALT-CLT-003',
      type: 'inspection_expiry',
      category: 'inspection',
      severity: 'warning',
      entityType: 'vehicle',
      entityId: 'V-CLT-002',
      title: 'Visite technique à prévoir',
      description: 'Toyota Land Cruiser CE 4587 AA — Visite technique expire le 20/01/2027.',
      createdAt: '2026-08-11T14:00:00.000Z',
    },
    {
      id: 'ALT-CLT-004',
      type: 'fuel_anomaly',
      category: 'fuel',
      severity: 'info',
      entityType: 'vehicle',
      entityId: 'V-CLT-009',
      title: 'Consommation anormale détectée',
      description: 'Volvo FH LT 4467 EF — 16.8 L/100 km ce mois, au-dessus de la cible 12.0.',
      createdAt: '2026-08-11T09:00:00.000Z',
    },
    {
      id: 'ALT-CLT-005',
      type: 'document_expiring',
      category: 'documents',
      severity: 'warning',
      entityType: null,
      entityId: null,
      title: 'Permis de conduire expirants',
      description: '3 permis expirent d’ici 60 jours — prévoir le renouvellement.',
      createdAt: '2026-08-10T11:30:00.000Z',
    },
    {
      id: 'ALT-CLT-006',
      type: 'maintenance_due',
      category: 'trips',
      severity: 'info',
      entityType: null,
      entityId: null,
      title: 'Trajets à valider',
      description: '2 trajets terminés ce jour (Douala → Yaoundé) attendent validation.',
      createdAt: '2026-08-10T09:00:00.000Z',
    },
  ],
};

/* ==============================
   ACTIVITÉS RÉCENTES CLIENT
   ============================== */
export const MOCK_CLIENT_ACTIVITIES = [
  {
    id: 'ACT-CLT-001',
    type: 'trip_completed',
    title: 'Trajet terminé — Douala → Yaoundé',
    description: 'Toyota Hilux LT 1234 AB · Jean Mbarga · 238 km',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'ACT-CLT-002',
    type: 'maintenance_completed',
    title: 'Entretien terminé — Toyota Land Cruiser CE 4587 AA',
    description: 'Vidange + filtre air · Garage Auto Plus Yaoundé · 185 000 FCFA',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'ACT-CLT-003',
    type: 'fuel_validated',
    title: 'Carburant ajouté — LT 1234 AB',
    description: '120 L de diesel · TotalEnergies Douala Akwa · 73 200 FCFA',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ACT-CLT-004',
    type: 'trip_created',
    title: 'Nouveau trajet — Douala → Bafoussam',
    description: 'Mitsubishi L200 EN 2345 B · Mathieu Kamga · départ 06:00',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ACT-CLT-005',
    type: 'document_uploaded',
    title: 'Document ajouté — Contrat renouvellé SRV-001',
    description: 'Contrat Location Flotte Pick-up 2026 · signé par J-P Ndongo',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

/* ==============================
   CARBURANT CLIENT
   ============================== */
export const MOCK_CLIENT_FUEL_DATA = {
  totalQuantity: 18450,
  averageConsumption: 12.5,
  totalCost: 12450000,
  monthQuantity: 18450,
  monthCost: 12450000,
  trend: -6.2,
  trendVariant: 'success',
};

/* ==============================
   ACTIONS RAPIDES CLIENT (filtrées RBAC via `permission`)
   ============================== */
export const CLIENT_QUICK_ACTIONS = [
  {
    key: 'add_vehicle',
    label: 'Ajouter un véhicule',
    icon: 'bi-truck',
    to: ROUTES.CLIENT_VEHICLES,
    permission: PERMISSIONS.CLIENT_VEHICLES_CREATE,
  },
  {
    key: 'add_driver',
    label: 'Ajouter un chauffeur',
    icon: 'bi-person-plus',
    to: ROUTES.CLIENT_DRIVERS,
    permission: PERMISSIONS.CLIENT_DRIVERS_CREATE,
  },
  {
    key: 'create_assignment',
    label: 'Créer une affectation',
    icon: 'bi-link-45deg',
    to: ROUTES.CLIENT_ASSIGNMENTS,
    permission: PERMISSIONS.CLIENT_ASSIGNMENTS_CREATE,
  },
  {
    key: 'plan_trip',
    label: 'Planifier un trajet',
    icon: 'bi-signpost-split',
    to: ROUTES.CLIENT_TRIPS,
    permission: PERMISSIONS.CLIENT_TRIPS_CREATE,
  },
  {
    key: 'declare_maintenance',
    label: 'Déclarer une maintenance',
    icon: 'bi-wrench-adjustable',
    to: ROUTES.CLIENT_MAINTENANCE,
    permission: PERMISSIONS.CLIENT_MAINTENANCE_CREATE,
  },
];

export const CLIENT_QUICK_ACTIONS_INDIVIDUAL = [
  {
    key: 'new_request',
    label: 'Nouvelle demande',
    icon: 'bi-plus-circle',
    to: ROUTES.CLIENT_REQUESTS,
    permission: PERMISSIONS.CLIENT_REQUESTS_CREATE,
  },
  {
    key: 'trips',
    label: 'Mes trajets',
    icon: 'bi-signpost-split',
    to: ROUTES.CLIENT_TRIPS,
    permission: PERMISSIONS.CLIENT_TRIPS_READ,
  },
  {
    key: 'invoices',
    label: 'Mes factures',
    icon: 'bi-receipt',
    to: ROUTES.CLIENT_INVOICES,
    permission: PERMISSIONS.CLIENT_INVOICES_READ,
  },
  {
    key: 'document',
    label: 'Mes documents',
    icon: 'bi-folder2-open',
    to: ROUTES.CLIENT_DOCUMENTS,
    permission: PERMISSIONS.CLIENT_DOCUMENTS_READ,
  },
];

/* ==============================
   OPTIONS DE PÉRIODE CLIENT
   ============================== */
export const CLIENT_PERIOD_OPTIONS = [
  { value: 'month', label: 'Ce mois-ci' },
  { value: 'last_month', label: 'Mois dernier' },
  { value: 'quarter', label: '3 derniers mois' },
  { value: 'semester', label: '6 derniers mois' },
  { value: 'custom', label: 'Période personnalisée' },
];
