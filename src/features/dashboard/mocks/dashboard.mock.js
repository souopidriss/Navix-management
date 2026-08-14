/**
 * Navix Dashboard — Données simulées spécifiques au tableau de bord
 * --------------------------------------------------------------------------
 * Alertes, activité récente et classements (top véhicules / top chauffeurs).
 * Les identifiants référencés correspondent exactement aux mocks des modules
 * Entreprises, Véhicules, Chauffeurs, Trajets, Carburant, Entretiens et
 * Documents — aucune référence inventée hors de l'écosystème Navix.
 *
 * Aucune requête HTTP — consommé par dashboardService (mode mock).
 */

export const MOCK_DASHBOARD_ALERTS = [
  {
    id: '01JDK1A2B3C4D5E6F7G8H9J0K1L2',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    type: 'maintenance_urgent',
    severity: 'critical',
    entityType: 'maintenance',
    entityId: '01JBX2C3D4E5F6G7H8J9K0L1M2N3', // MT-0002 Renault Master
    vehicleId: '01J9C2D3E4F5G6H7J8K9L0M1N3', // Renault Master EF 2040 OP
    title: 'Réparation urgente — Renault Master EF 2040 OP',
    description: 'Remplacement d’embrayage en cours, pièce en attente de livraison. Véhicule immobilisé.',
    createdAt: '2026-08-02T08:00:00.000Z',
  },
  {
    id: '01JDK2B3C4D5E6F7G8H9J0K1L2M3',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    type: 'vehicle_immobilized',
    severity: 'critical',
    entityType: 'vehicle',
    entityId: '01J9G2H3J4K5L6M7N8P9Q0R1S3', // Peugeot 3008 MN 5602 WX
    vehicleId: '01J9G2H3J4K5L6M7N8P9Q0R1S3',
    title: 'Peugeot 3008 MN 5602 WX hors service',
    description: 'Véhicule déclaré hors service, aucun trajet planifié tant qu’il n’est pas réparé.',
    createdAt: '2026-08-01T10:30:00.000Z',
  },
  {
    id: '01JDK3C4D5E6F7G8H9J0K1L2M3N4',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    type: 'maintenance_due',
    severity: 'warning',
    entityType: 'maintenance',
    entityId: '01JBX1C2D3E4F5G6H7J8K9L0M1N2', // MT-0001 vidange Hilux
    vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3', // Toyota Hilux AB 3824 KL
    title: 'Vidange à prévoir — Toyota Hilux AB 3824 KL',
    description: 'Prochaine vidange programmée au 15 octobre 2026 (seuil 72 000 km).',
    createdAt: '2026-08-01T07:45:00.000Z',
  },
  {
    id: '01JDK4D5E6F7G8H9J0K1L2M3N4P5',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Cameroon Express
    type: 'document_expiring',
    severity: 'warning',
    entityType: 'document',
    entityId: '01JDA6F7G8H9J0K1L2M3N4P5Q6R7', // CT Mercedes-Benz Sprinter
    vehicleId: '01J9B2C3D4E5F6G7H8J9K0L1M3', // Mercedes-Benz Sprinter CD 5510 MN
    title: 'Contrôle technique expirant — Sprinter CD 5510 MN',
    description: 'La visite technique expire le 10 septembre 2026. Prévoyez le passage au centre 2C.',
    createdAt: '2026-07-31T15:20:00.000Z',
  },
  {
    id: '01JDK5E6F7G8H9J0K1L2M3N4P5Q6',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    type: 'fuel_anomaly',
    severity: 'warning',
    entityType: 'fuel',
    entityId: '01JBE1D2E3F4G5H6J7K8L9M0N1P2', // FL-0001 Toyota Hilux
    vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3', // Toyota Hilux AB 3824 KL
    title: 'Consommation anormale — Toyota Hilux AB 3824 KL',
    description: 'Consommation relevée au-dessus du seuil de la catégorie Pick-up. Contrôler le véhicule.',
    createdAt: '2026-07-29T09:00:00.000Z',
  },
  {
    id: '01JDK6F7G8H9J0K1L2M3N4P5Q6R7',
    companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', // Sahel Express
    type: 'maintenance_late',
    severity: 'warning',
    entityType: 'maintenance',
    entityId: '01JBX5F6G7H8J9K0L1M2N3P4Q5R6',
    vehicleId: '01J9K2L3M4N5P6Q7R8S9T0U1V3', // Toyota Land Cruiser 79 ST 9901 CD
    title: 'Entretien en retard — Land Cruiser 79 ST 9901 CD',
    description: 'Un entretien planifié n’a pas été réalisé à la date prévue. À replanifier rapidement.',
    createdAt: '2026-07-28T11:10:00.000Z',
  },
  {
    id: '01JDK7G8H9J0K1L2M3N4P5Q6R7S8',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    type: 'insurance_expiry',
    severity: 'info',
    entityType: 'vehicle',
    entityId: '01J9C2D3E4F5G6H7J8K9L0M1N3', // Renault Master EF 2040 OP
    vehicleId: '01J9C2D3E4F5G6H7J8K9L0M1N3',
    title: 'Assurance proche de l’échéance — Master EF 2040 OP',
    description: 'L’assurance du véhicule expire le 15 août 2026. Pensez au renouvellement.',
    createdAt: '2026-07-27T14:00:00.000Z',
  },
  {
    id: '01JDK8H9J0K1L2M3N4P5Q6R7S8T9',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // Ouest Logistique
    type: 'inspection_expiry',
    severity: 'info',
    entityType: 'vehicle',
    entityId: '01J9F2G3H4J5K6L7M8N9P0Q1R3', // Toyota Coaster KL 1274 UV
    vehicleId: '01J9F2G3H4J5K6L7M8N9P0Q1R3',
    title: 'Visite technique proche — Coaster KL 1274 UV',
    description: 'La visite technique du véhicule approche. Planifier le contrôle avant utilisation en ligne.',
    createdAt: '2026-07-26T16:40:00.000Z',
  },
];

export const MOCK_DASHBOARD_ACTIVITIES = [
  {
    id: '01JDL1B2C3D4E5F6G7H8J9K0L1M2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    type: 'trip_completed',
    entityType: 'trip',
    entityId: '01JBC1D2E3F4G5H6J7K8L9M0N1P2', // TRP-0001
    title: 'Trajet terminé — Douala → Yaoundé',
    description: 'Toyota Hilux AB 3824 KL · Yao N’Guessan · 238 km',
    createdAt: '2026-07-14T11:50:00.000Z',
  },
  {
    id: '01JDL2C3D4E5F6G7H8J9K0L1M2N3',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    type: 'fuel_validated',
    entityType: 'fuel',
    entityId: '01JBE1D2E3F4G5H6J7K8L9M0N1P2', // FL-0001
    title: 'Plein validé — Toyota Hilux AB 3824 KL',
    description: '55 L de diesel · TotalEnergies Douala · 33 275 FCFA',
    createdAt: '2026-07-13T14:30:00.000Z',
  },
  {
    id: '01JDL3D4E5F6G7H8J9K0L1M2N3P4',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // Kribi Port Trans
    type: 'maintenance_completed',
    entityType: 'maintenance',
    entityId: '01JBX3D4E5F6G7H8J9K0L1M2N3P4', // MT-0003
    title: 'Contrôle technique terminé — Corolla GH 7781 QR',
    description: 'Centre de contrôle 2C · 25 000 FCFA · certificat valable 1 an',
    createdAt: '2026-06-20T09:05:00.000Z',
  },
  {
    id: '01JDL4E5F6G7H8J9K0L1M2N3P4Q5',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    type: 'maintenance_created',
    entityType: 'maintenance',
    entityId: '01JBX2C3D4E5F6G7H8J9K0L1M2N3', // MT-0002
    title: 'Entretien planifié — Renault Master EF 2040 OP',
    description: 'Réparation embrayage · priorité urgente · Garage Central',
    createdAt: '2026-07-25T11:00:00.000Z',
  },
  {
    id: '01JDL5F6G7H8J9K0L1M2N3P4Q5R6',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    type: 'document_uploaded',
    entityType: 'document',
    entityId: '01JDA6F7G8H9J0K1L2M3N4P5Q6R7',
    title: 'Document ajouté — Contrôle technique Sprinter',
    description: 'Visite technique Mercedes-Benz Sprinter CD 5510 MN',
    createdAt: '2026-07-22T10:15:00.000Z',
  },
  {
    id: '01JDL6G7H8J9K0L1M2N3P4Q5R6S7',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    type: 'vehicle_created',
    entityType: 'vehicle',
    entityId: '01J9X8Y7Z6A5B4C3D2E1F0G9H8J7K6', // Komatsu PC210
    title: 'Véhicule ajouté — Komatsu PC210 EF 8821 OP',
    description: 'Groupe E · Engins · ajouté au parc LogiSud',
    createdAt: '2026-07-18T09:40:00.000Z',
  },
];

export const MOCK_DASHBOARD_TOP_VEHICLES = [
  {
    vehicleId: '01J9L2M3N4P5Q6R7S8T9U0V1W3', // Volvo FH UV 4467 EF
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    registrationNumber: 'UV 4467 EF',
    brand: 'Volvo',
    model: 'FH',
    group: 'D',
    trips: 6,
    distanceKm: 3820,
    fuelCost: 908960,
  },
  {
    vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3', // Toyota Hilux AB 3824 KL
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    registrationNumber: 'AB 3824 KL',
    brand: 'Toyota',
    model: 'Hilux',
    group: 'C',
    trips: 8,
    distanceKm: 2940,
    fuelCost: 332750,
  },
  {
    vehicleId: '01J9E2F3G4H5J6K7L8M9N0P1Q3', // Hino 500 IJ 9034 ST
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2',
    registrationNumber: 'IJ 9034 ST',
    brand: 'Hino',
    model: '500',
    group: 'D',
    trips: 5,
    distanceKm: 2510,
    fuelCost: 731250,
  },
  {
    vehicleId: '01J9F2G3H4J5K6L7M8N9P0Q1R3', // Toyota Coaster KL 1274 UV
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2',
    registrationNumber: 'KL 1274 UV',
    brand: 'Toyota',
    model: 'Coaster',
    group: 'F',
    trips: 4,
    distanceKm: 1980,
    fuelCost: 495000,
  },
  {
    vehicleId: '01J9B2C3D4E5F6G7H8J9K0L1M3', // Mercedes-Benz Sprinter CD 5510 MN
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2',
    registrationNumber: 'CD 5510 MN',
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    group: 'C',
    trips: 7,
    distanceKm: 1640,
    fuelCost: 280000,
  },
];

export const MOCK_DASHBOARD_TOP_DRIVERS = [
  {
    driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3', // Yao N'Guessan
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    fullName: 'Yao N’Guessan',
    trips: 8,
    distanceKm: 2940,
    hoursDriven: 96,
  },
  {
    driverId: '01J9W2X3Y4Z5A6B7C8D9E0F1G2H3', // Adama Bamba
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    fullName: 'Adama Bamba',
    trips: 6,
    distanceKm: 3820,
    hoursDriven: 118,
  },
  {
    driverId: '01J9R2S3T4U5V6W7X8Y9Z0A1B2C3', // Seydou Traoré
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2',
    fullName: 'Seydou Traoré',
    trips: 5,
    distanceKm: 2510,
    hoursDriven: 80,
  },
  {
    driverId: '01J9S2T3U4V5W6X7Y8Z9A0B1C2D3', // Rasmata Ouédraogo
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2',
    fullName: 'Rasmata Ouédraogo',
    trips: 4,
    distanceKm: 1980,
    hoursDriven: 58,
  },
  {
    driverId: '01J9Q2R3S4T5U6V7W8X9Y0Z1A2B3', // Awa Diop
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2',
    fullName: 'Awa Diop',
    trips: 5,
    distanceKm: 1860,
    hoursDriven: 62,
  },
];
