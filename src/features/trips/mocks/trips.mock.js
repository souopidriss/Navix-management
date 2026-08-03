/**
 * Navix Trips — Données simulées (mode mock)
 * --------------------------------------------------------------------------
 * 18 trajets fictifs au format métier complet : id (ULID), companyId,
 * assignmentId, vehicleId, driverId, tripNumber, tripType, purpose, status,
 * itinéraire (départ / arrivée), distances, dates et heures, kilométrages,
 * durées, vitesse moyenne, passagers, poids, notes et auteur.
 *
 * Chaque trajet est rattaché à une affectation (assignmentId) : le véhicule
 * (vehicleId) et le chauffeur (driverId) proviennent de cette affectation,
 * elle-même liée à une entreprise (companyId). Toutes les références
 * correspondent exactement aux mocks des modules Entreprises, Véhicules,
 * Chauffeurs et Affectations. Les trajets passés référencent des affectations
 * terminées à la même période (cohérence temporelle).
 *
 * Aucune requête HTTP — consommé par tripService (mode mock).
 */

export const MOCK_TRIPS = [
  {
    id: '01JBC1D2E3F4G5H6J7K8L9M0N1P2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    assignmentId: '01JAAB2C3D4E5F6G7H8J9K0L1M2', // ASG-0001
    vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3', // Toyota Hilux
    driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3', // Yao N'Guessan
    tripNumber: 'TRP-0001',
    tripType: 'mission',
    purpose: 'Réunion de coordination régionale avec Trans Express CI',
    status: 'completed',
    departureLocation: 'Abidjan — Siège Navix Trans',
    arrivalLocation: 'Yamoussoukro — Agence Trans Express CI',
    plannedDistance: 245,
    actualDistance: 238,
    departureDate: '2026-07-14',
    departureTime: '07:30',
    arrivalDate: '2026-07-14',
    arrivalTime: '11:45',
    departureMileage: 43800,
    arrivalMileage: 44038,
    estimatedDuration: 240,
    actualDuration: 255,
    averageSpeed: 56,
    passengerCount: 3,
    cargoWeight: 0,
    notes: 'Véhicule de liaison inter-agences — mission du directeur régional.',
    createdBy: 'Awa Kouamé',
    createdAt: '2026-07-10T08:15:00.000Z',
    updatedAt: '2026-07-14T11:50:00.000Z',
  },
  {
    id: '01JBC2D3E4F5G6H7J8K9L0M1N2P3',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Trans Express CI
    assignmentId: '01JAAC2D3E4F5G6H7J8K9L0M1N3', // ASG-0002
    vehicleId: '01J9B2C3D4E5F6G7H8J9K0L1M3', // Mercedes-Benz Sprinter
    driverId: '01J9P2Q3R4S5T6U7V8W9X0Y1Z2A3', // Moussa Kone
    tripNumber: 'TRP-0002',
    tripType: 'delivery',
    purpose: 'Livraison de pièces détachées vers LogiSud',
    status: 'in_progress',
    departureLocation: 'Yamoussoukro — Dépôt Trans Express',
    arrivalLocation: 'Bouaké — Zone industrielle PK 15',
    plannedDistance: 150,
    actualDistance: 0,
    departureDate: '2026-08-03',
    departureTime: '06:45',
    arrivalDate: '',
    arrivalTime: '',
    departureMileage: 85200,
    arrivalMileage: 0,
    estimatedDuration: 180,
    actualDuration: 0,
    averageSpeed: 0,
    passengerCount: 1,
    cargoWeight: 850,
    notes: 'Livraison express — colis fragiles.',
    createdBy: 'Ibrahim Traoré',
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-03T06:50:00.000Z',
  },
  {
    id: '01JBC3D4E5F6G7H8J9K0L1M2N3P4',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // SenTrans
    assignmentId: '01JAAD2E3F4G5H6J7K8L9M0N1P4', // ASG-0003
    vehicleId: '01J9D2E3F4G5H6J7K8L9M0N1P3', // Toyota Corolla
    driverId: '01J9Q2R3S4T5U6V7W8X9Y0Z1A2B3', // Awa Diop
    tripNumber: 'TRP-0003',
    tripType: 'personnel',
    purpose: 'Transport du personnel — déplacement de service',
    status: 'completed',
    departureLocation: 'Dakar — Plateau',
    arrivalLocation: 'Saint-Louis — Direction régionale',
    plannedDistance: 264,
    actualDistance: 258,
    departureDate: '2026-07-22',
    departureTime: '08:00',
    arrivalDate: '2026-07-22',
    arrivalTime: '11:10',
    departureMileage: 68700,
    arrivalMileage: 68958,
    estimatedDuration: 200,
    actualDuration: 190,
    averageSpeed: 81,
    passengerCount: 4,
    cargoWeight: 0,
    notes: '',
    createdBy: 'Ousmane Diallo',
    createdAt: '2026-07-20T10:30:00.000Z',
    updatedAt: '2026-07-22T11:15:00.000Z',
  },
  {
    id: '01JBC4D5E6F7G8H9J0K1L2M3N4P5',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Bamakotrans
    assignmentId: '01JAAE2F3G4H5J6K7L8M9N0P1Q5', // ASG-0004
    vehicleId: '01J9E2F3G4H5J6K7L8M9N0P1Q3', // Hino 500
    driverId: '01J9R2S3T4U5V6W7X8Y9Z0A1B2C3', // Seydou Traoré
    tripNumber: 'TRP-0004',
    tripType: 'transport',
    purpose: 'Transport longue distance de marchandises',
    status: 'in_progress',
    departureLocation: 'Bamako — Dépôt Bamakotrans',
    arrivalLocation: 'Dakar — Corridor Bamako–Dakar',
    plannedDistance: 1230,
    actualDistance: 0,
    departureDate: '2026-08-02',
    departureTime: '22:00',
    arrivalDate: '',
    arrivalTime: '',
    departureMileage: 132600,
    arrivalMileage: 0,
    estimatedDuration: 1080,
    actualDuration: 0,
    averageSpeed: 0,
    passengerCount: 1,
    cargoWeight: 18000,
    notes: 'Corridor Bamako–Dakar — arrêt technique prévu à Kayes.',
    createdBy: 'Seydou Coulibaly',
    createdAt: '2026-07-31T16:20:00.000Z',
    updatedAt: '2026-08-02T22:05:00.000Z',
  },
  {
    id: '01JBC5D6E7F8G9H0J1K2L3M4N5P6',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // OuagaLogistics
    assignmentId: '01JAAF2G3H4J5K6L7M8N9P0Q1R6', // ASG-0005
    vehicleId: '01J9F2G3H4J5K6L7M8N9P0Q1R3', // Toyota Coaster
    driverId: '01J9S2T3U4V5W6X7Y8Z9A0B1C2D3', // Rasmata Ouédraogo
    tripNumber: 'TRP-0005',
    tripType: 'service',
    purpose: 'Navette régulière passagers',
    status: 'completed',
    departureLocation: 'Ouagadougou — Gare routière',
    arrivalLocation: 'Bobo-Dioulasso — Gare routière',
    plannedDistance: 360,
    actualDistance: 355,
    departureDate: '2026-07-18',
    departureTime: '06:00',
    arrivalDate: '2026-07-18',
    arrivalTime: '12:35',
    departureMileage: 80200,
    arrivalMileage: 80555,
    estimatedDuration: 390,
    actualDuration: 395,
    averageSpeed: 54,
    passengerCount: 28,
    cargoWeight: 120,
    notes: 'Navette urbaine saisonnière.',
    createdBy: 'Fatou Sawadogo',
    createdAt: '2026-07-15T08:00:00.000Z',
    updatedAt: '2026-07-18T12:40:00.000Z',
  },
  {
    id: '01JBC6D7E8F9G0H1J2K3L4M5N6P7',
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // LoméTrans
    assignmentId: '01JAAG2H3J4K5L6M7N8P9Q0R1S7', // ASG-0006
    vehicleId: '01J9H2J3K4L5M6N7P8Q9R0S1T3', // Yamaha MT-07
    driverId: '01J9T2U3V4W5X6Y7Z8A9B0C1D2E3', // Komi Agbeko
    tripNumber: 'TRP-0006',
    tripType: 'delivery',
    purpose: 'Tournée de livraison moto — colis express',
    status: 'planned',
    departureLocation: 'Lomé — Agence LoméTrans',
    arrivalLocation: 'Lomé — Secteur centre-ville',
    plannedDistance: 18,
    actualDistance: 0,
    departureDate: '2026-08-05',
    departureTime: '09:30',
    arrivalDate: '2026-08-05',
    arrivalTime: '10:45',
    departureMileage: 4200,
    arrivalMileage: 0,
    estimatedDuration: 75,
    actualDuration: 0,
    averageSpeed: 0,
    passengerCount: 0,
    cargoWeight: 40,
    notes: 'Livreur moto, secteur centre-ville.',
    createdBy: 'Abla Mensah',
    createdAt: '2026-08-02T11:45:00.000Z',
    updatedAt: '2026-08-02T11:45:00.000Z',
  },
  {
    id: '01JBC7D8E9F0G1H2J3K4L5M6N7P8',
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    assignmentId: '01JAAH2J3K4L5M6N7P8Q9R0S1T8', // ASG-0007
    vehicleId: '01J9J2K3L4M5N6P7Q8R9S0T1U3', // BYD K6
    driverId: '01J9U2V3W4X5Y6Z7A8B9C0D1E2F3', // Estelle Ngo
    tripNumber: 'TRP-0007',
    tripType: 'transport',
    purpose: 'Liaison interurbaine passagers',
    status: 'planned',
    departureLocation: 'Douala — Dépôt Douala Cars',
    arrivalLocation: 'Yaoundé — Gare routière',
    plannedDistance: 245,
    actualDistance: 0,
    departureDate: '2026-08-08',
    departureTime: '07:00',
    arrivalDate: '2026-08-08',
    arrivalTime: '11:00',
    departureMileage: 9600,
    arrivalMileage: 0,
    estimatedDuration: 240,
    actualDuration: 0,
    averageSpeed: 0,
    passengerCount: 45,
    cargoWeight: 300,
    notes: 'Bus électrique — recharge prévue si nécessaire.',
    createdBy: 'Estelle Ngono',
    createdAt: '2026-08-03T09:10:00.000Z',
    updatedAt: '2026-08-03T09:10:00.000Z',
  },
  {
    id: '01JBC8D9E0F1G2H3J4K5L6M7N8P9',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    assignmentId: '01JAAJ2K3L4M5N6P7Q8R9S0T1U9', // ASG-0008
    vehicleId: '01J9L2M3N4P5Q6R7S8T9U0V1W3', // Volvo FH
    driverId: '01J9W2X3Y4Z5A6B7C8D9E0F1G2H3', // Adama Bamba
    tripNumber: 'TRP-0008',
    tripType: 'transport',
    purpose: 'Convoi de conteneurs — corridor Abidjan–Bamako',
    status: 'in_progress',
    departureLocation: 'Abidjan — Terminal portuaire',
    arrivalLocation: 'Bamako — Dépôt Bamakotrans',
    plannedDistance: 1150,
    actualDistance: 0,
    departureDate: '2026-08-03',
    departureTime: '05:30',
    arrivalDate: '',
    arrivalTime: '',
    departureMileage: 214800,
    arrivalMileage: 0,
    estimatedDuration: 1020,
    actualDuration: 0,
    averageSpeed: 0,
    passengerCount: 1,
    cargoWeight: 22000,
    notes: 'Tracteur routier long parcours — escale douanière prévue.',
    createdBy: 'Awa Kouamé',
    createdAt: '2026-08-01T07:00:00.000Z',
    updatedAt: '2026-08-03T05:35:00.000Z',
  },
  {
    id: '01JBC9D0E1F2G3H4J5K6L7M8N9Q1',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    assignmentId: '01JAAK2L3M4N5P6Q7R8S9T0U1V2A', // ASG-0009
    vehicleId: '01J9X8Y7Z6A5B4C3D2E1F0G9H8J7K6', // Komatsu PC210
    driverId: '01J9X2Y3Z4A5B6C7D8E9F0G1H2J3', // Koffi N'Dri
    tripNumber: 'TRP-0009',
    tripType: 'maintenance',
    purpose: 'Transfert engin vers l’atelier pour maintenance',
    status: 'planned',
    departureLocation: 'Bouaké — Zone industrielle PK 15',
    arrivalLocation: 'Bouaké — Atelier LogiSud',
    plannedDistance: 12,
    actualDistance: 0,
    departureDate: '2026-08-11',
    departureTime: '08:00',
    arrivalDate: '2026-08-11',
    arrivalTime: '09:00',
    departureMileage: 6300,
    arrivalMileage: 0,
    estimatedDuration: 60,
    actualDuration: 0,
    averageSpeed: 0,
    passengerCount: 1,
    cargoWeight: 0,
    notes: 'Maintenance planifiée tous les 250 h.',
    createdBy: 'Mariam Koné',
    createdAt: '2026-08-03T10:30:00.000Z',
    updatedAt: '2026-08-03T10:30:00.000Z',
  },
  {
    id: '01JBD1D2E3F4G5H6J7K8L9M0N1P2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    assignmentId: '01JAAB2C3D4E5F6G7H8J9K0L1M2', // ASG-0001
    vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3', // Toyota Hilux
    driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3', // Yao N'Guessan
    tripNumber: 'TRP-0010',
    tripType: 'service',
    purpose: 'Visite client — démonstration de service',
    status: 'cancelled',
    departureLocation: 'Abidjan — Siège Navix Trans',
    arrivalLocation: 'Abidjan — Agence Abidjan',
    plannedDistance: 22,
    actualDistance: 0,
    departureDate: '2026-07-30',
    departureTime: '14:00',
    arrivalDate: '2026-07-30',
    arrivalTime: '15:15',
    departureMileage: 44200,
    arrivalMileage: 0,
    estimatedDuration: 75,
    actualDuration: 0,
    averageSpeed: 0,
    passengerCount: 2,
    cargoWeight: 0,
    notes: 'Trajet annulé — report de la visite client.',
    createdBy: 'Awa Kouamé',
    createdAt: '2026-07-28T09:00:00.000Z',
    updatedAt: '2026-07-29T17:20:00.000Z',
  },
  {
    id: '01JBD2D3E4F5G6H7J8K9L0M1N2P3',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Trans Express CI
    assignmentId: '01JAAC2D3E4F5G6H7J8K9L0M1N3', // ASG-0002
    vehicleId: '01J9B2C3D4E5F6G7H8J9K0L1M3', // Mercedes-Benz Sprinter
    driverId: '01J9P2Q3R4S5T6U7V8W9X0Y1Z2A3', // Moussa Kone
    tripNumber: 'TRP-0011',
    tripType: 'delivery',
    purpose: 'Livraison de fret régional',
    status: 'suspended',
    departureLocation: 'Yamoussoukro — Dépôt Trans Express',
    arrivalLocation: 'Bouaké — Zone industrielle PK 15',
    plannedDistance: 150,
    actualDistance: 40,
    departureDate: '2026-07-25',
    departureTime: '06:30',
    arrivalDate: '',
    arrivalTime: '',
    departureMileage: 84800,
    arrivalMileage: 0,
    estimatedDuration: 180,
    actualDuration: 0,
    averageSpeed: 0,
    passengerCount: 1,
    cargoWeight: 900,
    notes: 'Trajet suspendu — panne mécanique en cours de route, retour dépôt.',
    createdBy: 'Ibrahim Traoré',
    createdAt: '2026-07-24T08:30:00.000Z',
    updatedAt: '2026-07-25T07:50:00.000Z',
  },
  {
    id: '01JBD3D4E5F6G7H8J9K0L1M2N3P4',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    assignmentId: '01JAAN2P3Q4R5S6T7U8V9W0X1Y5D', // ASG-0012
    vehicleId: '01J9L2M3N4P5Q6R7S8T9U0V1W3', // Volvo FH
    driverId: '01J9W2X3Y4Z5A6B7C8D9E0F1G2H3', // Adama Bamba
    tripNumber: 'TRP-0012',
    tripType: 'transport',
    purpose: 'Convoi de conteneurs — corridor international',
    status: 'completed',
    departureLocation: 'Abidjan — Terminal portuaire',
    arrivalLocation: 'Bamako — Dépôt Bamakotrans',
    plannedDistance: 1150,
    actualDistance: 1142,
    departureDate: '2025-12-10',
    departureTime: '05:00',
    arrivalDate: '2025-12-12',
    arrivalTime: '09:30',
    departureMileage: 181200,
    arrivalMileage: 182342,
    estimatedDuration: 1020,
    actualDuration: 1630,
    averageSpeed: 42,
    passengerCount: 1,
    cargoWeight: 21000,
    notes: 'Clôturée avant le renouvellement de janvier 2026.',
    createdBy: 'Awa Kouamé',
    createdAt: '2025-12-08T10:00:00.000Z',
    updatedAt: '2025-12-12T10:00:00.000Z',
  },
  {
    id: '01JBD4D5E6F7G8H9J0K1L2M3N4P5',
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    assignmentId: '01JAAP2Q3R4S5T6U7V8W9X0Y1Z6E', // ASG-0013
    vehicleId: '01J9J2K3L4M5N6P7Q8R9S0T1U3', // BYD K6
    driverId: '01J9A3B4C5D6E7F8G9H0J1K2L3M4', // Jean-Marc Ekani
    tripNumber: 'TRP-0013',
    tripType: 'trial',
    purpose: 'Essai technique du bus électrique sur longue distance',
    status: 'completed',
    departureLocation: 'Douala — Dépôt Douala Cars',
    arrivalLocation: 'Yaoundé — Gare routière',
    plannedDistance: 245,
    actualDistance: 240,
    departureDate: '2026-04-18',
    departureTime: '08:00',
    arrivalDate: '2026-04-18',
    arrivalTime: '12:05',
    departureMileage: 7400,
    arrivalMileage: 7640,
    estimatedDuration: 240,
    actualDuration: 245,
    averageSpeed: 59,
    passengerCount: 40,
    cargoWeight: 250,
    notes: 'Mission de convoyage et mise en service.',
    createdBy: 'Estelle Ngono',
    createdAt: '2026-04-15T14:00:00.000Z',
    updatedAt: '2026-04-18T12:15:00.000Z',
  },
  {
    id: '01JBD5D6E7F8G9H0J1K2L3M4N5P6',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // SenTrans
    assignmentId: '01JAAQ2R3S4T5U6V7W8X9Y0Z1A7F', // ASG-0014
    vehicleId: '01J9D2E3F4G5H6J7K8L9M0N1P3', // Toyota Corolla
    driverId: '01J9Q2R3S4T5U6V7W8X9Y0Z1A2B3', // Awa Diop
    tripNumber: 'TRP-0014',
    tripType: 'mission',
    purpose: 'Mission commerciale — prospection client',
    status: 'completed',
    departureLocation: 'Dakar — Plateau',
    arrivalLocation: 'Thiès — Centre-ville',
    plannedDistance: 70,
    actualDistance: 68,
    departureDate: '2026-01-20',
    departureTime: '09:00',
    arrivalDate: '2026-01-20',
    arrivalTime: '10:25',
    departureMileage: 60800,
    arrivalMileage: 60868,
    estimatedDuration: 90,
    actualDuration: 85,
    averageSpeed: 48,
    passengerCount: 3,
    cargoWeight: 0,
    notes: '',
    createdBy: 'Ousmane Diallo',
    createdAt: '2026-01-18T15:00:00.000Z',
    updatedAt: '2026-01-20T10:30:00.000Z',
  },
  {
    id: '01JBD6D7E8F9G0H1J2K3L4M5N6P7',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    assignmentId: '01JAAR2S3T4U5V6W7X8Y9Z0A1B8G', // ASG-0015
    vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3', // Toyota Hilux
    driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3', // Yao N'Guessan
    tripNumber: 'TRP-0015',
    tripType: 'mission',
    purpose: 'Mission de déploiement de l’antenne régionale',
    status: 'completed',
    departureLocation: 'Abidjan — Siège Navix Trans',
    arrivalLocation: 'Bouaké — Zone industrielle PK 15',
    plannedDistance: 350,
    actualDistance: 341,
    departureDate: '2025-10-06',
    departureTime: '07:00',
    arrivalDate: '2025-10-06',
    arrivalTime: '11:20',
    departureMileage: 38600,
    arrivalMileage: 38941,
    estimatedDuration: 300,
    actualDuration: 260,
    averageSpeed: 79,
    passengerCount: 2,
    cargoWeight: 150,
    notes: 'Mission longue durée sur le corridor central.',
    createdBy: 'Awa Kouamé',
    createdAt: '2025-10-02T08:00:00.000Z',
    updatedAt: '2025-10-06T11:30:00.000Z',
  },
  {
    id: '01JBD7D8E9F0G1H2J3K4L5M6N7P8',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // OuagaLogistics
    assignmentId: '01JAAF2G3H4J5K6L7M8N9P0Q1R6', // ASG-0005
    vehicleId: '01J9F2G3H4J5K6L7M8N9P0Q1R3', // Toyota Coaster
    driverId: '01J9S2T3U4V5W6X7Y8Z9A0B1C2D3', // Rasmata Ouédraogo
    tripNumber: 'TRP-0016',
    tripType: 'transport',
    purpose: 'Navette retour passagers — ligne régulière',
    status: 'planned',
    departureLocation: 'Bobo-Dioulasso — Gare routière',
    arrivalLocation: 'Ouagadougou — Gare routière',
    plannedDistance: 360,
    actualDistance: 0,
    departureDate: '2026-08-15',
    departureTime: '06:00',
    arrivalDate: '2026-08-15',
    arrivalTime: '12:30',
    departureMileage: 80600,
    arrivalMileage: 0,
    estimatedDuration: 390,
    actualDuration: 0,
    averageSpeed: 0,
    passengerCount: 30,
    cargoWeight: 100,
    notes: 'Navette retour — planifiée après la saison.',
    createdBy: 'Fatou Sawadogo',
    createdAt: '2026-08-01T13:00:00.000Z',
    updatedAt: '2026-08-01T13:00:00.000Z',
  },
  {
    id: '01JBD8D9E0F1G2H3J4K5L6M7N8P9',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    assignmentId: '01JAAJ2K3L4M5N6P7Q8R9S0T1U9', // ASG-0008
    vehicleId: '01J9L2M3N4P5Q6R7S8T9U0V1W3', // Volvo FH
    driverId: '01J9W2X3Y4Z5A6B7C8D9E0F1G2H3', // Adama Bamba
    tripNumber: 'TRP-0017',
    tripType: 'transport',
    purpose: 'Convoi de marchandises — corridor Abidjan–Bouaké',
    status: 'planned',
    departureLocation: 'Abidjan — Terminal portuaire',
    arrivalLocation: 'Bouaké — Zone industrielle PK 15',
    plannedDistance: 350,
    actualDistance: 0,
    departureDate: '2026-08-20',
    departureTime: '05:00',
    arrivalDate: '2026-08-20',
    arrivalTime: '10:30',
    departureMileage: 217500,
    arrivalMileage: 0,
    estimatedDuration: 330,
    actualDuration: 0,
    averageSpeed: 0,
    passengerCount: 1,
    cargoWeight: 19000,
    notes: 'Convoi planifié — chargement au terminal.',
    createdBy: 'Awa Kouamé',
    createdAt: '2026-08-02T08:20:00.000Z',
    updatedAt: '2026-08-02T08:20:00.000Z',
  },
  {
    id: '01JBD9D0E1F2G3H4J5K6L7M8N9Q1',
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // LoméTrans
    assignmentId: '01JAAG2H3J4K5L6M7N8P9Q0R1S7', // ASG-0006
    vehicleId: '01J9H2J3K4L5M6N7P8Q9R0S1T3', // Yamaha MT-07
    driverId: '01J9T2U3V4W5X6Y7Z8A9B0C1D2E3', // Komi Agbeko
    tripNumber: 'TRP-0018',
    tripType: 'delivery',
    purpose: 'Tournée de livraison moto — colis de bureau',
    status: 'planned',
    departureLocation: 'Lomé — Agence LoméTrans',
    arrivalLocation: 'Lomé — Quartier administratif',
    plannedDistance: 24,
    actualDistance: 0,
    departureDate: '2026-08-06',
    departureTime: '09:00',
    arrivalDate: '2026-08-06',
    arrivalTime: '10:30',
    departureMileage: 4250,
    arrivalMileage: 0,
    estimatedDuration: 90,
    actualDuration: 0,
    averageSpeed: 0,
    passengerCount: 0,
    cargoWeight: 60,
    notes: 'Colis de bureau et courriers.',
    createdBy: 'Abla Mensah',
    createdAt: '2026-08-03T12:00:00.000Z',
    updatedAt: '2026-08-03T12:00:00.000Z',
  },
];

/** Pré-calcule le prochain numéro de trajet (ex. TRP-0019). */
export const nextTripNumber = (() => {
  const max = MOCK_TRIPS.reduce((highest, trip) => {
    const match = trip.tripNumber.match(/(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return String(max + 1).padStart(4, '0');
})();
