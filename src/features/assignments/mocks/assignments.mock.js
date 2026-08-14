/**
 * Navix Assignments — Données simulées (mode mock)
 * --------------------------------------------------------------------------
 * 18 affectations fictives au format métier complet : id (ULID), companyId,
 * vehicleId, driverId, agencyId, assignmentNumber, assignmentType, status,
 * startDate, expectedEndDate, endDate, kilométrages, niveaux de carburant,
 * raison, destination, notes, créateur et validateur.
 *
 * Les références (companyId, vehicleId, driverId, agencyId) correspondent
 * exactement aux mocks des modules Entreprises, Véhicules et Chauffeurs.
 * Cohérence métier : un même véhicule / un même chauffeur ne possède qu'une
 * seule affectation ACTIVE (les affectations prévues, terminées, suspendues
 * ou annulées peuvent coexister).
 *
 * Aucune requête HTTP — consommé par assignmentService (mode mock).
 */

export const MOCK_ASSIGNMENTS = [
  {
    id: '01JAAB2C3D4E5F6G7H8J9K0L1M2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    agencyId: '01JA1B2C3D4E5F6G7H8J9K0L1M5', // Agence Douala
    vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3', // Toyota Hilux
    driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3', // Yao N'Guessan
    assignmentNumber: 'ASG-0001',
    assignmentType: 'permanent',
    status: 'active',
    startDate: '2026-01-15',
    expectedEndDate: '2027-01-15',
    endDate: '',
    startMileage: 41200,
    endMileage: 0,
    fuelLevelStart: 75,
    fuelLevelEnd: 0,
    reason: 'Affectation permanente du pick-up de liaison.',
    destination: 'Douala — corridor intérieur',
    notes: 'Véhicule de liaison inter-agences.',
    createdBy: 'Awa Kouamé',
    validatedBy: 'Awa Kouamé',
    createdAt: '2026-01-15T08:30:00.000Z',
    updatedAt: '2026-07-28T14:05:00.000Z',
  },
  {
    id: '01JAAC2D3E4F5G6H7J8K9L0M1N3',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Cameroon Express
    agencyId: '01JA2B3C4D5E6F7G8H9J0K1L2M5', // Agence Yaoundé
    vehicleId: '01J9B2C3D4E5F6G7H8J9K0L1M3', // Mercedes-Benz Sprinter
    driverId: '01J9P2Q3R4S5T6U7V8W9X0Y1Z2A3', // Moussa Kone
    assignmentNumber: 'ASG-0002',
    assignmentType: 'permanent',
    status: 'active',
    startDate: '2026-03-02',
    expectedEndDate: '2027-03-02',
    endDate: '',
    startMileage: 74300,
    endMileage: 0,
    fuelLevelStart: 60,
    fuelLevelEnd: 0,
    reason: 'Affectation permanente du fourgon livraison.',
    destination: 'Yaoundé et environs',
    notes: 'Fourgon affecté aux livraisons urbaines.',
    createdBy: 'Ibrahim Traoré',
    validatedBy: 'Ibrahim Traoré',
    createdAt: '2026-03-02T09:15:00.000Z',
    updatedAt: '2026-06-15T08:42:00.000Z',
  },
  {
    id: '01JAAD2E3F4G5H6J7K8L9M0N1P4',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // Kribi Port Trans
    agencyId: '01JA4B5C6D7E8F9G0H1J2K3L4M5', // Agence Kribi
    vehicleId: '01J9D2E3F4G5H6J7K8L9M0N1P3', // Toyota Corolla
    driverId: '01J9Q2R3S4T5U6V7W8X9Y0Z1A2B3', // Awa Diop
    assignmentNumber: 'ASG-0003',
    assignmentType: 'permanent',
    status: 'active',
    startDate: '2026-02-20',
    expectedEndDate: '2027-02-20',
    endDate: '',
    startMileage: 61200,
    endMileage: 0,
    fuelLevelStart: 80,
    fuelLevelEnd: 0,
    reason: 'Affectation permanente berline de service.',
    destination: 'Kribi et banlieue',
    notes: '',
    createdBy: 'Ousmane Diallo',
    validatedBy: 'Ousmane Diallo',
    createdAt: '2026-02-20T10:00:00.000Z',
    updatedAt: '2026-07-02T17:25:00.000Z',
  },
  {
    id: '01JAAE2F3G4H5J6K7L8M9N0P1Q5',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Nord Express
    agencyId: '01JA5B6C7D8E9F0G1H2J3K4L5M6', // Agence Garoua
    vehicleId: '01J9E2F3G4H5J6K7L8M9N0P1Q3', // Hino 500
    driverId: '01J9R2S3T4U5V6W7X8Y9Z0A1B2C3', // Seydou Traoré
    assignmentNumber: 'ASG-0004',
    assignmentType: 'permanent',
    status: 'active',
    startDate: '2026-04-01',
    expectedEndDate: '2027-04-01',
    endDate: '',
    startMileage: 128400,
    endMileage: 0,
    fuelLevelStart: 55,
    fuelLevelEnd: 0,
    reason: 'Affectation permanente camion longue distance.',
    destination: 'Garoua — Kribi',
    notes: 'Corridor longue distance Garoua–Kribi.',
    createdBy: 'Seydou Coulibaly',
    validatedBy: 'Seydou Coulibaly',
    createdAt: '2026-04-01T07:45:00.000Z',
    updatedAt: '2026-05-30T12:18:00.000Z',
  },
  {
    id: '01JAAF2G3H4J5K6L7M8N9P0Q1R6',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // Ouest Logistique
    agencyId: '01JA6B7C8D9E0F1G2H3J4K5L6M7', // Agence Bafoussam
    vehicleId: '01J9F2G3H4J5K6L7M8N9P0Q1R3', // Toyota Coaster
    driverId: '01J9S2T3U4V5W6X7Y8Z9A0B1C2D3', // Rasmata Ouédraogo
    assignmentNumber: 'ASG-0005',
    assignmentType: 'temporary',
    status: 'active',
    startDate: '2026-06-15',
    expectedEndDate: '2026-09-15',
    endDate: '',
    startMileage: 77400,
    endMileage: 0,
    fuelLevelStart: 70,
    fuelLevelEnd: 0,
    reason: 'Renfort navette urbaine pour la saison.',
    destination: 'Bafoussam — navette centre-ville',
    notes: 'Affectation temporaire jusqu’à la fin de la saison.',
    createdBy: 'Fatou Sawadogo',
    validatedBy: 'Fatou Sawadogo',
    createdAt: '2026-06-15T08:20:00.000Z',
    updatedAt: '2026-07-10T13:40:00.000Z',
  },
  {
    id: '01JAAG2H3J4K5L6M7N8P9Q0R1S7',
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // Sanaga Trans
    agencyId: '01JA8B9C0D1E2F3G4H5J6K7L8M9', // Agence Edéa
    vehicleId: '01J9H2J3K4L5M6N7P8Q9R0S1T3', // Yamaha MT-07
    driverId: '01J9T2U3V4W5X6Y7Z8A9B0C1D2E3', // Komi Agbeko
    assignmentNumber: 'ASG-0006',
    assignmentType: 'permanent',
    status: 'active',
    startDate: '2026-06-25',
    expectedEndDate: '2027-06-25',
    endDate: '',
    startMileage: 3100,
    endMileage: 0,
    fuelLevelStart: 85,
    fuelLevelEnd: 0,
    reason: 'Affectation permanente moto livreur.',
    destination: 'Edéa — secteur centre-ville',
    notes: 'Livreur moto, secteur centre-ville.',
    createdBy: 'Abla Mensah',
    validatedBy: 'Abla Mensah',
    createdAt: '2026-06-25T08:50:00.000Z',
    updatedAt: '2026-06-25T08:50:00.000Z',
  },
  {
    id: '01JAAH2J3K4L5M6N7P8Q9R0S1T8',
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    agencyId: '01JA9B0C1D2E3F4G5H6J7K8L9N1', // Agence Bonanjo
    vehicleId: '01J9J2K3L4M5N6P7Q8R9S0T1U3', // BYD K6
    driverId: '01J9U2V3W4X5Y6Z7A8B9C0D1E2F3', // Estelle Ngo
    assignmentNumber: 'ASG-0007',
    assignmentType: 'permanent',
    status: 'active',
    startDate: '2026-05-04',
    expectedEndDate: '2027-05-04',
    endDate: '',
    startMileage: 8900,
    endMileage: 0,
    fuelLevelStart: 90,
    fuelLevelEnd: 0,
    reason: 'Affectation permanente bus électrique.',
    destination: 'Douala — ligne urbaine',
    notes: 'Bus électrique — recharge à la station centrale.',
    createdBy: 'Estelle Ngono',
    validatedBy: 'Estelle Ngono',
    createdAt: '2026-05-04T09:10:00.000Z',
    updatedAt: '2026-07-21T11:05:00.000Z',
  },
  {
    id: '01JAAJ2K3L4M5N6P7Q8R9S0T1U9',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    agencyId: '01JA1B2C3D4E5F6G7H8J9K0L1M5', // Agence Douala
    vehicleId: '01J9L2M3N4P5Q6R7S8T9U0V1W3', // Volvo FH
    driverId: '01J9W2X3Y4Z5A6B7C8D9E0F1G2H3', // Adama Bamba
    assignmentNumber: 'ASG-0008',
    assignmentType: 'permanent',
    status: 'active',
    startDate: '2026-01-10',
    expectedEndDate: '2027-01-10',
    endDate: '',
    startMileage: 188900,
    endMileage: 0,
    fuelLevelStart: 65,
    fuelLevelEnd: 0,
    reason: 'Affectation permanente tracteur routier.',
    destination: 'Douala — corridors internationaux',
    notes: 'Doyen de la flotte — tracteur routier.',
    createdBy: 'Awa Kouamé',
    validatedBy: 'Awa Kouamé',
    createdAt: '2026-01-10T06:40:00.000Z',
    updatedAt: '2026-07-28T14:05:00.000Z',
  },
  {
    id: '01JAAK2L3M4N5P6Q7R8S9T0U1V2A',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    agencyId: '01JA3B4C5D6E7F8G9H0J1K2L3M5', // Agence Ebolowa
    vehicleId: '01J9X8Y7Z6A5B4C3D2E1F0G9H8J7K6', // Komatsu PC210
    driverId: '01J9X2Y3Z4A5B6C7D8E9F0G1H2J3', // Koffi N'Dri
    assignmentNumber: 'ASG-0009',
    assignmentType: 'permanent',
    status: 'active',
    startDate: '2026-05-11',
    expectedEndDate: '2027-05-11',
    endDate: '',
    startMileage: 5400,
    endMileage: 0,
    fuelLevelStart: 50,
    fuelLevelEnd: 0,
    reason: 'Affectation permanente pelle mécanique chantier.',
    destination: 'Ebolowa — zone industrielle PK 15',
    notes: 'Engin de chantier — maintenance tous les 250 h.',
    createdBy: 'Mariam Koné',
    validatedBy: 'Mariam Koné',
    createdAt: '2026-05-11T07:55:00.000Z',
    updatedAt: '2026-07-22T16:10:00.000Z',
  },
  {
    id: '01JAAL2M3N4P5Q6R7S8T9U0V1W3B',
    companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', // Sahel Express
    agencyId: '01JA0B1C2D3E4F5G6H7J8K9L0N2', // Agence Maroua
    vehicleId: '01J9K2L3M4N5P6Q7R8S9T0U1V3', // Toyota Land Cruiser 79
    driverId: '01J9V2W3X4Y5Z6A7B8C9D0E1F2G3', // Charles Mba
    assignmentNumber: 'ASG-0010',
    assignmentType: 'permanent',
    status: 'suspended',
    startDate: '2026-03-08',
    expectedEndDate: '2027-03-08',
    endDate: '',
    startMileage: 104200,
    endMileage: 0,
    fuelLevelStart: 70,
    fuelLevelEnd: 0,
    reason: 'Suspension temporaire — congé du chauffeur et révision du véhicule.',
    destination: 'Maroua et périphérie',
    notes: 'Affectation suspendue pendant le congé annuel de Charles Mba.',
    createdBy: 'Charles Mba',
    validatedBy: 'Charles Mba',
    createdAt: '2026-03-08T08:25:00.000Z',
    updatedAt: '2026-07-18T09:55:00.000Z',
  },
  {
    id: '01JAAM2N3P4Q5R6S7T8U9V0W1X4C',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Cameroon Express
    agencyId: '01JA2B3C4D5E6F7G8H9J0K1L2M5', // Agence Yaoundé
    vehicleId: '01J9M2N3P4Q5R6S7T8U9V0W1X3', // Toyota Hiace Ambulance
    driverId: '01J9Y2Z3A4B5C6D7E8F9G0H1J2K3', // Serge Kouassi
    assignmentNumber: 'ASG-0011',
    assignmentType: 'permanent',
    status: 'cancelled',
    startDate: '2026-04-20',
    expectedEndDate: '2027-04-20',
    endDate: '2026-07-01',
    startMileage: 35600,
    endMileage: 0,
    fuelLevelStart: 80,
    fuelLevelEnd: 0,
    reason: 'Annulée suite à la suspension administrative du chauffeur.',
    destination: 'Yaoundé — CHU',
    notes: 'Ambulance médicalisée — CHU de rattachement.',
    createdBy: 'Ibrahim Traoré',
    validatedBy: 'Ibrahim Traoré',
    createdAt: '2026-04-20T09:00:00.000Z',
    updatedAt: '2026-07-01T09:20:00.000Z',
  },
  {
    id: '01JAAN2P3Q4R5S6T7U8V9W0X1Y5D',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    agencyId: '01JA1B2C3D4E5F6G7H8J9K0L1M5', // Agence Douala
    vehicleId: '01J9L2M3N4P5Q6R7S8T9U0V1W3', // Volvo FH
    driverId: '01J9W2X3Y4Z5A6B7C8D9E0F1G2H3', // Adama Bamba
    assignmentNumber: 'ASG-0012',
    assignmentType: 'permanent',
    status: 'completed',
    startDate: '2025-09-01',
    expectedEndDate: '2026-09-01',
    endDate: '2026-01-05',
    startMileage: 164700,
    endMileage: 188900,
    fuelLevelStart: 60,
    fuelLevelEnd: 45,
    reason: 'Affectation annuelle précédente — renouvelée.',
    destination: 'Douala — corridors internationaux',
    notes: 'Clôturée avant le renouvellement de janvier 2026.',
    createdBy: 'Awa Kouamé',
    validatedBy: 'Awa Kouamé',
    createdAt: '2025-09-01T06:40:00.000Z',
    updatedAt: '2026-01-05T18:30:00.000Z',
  },
  {
    id: '01JAAP2Q3R4S5T6U7V8W9X0Y1Z6E',
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    agencyId: '01JA9B0C1D2E3F4G5H6J7K8L9N1', // Agence Bonanjo
    vehicleId: '01J9J2K3L4M5N6P7Q8R9S0T1U3', // BYD K6
    driverId: '01J9A3B4C5D6E7F8G9H0J1K2L3M4', // Jean-Marc Ekani
    assignmentNumber: 'ASG-0013',
    assignmentType: 'mission',
    status: 'completed',
    startDate: '2026-03-01',
    expectedEndDate: '2026-04-30',
    endDate: '2026-05-01',
    startMileage: 6200,
    endMileage: 8900,
    fuelLevelStart: 100,
    fuelLevelEnd: 30,
    reason: 'Mission de transfert et mise en service de la ligne urbaine.',
    destination: 'Douala — Yaoundé',
    notes: 'Mission de convoyage du bus électrique.',
    createdBy: 'Estelle Ngono',
    validatedBy: 'Estelle Ngono',
    createdAt: '2026-03-01T07:00:00.000Z',
    updatedAt: '2026-05-01T17:20:00.000Z',
  },
  {
    id: '01JAAQ2R3S4T5U6V7W8X9Y0Z1A7F',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // Kribi Port Trans
    agencyId: '01JA4B5C6D7E8F9G0H1J2K3L4M5', // Agence Kribi
    vehicleId: '01J9D2E3F4G5H6J7K8L9M0N1P3', // Toyota Corolla
    driverId: '01J9Q2R3S4T5U6V7W8X9Y0Z1A2B3', // Awa Diop
    assignmentNumber: 'ASG-0014',
    assignmentType: 'permanent',
    status: 'completed',
    startDate: '2025-11-12',
    expectedEndDate: '2026-11-12',
    endDate: '2026-02-15',
    startMileage: 52800,
    endMileage: 61200,
    fuelLevelStart: 65,
    fuelLevelEnd: 40,
    reason: 'Affectation précédente clôturée avant renouvellement.',
    destination: 'Kribi et banlieue',
    notes: '',
    createdBy: 'Ousmane Diallo',
    validatedBy: 'Ousmane Diallo',
    createdAt: '2025-11-12T10:00:00.000Z',
    updatedAt: '2026-02-15T16:45:00.000Z',
  },
  {
    id: '01JAAR2S3T4U5V6W7X8Y9Z0A1B8G',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    agencyId: '01JA1B2C3D4E5F6G7H8J9K0L1M5', // Agence Douala
    vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3', // Toyota Hilux
    driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3', // Yao N'Guessan
    assignmentNumber: 'ASG-0015',
    assignmentType: 'mission',
    status: 'completed',
    startDate: '2025-08-01',
    expectedEndDate: '2025-12-20',
    endDate: '2025-12-20',
    startMileage: 34100,
    endMileage: 41200,
    fuelLevelStart: 90,
    fuelLevelEnd: 50,
    reason: 'Mission de déploiement de l’antenne régionale.',
    destination: 'Douala — Ebolowa',
    notes: 'Mission longue durée sur le corridor central.',
    createdBy: 'Awa Kouamé',
    validatedBy: 'Awa Kouamé',
    createdAt: '2025-08-01T08:30:00.000Z',
    updatedAt: '2025-12-20T15:10:00.000Z',
  },
  {
    id: '01JAAS2T3U4V5W6X7Y8Z9A0B1C9H',
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    agencyId: '01JA9B0C1D2E3F4G5H6J7K8L9N1', // Agence Bonanjo
    vehicleId: '01J9J2K3L4M5N6P7Q8R9S0T1U3', // BYD K6
    driverId: '01J9A3B4C5D6E7F8G9H0J1K2L3M4', // Jean-Marc Ekani
    assignmentNumber: 'ASG-0016',
    assignmentType: 'replacement',
    status: 'planned',
    startDate: '2026-08-10',
    expectedEndDate: '2026-12-31',
    endDate: '',
    startMileage: 0,
    endMileage: 0,
    fuelLevelStart: 0,
    fuelLevelEnd: 0,
    reason: 'Renfort de conduite du bus électrique pendant la saison haute.',
    destination: 'Douala — ligne urbaine',
    notes: 'Remplacement planifié en binôme avec Estelle Ngo.',
    createdBy: 'Estelle Ngono',
    validatedBy: '',
    createdAt: '2026-07-30T10:15:00.000Z',
    updatedAt: '2026-07-30T10:15:00.000Z',
  },
  {
    id: '01JAAT2U3V4W5X6Y7Z8A9B0C1D2AI',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // Ouest Logistique
    agencyId: '01JA6B7C8D9E0F1G2H3J4K5L6M7', // Agence Bafoussam
    vehicleId: '01J9F2G3H4J5K6L7M8N9P0Q1R3', // Toyota Coaster
    driverId: '01J9S2T3U4V5W6X7Y8Z9A0B1C2D3', // Rasmata Ouédraogo
    assignmentNumber: 'ASG-0017',
    assignmentType: 'trial',
    status: 'planned',
    startDate: '2026-09-20',
    expectedEndDate: '2026-10-20',
    endDate: '',
    startMileage: 0,
    endMileage: 0,
    fuelLevelStart: 0,
    fuelLevelEnd: 0,
    reason: 'Période d’essai du minibus après la saison.',
    destination: 'Bafoussam — navette centre-ville',
    notes: 'Essai d’un mois avant décision d’affectation définitive.',
    createdBy: 'Fatou Sawadogo',
    validatedBy: '',
    createdAt: '2026-07-25T14:30:00.000Z',
    updatedAt: '2026-07-25T14:30:00.000Z',
  },
  {
    id: '01JAAU2V3W4X5Y6Z7A8B9C0D1E2BJ',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    agencyId: '01JA3B4C5D6E7F8G9H0J1K2L3M5', // Agence Ebolowa
    vehicleId: '01J9C2D3E4F5G6H7J8K9L0M1N3', // Renault Master
    driverId: '01J9X2Y3Z4A5B6C7D8E9F0G1H2J3', // Koffi N'Dri
    assignmentNumber: 'ASG-0018',
    assignmentType: 'maintenance',
    status: 'planned',
    startDate: '2026-08-15',
    expectedEndDate: '2026-08-22',
    endDate: '',
    startMileage: 0,
    endMileage: 0,
    fuelLevelStart: 0,
    fuelLevelEnd: 0,
    reason: 'Planification de la remise en service après remplacement d’embrayage.',
    destination: 'Ebolowa — atelier LogiSud',
    notes: 'Le fourgon sera réaffecté à Koffi N’Dri après la maintenance.',
    createdBy: 'Mariam Koné',
    validatedBy: '',
    createdAt: '2026-07-28T09:40:00.000Z',
    updatedAt: '2026-07-28T09:40:00.000Z',
  },
];

/** Pré-calcule le prochain numéro d'affectation (ex. ASG-0019). */
export const nextAssignmentNumber = (() => {
  const max = MOCK_ASSIGNMENTS.reduce((highest, assignment) => {
    const match = assignment.assignmentNumber.match(/(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return String(max + 1).padStart(4, '0');
})();
