/**
 * Navix Client — Données simulées Espace Client (Mock Cameroon)
 * --------------------------------------------------------------------------
 * Données de démonstration réalistes pour le marché camerounais (🇨🇲 Cameroun).
 * Monnaie : FCFA (XAF). Villes : Douala, Yaoundé, Bafoussam, Kribi, Garoua.
 */

export const MOCK_CLIENT_ENTERPRISE = {
  id: 'CLT-ENT-001',
  userId: '01J8A2B3C4D5E6F7G8H9J0K1L1',
  clientType: 'enterprise',
  companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
  companyName: 'Transports Express Cameroun',
  registrationNumber: 'RC/DLA/2021/B/1452',
  taxId: 'M052112345678A',
  contactName: 'Jean-Pierre Ndongo',
  email: 'contact@express-cameroun.cm',
  phone: '+237 6 99 88 77 66',
  city: 'Douala',
  address: 'Boulevard de la Liberté, Akwa',
  country: 'Cameroun',
  flag: '🇨🇲',
  status: 'active',
  createdAt: '2025-01-15T08:00:00.000Z',
  activeServicesCount: 3,
  assignedVehiclesCount: 14,
  pendingRequestsCount: 4,
  totalInvoicedAmount: 48500000, // 48 500 000 FCFA
};

export const MOCK_CLIENT_INDIVIDUAL = {
  id: 'CLT-IND-002',
  userId: '01J8B2C3D4E5F6G7H8J9K0L2',
  clientType: 'individual',
  displayName: 'Paul Manga',
  email: 'paul.manga@gmail.com',
  phone: '+237 6 77 11 22 33',
  city: 'Yaoundé',
  address: 'Quartier Bastos',
  country: 'Cameroun',
  flag: '🇨🇲',
  status: 'active',
  createdAt: '2025-03-10T10:30:00.000Z',
  activeServicesCount: 1,
  assignedVehiclesCount: 0,
  pendingRequestsCount: 1,
  totalInvoicedAmount: 2450000, // 2 450 000 FCFA
};

export const MOCK_CLIENT_SERVICES = [
  {
    id: 'SRV-001',
    name: 'Contrat Location Flotte Pick-up',
    category: 'fleet_rental',
    clientType: 'enterprise',
    vehiclesCount: 8,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    monthlyFee: 6500000, // FCFA
    status: 'active',
  },
  {
    id: 'SRV-002',
    name: 'Transport VIP & Navettes Cadres',
    category: 'vip_transport',
    clientType: 'enterprise',
    vehiclesCount: 4,
    startDate: '2026-02-15',
    endDate: '2026-11-30',
    monthlyFee: 3200000, // FCFA
    status: 'active',
  },
  {
    id: 'SRV-003',
    name: 'Assistance Logistique Inter-villes',
    category: 'logistics_freight',
    clientType: 'enterprise',
    vehiclesCount: 2,
    startDate: '2026-03-01',
    endDate: '2026-08-31',
    monthlyFee: 4800000, // FCFA
    status: 'active',
  },
];

export const MOCK_CLIENT_REQUESTS = [
  {
    id: 'REQ-2026-001',
    title: 'Demande de 2 Pick-up Hilux — Chantier Kribi',
    type: 'fleet_addition',
    departureCity: 'Douala',
    destinationCity: 'Kribi',
    departureDate: '2026-08-20',
    returnDate: '2026-08-28',
    status: 'pending',
    createdAt: '2026-08-12T14:20:00.000Z',
    estimatedCost: 1850000,
  },
  {
    id: 'REQ-2026-002',
    title: 'Mise à disposition Chauffeur VIP — Yaoundé Bastos',
    type: 'vip_driver',
    departureCity: 'Yaoundé',
    destinationCity: 'Yaoundé',
    departureDate: '2026-08-16',
    returnDate: '2026-08-18',
    status: 'approved',
    createdAt: '2026-08-10T09:15:00.000Z',
    estimatedCost: 450000,
  },
  {
    id: 'REQ-2026-003',
    title: 'Transport de matériel de Douala vers Bafoussam',
    type: 'freight_transport',
    departureCity: 'Douala',
    destinationCity: 'Bafoussam',
    departureDate: '2026-08-05',
    returnDate: '2026-08-06',
    status: 'completed',
    createdAt: '2026-08-01T11:00:00.000Z',
    estimatedCost: 920000,
  },
];

export const MOCK_CLIENT_INVOICES = [
  {
    id: 'INV-2026-08',
    invoiceNumber: 'FAC-2026-0814',
    period: 'Août 2026',
    issueDate: '2026-08-01',
    dueDate: '2026-08-31',
    amount: 14500000, // 14 500 000 FCFA
    status: 'pending',
    pdfUrl: '#',
  },
  {
    id: 'INV-2026-07',
    invoiceNumber: 'FAC-2026-0701',
    period: 'Juillet 2026',
    issueDate: '2026-07-01',
    dueDate: '2026-07-31',
    amount: 14500000,
    status: 'paid',
    paidAt: '2026-07-15',
    pdfUrl: '#',
  },
  {
    id: 'INV-2026-06',
    invoiceNumber: 'FAC-2026-0601',
    period: 'Juin 2026',
    issueDate: '2026-06-01',
    dueDate: '2026-06-30',
    amount: 12800000,
    status: 'paid',
    paidAt: '2026-06-12',
    pdfUrl: '#',
  },
];
