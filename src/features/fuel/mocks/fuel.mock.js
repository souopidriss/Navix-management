/**
 * Navix Fuel — Données simulées (mode mock)
 * --------------------------------------------------------------------------
 * 18 pleins fictifs au format métier complet : id (ULID), companyId,
 * vehicleId, driverId, tripId (optionnel), fuelNumber, station (nom / ville),
 * fuelType, quantity, unitPrice, totalCost, currency, mileage,
 * consumptionAverage, paymentMethod, invoiceNumber, receiptImage, status,
 * notes, créateur et dates.
 *
 * Les références (companyId, vehicleId, driverId) correspondent exactement
 * aux mocks des modules Entreprises, Véhicules et Chauffeurs ; les tripId
 * correspondent aux mocks du module Trajets. Les kilométrages sont croissants
 * pour chaque véhicule (cohérence avec la règle « kilométrage supérieur au
 * dernier plein connu »). Deux pleins affichent une consommation anormale
 * (Hilux et Sprinter) pour illustrer la détection.
 *
 * Aucune requête HTTP — consommé par fuelService (mode mock).
 */

export const MOCK_FUEL_RECORDS = [
  {
    id: '01JBE1D2E3F4G5H6J7K8L9M0N1P2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3', // Toyota Hilux
    driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3', // Yao N'Guessan
    tripId: '',
    fuelNumber: 'FL-0001',
    stationName: 'TotalEnergies',
    stationCity: 'Abidjan',
    fuelType: 'diesel',
    quantity: 55,
    unitPrice: 605,
    totalCost: 33275,
    currency: 'XOF',
    mileage: 63200,
    consumptionAverage: 8.4,
    paymentMethod: 'fuel_card',
    invoiceNumber: 'FN-2026-0051',
    receiptImage: '',
    status: 'validated',
    notes: 'Plein de routine — carte carburant flotte.',
    createdBy: 'Awa Kouamé',
    createdAt: '2026-03-03T08:15:00.000Z',
    updatedAt: '2026-03-03T14:30:00.000Z',
  },
  {
    id: '01JBE2D3E4F5G6H7J8K9L0M1N2P3',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    vehicleId: '01J9L2M3N4P5Q6R7S8T9U0V1W3', // Volvo FH
    driverId: '01J9W2X3Y4Z5A6B7C8D9E0F1G2H3', // Adama Bamba
    tripId: '',
    fuelNumber: 'FL-0002',
    stationName: 'Vivo Energy',
    stationCity: 'Abidjan',
    fuelType: 'diesel',
    quantity: 380,
    unitPrice: 598,
    totalCost: 227240,
    currency: 'XOF',
    mileage: 206300,
    consumptionAverage: 34.8,
    paymentMethod: 'company_account',
    invoiceNumber: 'FN-2026-0062',
    receiptImage: '',
    status: 'validated',
    notes: 'Tracteur routier — plein avant convoi corridor.',
    createdBy: 'Awa Kouamé',
    createdAt: '2026-03-18T06:40:00.000Z',
    updatedAt: '2026-03-18T13:10:00.000Z',
  },
  {
    id: '01JBE3D4E5F6G7H8J9K0L1M2N3P4',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // SenTrans
    vehicleId: '01J9D2E3F4G5H6J7K8L9M0N1P3', // Toyota Corolla
    driverId: '01J9Q2R3S4T5U6V7W8X9Y0Z1A2B3', // Awa Diop
    tripId: '',
    fuelNumber: 'FL-0003',
    stationName: 'TotalEnergies',
    stationCity: 'Dakar',
    fuelType: 'essence',
    quantity: 42,
    unitPrice: 720,
    totalCost: 30240,
    currency: 'XOF',
    mileage: 76200,
    consumptionAverage: 6.9,
    paymentMethod: 'card',
    invoiceNumber: 'FN-2026-0090',
    receiptImage: '',
    status: 'cancelled',
    notes: 'Ticket douteux — plein annulé après contrôle.',
    createdBy: 'Ousmane Diallo',
    createdAt: '2026-04-02T10:05:00.000Z',
    updatedAt: '2026-04-04T09:00:00.000Z',
  },
  {
    id: '01JBE4D5E6F7G8H9J0K1L2M3N4P5',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Bamakotrans
    vehicleId: '01J9E2F3G4H5J6K7L8M9N0P1Q3', // Hino 500
    driverId: '01J9R2S3T4U5V6W7X8Y9Z0A1B2C3', // Seydou Traoré
    tripId: '',
    fuelNumber: 'FL-0004',
    stationName: 'Oryx',
    stationCity: 'Bamako',
    fuelType: 'diesel',
    quantity: 250,
    unitPrice: 585,
    totalCost: 146250,
    currency: 'XOF',
    mileage: 149800,
    consumptionAverage: 31.8,
    paymentMethod: 'fuel_card',
    invoiceNumber: 'FN-2026-0115',
    receiptImage: '',
    status: 'validated',
    notes: 'Camion longue distance — plein au départ.',
    createdBy: 'Seydou Coulibaly',
    createdAt: '2026-04-20T07:25:00.000Z',
    updatedAt: '2026-04-20T15:45:00.000Z',
  },
  {
    id: '01JBE5D6E7F8G9H0J1K2L3M4N5P6',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Trans Express CI
    vehicleId: '01J9B2C3D4E5F6G7H8J9K0L1M3', // Mercedes-Benz Sprinter
    driverId: '01J9P2Q3R4S5T6U7V8W9X0Y1Z2A3', // Moussa Kone
    tripId: '',
    fuelNumber: 'FL-0005',
    stationName: 'Shell',
    stationCity: 'Yamoussoukro',
    fuelType: 'diesel',
    quantity: 68,
    unitPrice: 612,
    totalCost: 41616,
    currency: 'XOF',
    mileage: 89500,
    consumptionAverage: 9.2,
    paymentMethod: 'cash',
    invoiceNumber: 'FN-2026-0140',
    receiptImage: '',
    status: 'cancelled',
    notes: 'Montant facturé incohérent — en attente de justificatif.',
    createdBy: 'Ibrahim Traoré',
    createdAt: '2026-05-05T11:20:00.000Z',
    updatedAt: '2026-05-06T08:00:00.000Z',
  },
  {
    id: '01JBE6D7E8F9G0H1J2K3L4M5N6P7',
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // LoméTrans
    vehicleId: '01J9H2J3K4L5M6N7P8Q9R0S1T3', // Yamaha MT-07
    driverId: '01J9T2U3V4W5X6Y7Z8A9B0C1D2E3', // Komi Agbeko
    tripId: '',
    fuelNumber: 'FL-0006',
    stationName: 'Sahara',
    stationCity: 'Lomé',
    fuelType: 'essence',
    quantity: 9,
    unitPrice: 640,
    totalCost: 5760,
    currency: 'XOF',
    mileage: 4150,
    consumptionAverage: 4.6,
    paymentMethod: 'cash',
    invoiceNumber: 'FN-2026-0163',
    receiptImage: '',
    status: 'validated',
    notes: '',
    createdBy: 'Abla Mensah',
    createdAt: '2026-05-22T09:45:00.000Z',
    updatedAt: '2026-05-22T16:20:00.000Z',
  },
  {
    id: '01JBE7D8E9F0G1H2J3K4L5M6N7P8',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // OuagaLogistics
    vehicleId: '01J9F2G3H4J5K6L7M8N9P0Q1R3', // Toyota Coaster
    driverId: '01J9S2T3U4V5W6X7Y8Z9A0B1C2D3', // Rasmata Ouédraogo
    tripId: '',
    fuelNumber: 'FL-0007',
    stationName: 'TotalEnergies',
    stationCity: 'Ouagadougou',
    fuelType: 'diesel',
    quantity: 95,
    unitPrice: 618,
    totalCost: 58710,
    currency: 'XOF',
    mileage: 87100,
    consumptionAverage: 19.8,
    paymentMethod: 'fuel_card',
    invoiceNumber: 'FN-2026-0180',
    receiptImage: '',
    status: 'cancelled',
    notes: 'Plein non conforme à l’affectation journalière.',
    createdBy: 'Fatou Sawadogo',
    createdAt: '2026-06-03T08:10:00.000Z',
    updatedAt: '2026-06-04T10:30:00.000Z',
  },
  {
    id: '01JBE8D9E0F1G2H3J4K5L6M7N8P9',
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    vehicleId: '01J9J2K3L4M5N6P7Q8R9S0T1U3', // BYD K6
    driverId: '01J9U2V3W4X5Y6Z7A8B9C0D1E2F3', // Estelle Ngo
    tripId: '01JBD4D5E6F7G8H9J0K1L2M3N4P5', // TRP-0013
    fuelNumber: 'FL-0008',
    stationName: 'ENEO Station',
    stationCity: 'Douala',
    fuelType: 'electrique',
    quantity: 120,
    unitPrice: 85,
    totalCost: 10200,
    currency: 'XAF',
    mileage: 9700,
    consumptionAverage: 0,
    paymentMethod: 'card',
    invoiceNumber: 'FN-2026-0195',
    receiptImage: '',
    status: 'pending',
    notes: 'Session de recharge bus électrique (kWh).',
    createdBy: 'Estelle Ngono',
    createdAt: '2026-06-21T18:30:00.000Z',
    updatedAt: '2026-06-21T18:30:00.000Z',
  },
  {
    id: '01JBE9D0E1F2G3H4J5K6L7M8N9Q1P2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3', // Toyota Hilux
    driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3', // Yao N'Guessan
    tripId: '',
    fuelNumber: 'FL-0009',
    stationName: 'TotalEnergies',
    stationCity: 'Abidjan',
    fuelType: 'diesel',
    quantity: 52,
    unitPrice: 620,
    totalCost: 32240,
    currency: 'XOF',
    mileage: 64250,
    consumptionAverage: 8.0,
    paymentMethod: 'fuel_card',
    invoiceNumber: 'FN-2026-0218',
    receiptImage: '',
    status: 'validated',
    notes: '',
    createdBy: 'Awa Kouamé',
    createdAt: '2026-07-02T07:55:00.000Z',
    updatedAt: '2026-07-02T13:40:00.000Z',
  },
  {
    id: '01JBF1D2E3F4G5H6J7K8L9M0N1P2',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    vehicleId: '01J9X8Y7Z6A5B4C3D2E1F0G9H8J7K6', // Komatsu PC210
    driverId: '01J9X2Y3Z4A5B6C7D8E9F0G1H2J3', // Koffi N'Dri
    tripId: '01JBC9D0E1F2G3H4J5K6L7M8N9Q1', // TRP-0009
    fuelNumber: 'FL-0010',
    stationName: 'Petroci',
    stationCity: 'Bouaké',
    fuelType: 'gasoil',
    quantity: 180,
    unitPrice: 608,
    totalCost: 109440,
    currency: 'XOF',
    mileage: 6120,
    consumptionAverage: 21.6,
    paymentMethod: 'company_account',
    invoiceNumber: 'FN-2026-0225',
    receiptImage: '',
    status: 'pending',
    notes: 'Engin de chantier — ravitaillement sur site.',
    createdBy: 'Mariam Koné',
    createdAt: '2026-07-08T14:05:00.000Z',
    updatedAt: '2026-07-08T14:05:00.000Z',
  },
  {
    id: '01JBF2D3E4F5G6H7J8K9L0M1N2P3',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3', // Toyota Hilux
    driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3', // Yao N'Guessan
    tripId: '01JBC1D2E3F4G5H6J7K8L9M0N1P2', // TRP-0001
    fuelNumber: 'FL-0011',
    stationName: 'TotalEnergies',
    stationCity: 'Abidjan',
    fuelType: 'diesel',
    quantity: 55,
    unitPrice: 625,
    totalCost: 34375,
    currency: 'XOF',
    mileage: 68350,
    consumptionAverage: 14.6,
    paymentMethod: 'fuel_card',
    invoiceNumber: 'FN-2026-0240',
    receiptImage: '',
    status: 'validated',
    notes: 'Consommation anormale détectée — contrôle du véhicule demandé.',
    createdBy: 'Awa Kouamé',
    createdAt: '2026-07-14T07:30:00.000Z',
    updatedAt: '2026-07-15T09:15:00.000Z',
  },
  {
    id: '01JBF3D4E5F6G7H8J9K0L1M2N3P4',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Trans Express CI
    vehicleId: '01J9B2C3D4E5F6G7H8J9K0L1M3', // Mercedes-Benz Sprinter
    driverId: '01J9P2Q3R4S5T6U7V8W9X0Y1Z2A3', // Moussa Kone
    tripId: '01JBD2D3E4F5G6H7J8K9L0M1N2P3', // TRP-0011
    fuelNumber: 'FL-0012',
    stationName: 'Shell',
    stationCity: 'Yamoussoukro',
    fuelType: 'diesel',
    quantity: 70,
    unitPrice: 618,
    totalCost: 43260,
    currency: 'XOF',
    mileage: 92400,
    consumptionAverage: 15.8,
    paymentMethod: 'cash',
    invoiceNumber: 'FN-2026-0261',
    receiptImage: '',
    status: 'validated',
    notes: 'Consommation anormale — surveillance renforcée.',
    createdBy: 'Ibrahim Traoré',
    createdAt: '2026-07-24T09:10:00.000Z',
    updatedAt: '2026-07-25T08:45:00.000Z',
  },
  {
    id: '01JBF4D5E6F7G8H9J0K1L2M3N4P5',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    vehicleId: '01J9L2M3N4P5Q6R7S8T9U0V1W3', // Volvo FH
    driverId: '01J9W2X3Y4Z5A6B7C8D9E0F1G2H3', // Adama Bamba
    tripId: '01JBC8D9E0F1G2H3J4K5L6M7N8P9', // TRP-0008
    fuelNumber: 'FL-0013',
    stationName: 'Vivo Energy',
    stationCity: 'Abidjan',
    fuelType: 'diesel',
    quantity: 390,
    unitPrice: 610,
    totalCost: 237900,
    currency: 'XOF',
    mileage: 210100,
    consumptionAverage: 34.6,
    paymentMethod: 'company_account',
    invoiceNumber: 'FN-2026-0270',
    receiptImage: '',
    status: 'validated',
    notes: 'Plein convoi conteneurs — corridor Abidjan–Bamako.',
    createdBy: 'Awa Kouamé',
    createdAt: '2026-07-30T05:50:00.000Z',
    updatedAt: '2026-07-30T14:00:00.000Z',
  },
  {
    id: '01JBF5D6E7F8G9H0J1K2L3M4N5P6',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // SenTrans
    vehicleId: '01J9D2E3F4G5H6J7K8L9M0N1P3', // Toyota Corolla
    driverId: '01J9Q2R3S4T5U6V7W8X9Y0Z1A2B3', // Awa Diop
    tripId: '',
    fuelNumber: 'FL-0014',
    stationName: 'TotalEnergies',
    stationCity: 'Dakar',
    fuelType: 'essence',
    quantity: 40,
    unitPrice: 735,
    totalCost: 29400,
    currency: 'XOF',
    mileage: 78300,
    consumptionAverage: 6.8,
    paymentMethod: 'card',
    invoiceNumber: 'FN-2026-0280',
    receiptImage: '',
    status: 'validated',
    notes: '',
    createdBy: 'Ousmane Diallo',
    createdAt: '2026-08-01T09:20:00.000Z',
    updatedAt: '2026-08-01T16:05:00.000Z',
  },
  {
    id: '01JBF6D7E8F9G0H1J2K3L4M5N6P7',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Bamakotrans
    vehicleId: '01J9E2F3G4H5J6K7L8M9N0P1Q3', // Hino 500
    driverId: '01J9R2S3T4U5V6W7X8Y9Z0A1B2C3', // Seydou Traoré
    tripId: '',
    fuelNumber: 'FL-0015',
    stationName: 'Oryx',
    stationCity: 'Bamako',
    fuelType: 'diesel',
    quantity: 260,
    unitPrice: 590,
    totalCost: 153400,
    currency: 'XOF',
    mileage: 150900,
    consumptionAverage: 32.4,
    paymentMethod: 'fuel_card',
    invoiceNumber: 'FN-2026-0285',
    receiptImage: '',
    status: 'validated',
    notes: '',
    createdBy: 'Seydou Coulibaly',
    createdAt: '2026-08-02T06:35:00.000Z',
    updatedAt: '2026-08-02T12:50:00.000Z',
  },
  {
    id: '01JBF7D8E9F0G1H2J3K4L5M6N7P8',
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // LoméTrans
    vehicleId: '01J9H2J3K4L5M6N7P8Q9R0S1T3', // Yamaha MT-07
    driverId: '01J9T2U3V4W5X6Y7Z8A9B0C1D2E3', // Komi Agbeko
    tripId: '',
    fuelNumber: 'FL-0016',
    stationName: 'Sahara',
    stationCity: 'Lomé',
    fuelType: 'essence',
    quantity: 8,
    unitPrice: 645,
    totalCost: 5160,
    currency: 'XOF',
    mileage: 4280,
    consumptionAverage: 5.0,
    paymentMethod: 'cash',
    invoiceNumber: 'FN-2026-0291',
    receiptImage: '',
    status: 'pending',
    notes: '',
    createdBy: 'Abla Mensah',
    createdAt: '2026-08-03T08:40:00.000Z',
    updatedAt: '2026-08-03T08:40:00.000Z',
  },
  {
    id: '01JBF8D9E0F1G2H3J4K5L6M7N8P9',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // OuagaLogistics
    vehicleId: '01J9F2G3H4J5K6L7M8N9P0Q1R3', // Toyota Coaster
    driverId: '01J9S2T3U4V5W6X7Y8Z9A0B1C2D3', // Rasmata Ouédraogo
    tripId: '',
    fuelNumber: 'FL-0017',
    stationName: 'TotalEnergies',
    stationCity: 'Ouagadougou',
    fuelType: 'diesel',
    quantity: 100,
    unitPrice: 622,
    totalCost: 62200,
    currency: 'XOF',
    mileage: 88000,
    consumptionAverage: 18.9,
    paymentMethod: 'fuel_card',
    invoiceNumber: 'FN-2026-0294',
    receiptImage: '',
    status: 'pending',
    notes: '',
    createdBy: 'Fatou Sawadogo',
    createdAt: '2026-08-03T10:15:00.000Z',
    updatedAt: '2026-08-03T10:15:00.000Z',
  },
  {
    id: '01JBF9D0E1F2G3H4J5K6L7M8N9Q1P2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    vehicleId: '01J9L2M3N4P5Q6R7S8T9U0V1W3', // Volvo FH
    driverId: '01J9W2X3Y4Z5A6B7C8D9E0F1G2H3', // Adama Bamba
    tripId: '01JBD8D9E0F1G2H3J4K5L6M7N8P9', // TRP-0017
    fuelNumber: 'FL-0018',
    stationName: 'Vivo Energy',
    stationCity: 'Abidjan',
    fuelType: 'diesel',
    quantity: 400,
    unitPrice: 615,
    totalCost: 246000,
    currency: 'XOF',
    mileage: 217400,
    consumptionAverage: 35.0,
    paymentMethod: 'company_account',
    invoiceNumber: 'FN-2026-0298',
    receiptImage: '',
    status: 'validated',
    notes: 'Plein convoi planifié — chargement terminal.',
    createdBy: 'Awa Kouamé',
    createdAt: '2026-08-03T13:05:00.000Z',
    updatedAt: '2026-08-03T16:40:00.000Z',
  },
];

/** Pré-calcule le prochain numéro de plein (ex. FL-0019). */
export const nextFuelNumber = (() => {
  const max = MOCK_FUEL_RECORDS.reduce((highest, record) => {
    const match = record.fuelNumber.match(/(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return String(max + 1).padStart(4, '0');
})();
