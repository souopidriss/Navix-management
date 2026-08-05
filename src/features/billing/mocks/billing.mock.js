/**
 * Navix Billing — Données simulées (mode mock)
 * --------------------------------------------------------------------------
 * Facturation 100 % simulée — aucun paiement réel. Modèle :
 *   - MOCK_INVOICES         : 16 factures (NAVIX-2026-000001…) couvrant tous
 *                             les statuts (brouillon, émise, payée, partielle,
 *                             en retard, annulée, remboursée)
 *   - MOCK_INVOICE_ITEMS    : lignes de facture (renouvellement, setup, usage)
 *   - MOCK_PAYMENTS         : paiements simulés (réussi, échec, en cours…)
 *   - MOCK_BILLING_CREDITS  : avoirs (disponible, utilisé, expiré)
 *   - MOCK_BILLING_DISCOUNTS: remises (pourcentage / montant fixe)
 *   - MOCK_BILLING_HISTORY  : journal de facturation
 *   - MOCK_BILLING_SETTINGS : paramètres de la plateforme
 *
 * Les montants sont liés aux devises des entreprises (XAF / EUR) et
 * cohérents avec les plans SaaS (Starter 29 €, Business 79 €,
 * Professional 149 €, Enterprise 299 €) et les abonnements mockés.
 * Aucune requête HTTP — consommé par billingService (mode mock).
 */
import { MOCK_COMPANIES } from '@/features/companies/mocks';
import { MOCK_SUBSCRIPTIONS } from '@/features/subscriptions/mocks';

const companyName = (id) => MOCK_COMPANIES.find((company) => company.id === id)?.name ?? '';

export const COMPANY_IDS = MOCK_COMPANIES.map((company) => company.id);

/* --------------------------------------------------------------------------
   Factures (Invoice)
   -------------------------------------------------------------------------- */

export const MOCK_INVOICES = [
  {
    id: '01KB0A1B2C3D4E5F6G7H8J9K0L1',
    number: 'NAVIX-2026-000001',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    subscriptionId: '01JS1A2B3C4D5E6F7G8H9J0K1L2',
    status: 'paid',
    currency: 'XAF',
    issuedDate: '2026-07-05',
    dueDate: '2026-07-20',
    paidDate: '2026-07-06',
    periodStart: '2026-07-01',
    periodEnd: '2026-07-31',
    subtotal: 196000,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 35280,
    total: 231280,
    creditId: null,
    creditApplied: 0,
    amountPaid: 231280,
    amountDue: 0,
    note: 'Renouvellement mensuel du plan Enterprise.',
    createdAt: '2026-07-05T06:00:00.000Z',
    updatedAt: '2026-07-06T08:12:00.000Z',
  },
  {
    id: '01KB0B2C3D4E5F6G7H8J9K0L1M2',
    number: 'NAVIX-2026-000002',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    subscriptionId: '01JS1A2B3C4D5E6F7G8H9J0K1L2',
    status: 'issued',
    currency: 'XAF',
    issuedDate: '2026-08-05',
    dueDate: '2026-08-20',
    paidDate: null,
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    subtotal: 196000,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 35280,
    total: 231280,
    creditId: null,
    creditApplied: 0,
    amountPaid: 0,
    amountDue: 231280,
    note: 'Renouvellement mensuel du plan Enterprise.',
    createdAt: '2026-08-05T05:30:00.000Z',
    updatedAt: '2026-08-05T05:30:00.000Z',
  },
  {
    id: '01KB0C3D4E5F6G7H8J9K0L1M2N3',
    number: 'NAVIX-2026-000003',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Trans Express CI
    subscriptionId: '01JS2B3C4D5E6F7G8H9J0K1L2M3',
    status: 'partially_paid',
    currency: 'XAF',
    issuedDate: '2026-07-01',
    dueDate: '2026-07-15',
    paidDate: '2026-07-14',
    periodStart: '2026-07-01',
    periodEnd: '2026-07-31',
    subtotal: 51800,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 9324,
    total: 61124,
    creditId: null,
    creditApplied: 0,
    amountPaid: 30000,
    amountDue: 31124,
    note: 'Versement partiel reçu — solde à régulariser.',
    createdAt: '2026-07-01T07:00:00.000Z',
    updatedAt: '2026-07-14T10:00:00.000Z',
  },
  {
    id: '01KB0D4E5F6G7H8J9K0L1M2N3P4',
    number: 'NAVIX-2026-000004',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Trans Express CI
    subscriptionId: '01JS2B3C4D5E6F7G8H9J0K1L2M3',
    status: 'overdue',
    currency: 'XAF',
    issuedDate: '2026-06-01',
    dueDate: '2026-06-15',
    paidDate: null,
    periodStart: '2026-06-01',
    periodEnd: '2026-06-30',
    subtotal: 51800,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 9324,
    total: 61124,
    creditId: null,
    creditApplied: 0,
    amountPaid: 0,
    amountDue: 61124,
    note: 'Facture impayée au-delà de l’échéance.',
    createdAt: '2026-06-01T07:00:00.000Z',
    updatedAt: '2026-06-16T08:00:00.000Z',
  },
  {
    id: '01KB0E5F6G7H8J9K0L1M2N3P4Q5',
    number: 'NAVIX-2026-000005',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    subscriptionId: '01JS3C4D5E6F7G8H9J0K1L2M3N4',
    status: 'draft',
    currency: 'XAF',
    issuedDate: null,
    dueDate: null,
    paidDate: null,
    periodStart: '2026-08-15',
    periodEnd: '2026-09-14',
    subtotal: 19000,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 3420,
    total: 22420,
    creditId: null,
    creditApplied: 0,
    amountPaid: 0,
    amountDue: 22420,
    note: 'Facture proforma — première échéance après l’essai gratuit.',
    createdAt: '2026-08-04T09:00:00.000Z',
    updatedAt: '2026-08-04T09:00:00.000Z',
  },
  {
    id: '01KB0F6G7H8J9K0L1M2N3P4Q5R6',
    number: 'NAVIX-2026-000006',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // SenTrans
    subscriptionId: '01JS4D5E6F7G8H9J0K1L2M3N4P5',
    status: 'paid',
    currency: 'EUR',
    issuedDate: '2026-07-28',
    dueDate: '2026-07-28',
    paidDate: '2026-07-28',
    periodStart: '2026-07-28',
    periodEnd: '2027-07-28',
    subtotal: 790,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 142.2,
    total: 932.2,
    creditId: null,
    creditApplied: 0,
    amountPaid: 932.2,
    amountDue: 0,
    note: 'Renouvellement annuel du plan Business.',
    createdAt: '2026-07-28T06:00:00.000Z',
    updatedAt: '2026-07-28T10:00:00.000Z',
  },
  {
    id: '01KB0G7H8J9K0L1M2N3P4Q5R6S7',
    number: 'NAVIX-2026-000007',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Bamakotrans
    subscriptionId: '01JS5E6F7G8H9J0K1L2M3N4P5Q6',
    status: 'overdue',
    currency: 'XAF',
    issuedDate: '2026-06-25',
    dueDate: '2026-07-10',
    paidDate: null,
    periodStart: '2026-06-25',
    periodEnd: '2026-07-24',
    subtotal: 19000,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 3420,
    total: 22420,
    creditId: null,
    creditApplied: 0,
    amountPaid: 0,
    amountDue: 22420,
    note: 'Paiement Mobile Money échoué — relance envoyée.',
    createdAt: '2026-06-25T07:00:00.000Z',
    updatedAt: '2026-07-11T18:00:00.000Z',
  },
  {
    id: '01KB0H8J9K0L1M2N3P4Q5R6S7T8',
    number: 'NAVIX-2026-000008',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // OuagaLogistics
    subscriptionId: '01JS6F7G8H9J0K1L2M3N4P5Q6R7',
    status: 'partially_paid',
    currency: 'XAF',
    issuedDate: '2026-07-22',
    dueDate: '2026-08-06',
    paidDate: '2026-07-25',
    periodStart: '2026-07-22',
    periodEnd: '2026-08-21',
    subtotal: 97700,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 17586,
    total: 115286,
    creditId: '01KC0D5E6F7G8H9J0K1L2M3N4P5Q6',
    creditApplied: 20000,
    amountPaid: 60000,
    amountDue: 35286,
    note: 'Paiement Mobile Money + avoir appliqué.',
    createdAt: '2026-07-22T07:30:00.000Z',
    updatedAt: '2026-07-25T14:00:00.000Z',
  },
  {
    id: '01KB0J9K0L1M2N3P4Q5R6S7T8U9',
    number: 'NAVIX-2026-000009',
    companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', // Bénin Express
    subscriptionId: '01JS7G8H9J0K1L2M3N4P5Q6R7S8',
    status: 'cancelled',
    currency: 'XAF',
    issuedDate: '2026-07-09',
    dueDate: '2026-07-09',
    paidDate: null,
    periodStart: '2026-07-09',
    periodEnd: '2026-08-08',
    subtotal: 19000,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 3420,
    total: 22420,
    creditId: null,
    creditApplied: 0,
    amountPaid: 0,
    amountDue: 0,
    note: 'Annulée — abonnement résilié.',
    createdAt: '2026-07-09T08:00:00.000Z',
    updatedAt: '2026-07-09T12:00:00.000Z',
  },
  {
    id: '01KB0K0L1M2N3P4Q5R6S7T8U9V1',
    number: 'NAVIX-2026-000010',
    companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', // Bénin Express
    subscriptionId: '01JS7G8H9J0K1L2M3N4P5Q6R7S8',
    status: 'refunded',
    currency: 'XAF',
    issuedDate: '2026-06-10',
    dueDate: '2026-06-25',
    paidDate: '2026-06-12',
    periodStart: '2026-06-10',
    periodEnd: '2026-07-09',
    subtotal: 19000,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 3420,
    total: 22420,
    creditId: null,
    creditApplied: 0,
    amountPaid: 22420,
    amountDue: 0,
    note: 'Remboursée intégralement après résiliation.',
    createdAt: '2026-06-10T08:00:00.000Z',
    updatedAt: '2026-06-30T15:00:00.000Z',
  },
  {
    id: '01KB0L1M2N3P4Q5R6S7T8U9V1W2',
    number: 'NAVIX-2026-000011',
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // LoméTrans
    subscriptionId: '01JS8H9J0K1L2M3N4P5Q6R7S8T9',
    status: 'draft',
    currency: 'XAF',
    issuedDate: null,
    dueDate: null,
    paidDate: null,
    periodStart: '2026-08-17',
    periodEnd: '2026-09-16',
    subtotal: 19000,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 3420,
    total: 22420,
    creditId: null,
    creditApplied: 0,
    amountPaid: 0,
    amountDue: 22420,
    note: 'Facture proforma — première échéance après l’essai gratuit.',
    createdAt: '2026-08-04T10:00:00.000Z',
    updatedAt: '2026-08-04T10:00:00.000Z',
  },
  {
    id: '01KB0M2N3P4Q5R6S7T8U9V1W2X3',
    number: 'NAVIX-2026-000012',
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    subscriptionId: '01JS9J0K1L2M3N4P5Q6R7S8T9U1',
    status: 'issued',
    currency: 'XAF',
    issuedDate: '2026-07-10',
    dueDate: '2026-07-25',
    paidDate: null,
    periodStart: '2026-07-10',
    periodEnd: '2026-08-09',
    subtotal: 51800,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 9324,
    total: 61124,
    creditId: null,
    creditApplied: 0,
    amountPaid: 0,
    amountDue: 61124,
    note: 'Paiement par carte en cours de validation.',
    createdAt: '2026-07-10T06:00:00.000Z',
    updatedAt: '2026-08-03T09:30:00.000Z',
  },
  {
    id: '01KB0N3P4Q5R6S7T8U9V1W2X3Y4',
    number: 'NAVIX-2026-000013',
    companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', // Libreville Moves
    subscriptionId: '01JS0K1L2M3N4P5Q6R7S8T9U1V2',
    status: 'paid',
    currency: 'EUR',
    issuedDate: '2026-07-20',
    dueDate: '2026-07-20',
    paidDate: '2026-07-20',
    periodStart: '2026-07-20',
    periodEnd: '2027-07-20',
    subtotal: 2990,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 538.2,
    total: 3528.2,
    creditId: null,
    creditApplied: 0,
    amountPaid: 3528.2,
    amountDue: 0,
    note: 'Renouvellement annuel du plan Enterprise.',
    createdAt: '2026-07-20T06:00:00.000Z',
    updatedAt: '2026-07-20T09:00:00.000Z',
  },
  {
    id: '01KB0P4Q5R6S7T8U9V1W2X3Y4Z5',
    number: 'NAVIX-2026-000014',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // OuagaLogistics
    subscriptionId: '01JS6F7G8H9J0K1L2M3N4P5Q6R7',
    status: 'issued',
    currency: 'XAF',
    issuedDate: '2026-08-05',
    dueDate: '2026-08-20',
    paidDate: null,
    periodStart: '2026-08-05',
    periodEnd: '2026-09-04',
    subtotal: 97700,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 17586,
    total: 115286,
    creditId: null,
    creditApplied: 0,
    amountPaid: 0,
    amountDue: 115286,
    note: 'Renouvellement mensuel du plan Professional.',
    createdAt: '2026-08-05T06:00:00.000Z',
    updatedAt: '2026-08-05T06:00:00.000Z',
  },
  {
    id: '01KB0Q5R6S7T8U9V1W2X3Y4Z5A6',
    number: 'NAVIX-2026-000015',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    subscriptionId: '01JS1A2B3C4D5E6F7G8H9J0K1L2',
    status: 'paid',
    currency: 'XAF',
    issuedDate: '2026-06-05',
    dueDate: '2026-06-20',
    paidDate: '2026-06-10',
    periodStart: '2026-06-01',
    periodEnd: '2026-06-30',
    subtotal: 196000,
    discountId: '01KD0C3D4E5F6G7H8J9K0L1M2N3P4',
    discountAmount: 10000,
    taxRate: 0.18,
    taxAmount: 33480,
    total: 219480,
    creditId: null,
    creditApplied: 0,
    amountPaid: 219480,
    amountDue: 0,
    note: 'Remise corporative REMISE-CORPO appliquée.',
    createdAt: '2026-06-05T06:00:00.000Z',
    updatedAt: '2026-06-10T09:00:00.000Z',
  },
  {
    id: '01KB0R6S7T8U9V1W2X3Y4Z5A6B7',
    number: 'NAVIX-2026-000016',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // OuagaLogistics
    subscriptionId: '01JS6F7G8H9J0K1L2M3N4P5Q6R7',
    status: 'paid',
    currency: 'XAF',
    issuedDate: '2026-06-22',
    dueDate: '2026-07-06',
    paidDate: '2026-06-25',
    periodStart: '2026-06-22',
    periodEnd: '2026-07-21',
    subtotal: 97700,
    discountId: null,
    discountAmount: 0,
    taxRate: 0.18,
    taxAmount: 17586,
    total: 115286,
    creditId: null,
    creditApplied: 0,
    amountPaid: 115286,
    amountDue: 0,
    note: 'Renouvellement mensuel du plan Professional.',
    createdAt: '2026-06-22T07:30:00.000Z',
    updatedAt: '2026-06-25T11:00:00.000Z',
  },
];

export const MOCK_INVOICES_BY_ID = Object.fromEntries(
  MOCK_INVOICES.map((invoice) => [invoice.id, invoice]),
);

/* --------------------------------------------------------------------------
   Lignes de facture (InvoiceItem)
   -------------------------------------------------------------------------- */

export const MOCK_INVOICE_ITEMS = [
  { id: '01KC1A2B3C4D5E6F7G8H9J0K1L2', invoiceId: '01KB0A1B2C3D4E5F6G7H8J9K0L1', kind: 'subscription_renewal', label: 'Abonnement Enterprise — juillet 2026', description: 'Renouvellement mensuel du plan Enterprise (Navix Trans).', quantity: 1, unitPrice: 196000, taxRate: 0.18, amount: 196000 },
  { id: '01KC2B3C4D5E6F7G8H9J0K1L2M3', invoiceId: '01KB0B2C3D4E5F6G7H8J9K0L1M2', kind: 'subscription_renewal', label: 'Abonnement Enterprise — août 2026', description: 'Renouvellement mensuel du plan Enterprise (Navix Trans).', quantity: 1, unitPrice: 196000, taxRate: 0.18, amount: 196000 },
  { id: '01KC3C4D5E6F7G8H9J0K1L2M3N4', invoiceId: '01KB0C3D4E5F6G7H8J9K0L1M2N3', kind: 'subscription_renewal', label: 'Abonnement Business — juillet 2026', description: 'Renouvellement mensuel du plan Business (Trans Express CI).', quantity: 1, unitPrice: 51800, taxRate: 0.18, amount: 51800 },
  { id: '01KC4D5E6F7G8H9J0K1L2M3N4P5', invoiceId: '01KB0D4E5F6G7H8J9K0L1M2N3P4', kind: 'subscription_renewal', label: 'Abonnement Business — juin 2026', description: 'Renouvellement mensuel du plan Business (Trans Express CI).', quantity: 1, unitPrice: 51800, taxRate: 0.18, amount: 51800 },
  { id: '01KC5E6F7G8H9J0K1L2M3N4P5Q6', invoiceId: '01KB0E5F6G7H8J9K0L1M2N3P4Q5', kind: 'subscription_renewal', label: 'Abonnement Starter — premier mois', description: 'Première échéance après la fin de l’essai gratuit (LogiSud).', quantity: 1, unitPrice: 19000, taxRate: 0.18, amount: 19000 },
  { id: '01KC6F7G8H9J0K1L2M3N4P5Q6R7', invoiceId: '01KB0F6G7H8J9K0L1M2N3P4Q5R6', kind: 'subscription_renewal', label: 'Renouvellement annuel — Plan Business', description: 'Engagement annuel du plan Business (SenTrans).', quantity: 1, unitPrice: 790, taxRate: 0.18, amount: 790 },
  { id: '01KC7G8H9J0K1L2M3N4P5Q6R7S8', invoiceId: '01KB0G7H8J9K0L1M2N3P4Q5R6S7', kind: 'subscription_renewal', label: 'Abonnement Starter — juin 2026', description: 'Renouvellement mensuel du plan Starter (Bamakotrans).', quantity: 1, unitPrice: 19000, taxRate: 0.18, amount: 19000 },
  { id: '01KC8H9J0K1L2M3N4P5Q6R7S8T9', invoiceId: '01KB0H8J9K0L1M2N3P4Q5R6S7T8', kind: 'subscription_renewal', label: 'Abonnement Professional — juillet 2026', description: 'Renouvellement mensuel du plan Professional (OuagaLogistics).', quantity: 1, unitPrice: 97700, taxRate: 0.18, amount: 97700 },
  { id: '01KC9J0K1L2M3N4P5Q6R7S8T9U1', invoiceId: '01KB0J9K0L1M2N3P4Q5R6S7T8U9', kind: 'subscription_renewal', label: 'Abonnement Starter — juillet 2026', description: 'Renouvellement mensuel du plan Starter (Bénin Express).', quantity: 1, unitPrice: 19000, taxRate: 0.18, amount: 19000 },
  { id: '01KC0K1L2M3N4P5Q6R7S8T9U1V2', invoiceId: '01KB0K0L1M2N3P4Q5R6S7T8U9V1', kind: 'subscription_renewal', label: 'Abonnement Starter — juin 2026', description: 'Renouvellement mensuel du plan Starter (Bénin Express).', quantity: 1, unitPrice: 19000, taxRate: 0.18, amount: 19000 },
  { id: '01KCA2B3C4D5E6F7G8H9J0K1L2M3', invoiceId: '01KB0L1M2N3P4Q5R6S7T8U9V1W2', kind: 'subscription_renewal', label: 'Abonnement Starter — premier mois', description: 'Première échéance après la fin de l’essai gratuit (LoméTrans).', quantity: 1, unitPrice: 19000, taxRate: 0.18, amount: 19000 },
  { id: '01KCB3C4D5E6F7G8H9J0K1L2M3N4', invoiceId: '01KB0M2N3P4Q5R6S7T8U9V1W2X3', kind: 'subscription_renewal', label: 'Abonnement Business — juillet 2026', description: 'Renouvellement mensuel du plan Business (Douala Cars).', quantity: 1, unitPrice: 51800, taxRate: 0.18, amount: 51800 },
  { id: '01KCC4D5E6F7G8H9J0K1L2M3N4P5', invoiceId: '01KB0N3P4Q5R6S7T8U9V1W2X3Y4', kind: 'subscription_renewal', label: 'Renouvellement annuel — Plan Enterprise', description: 'Engagement annuel du plan Enterprise (Libreville Moves).', quantity: 1, unitPrice: 2990, taxRate: 0.18, amount: 2990 },
  { id: '01KCD5E6F7G8H9J0K1L2M3N4P5Q6', invoiceId: '01KB0P4Q5R6S7T8U9V1W2X3Y4Z5', kind: 'subscription_renewal', label: 'Abonnement Professional — août 2026', description: 'Renouvellement mensuel du plan Professional (OuagaLogistics).', quantity: 1, unitPrice: 97700, taxRate: 0.18, amount: 97700 },
  { id: '01KCE6F7G8H9J0K1L2M3N4P5Q6R7', invoiceId: '01KB0Q5R6S7T8U9V1W2X3Y4Z5A6', kind: 'subscription_renewal', label: 'Abonnement Enterprise — juin 2026', description: 'Renouvellement mensuel du plan Enterprise (Navix Trans).', quantity: 1, unitPrice: 196000, taxRate: 0.18, amount: 196000 },
  { id: '01KCF7G8H9J0K1L2M3N4P5Q6R7S8', invoiceId: '01KB0R6S7T8U9V1W2X3Y4Z5A6B7', kind: 'subscription_renewal', label: 'Abonnement Professional — juin 2026', description: 'Renouvellement mensuel du plan Professional (OuagaLogistics).', quantity: 1, unitPrice: 97700, taxRate: 0.18, amount: 97700 },
];

/* --------------------------------------------------------------------------
   Paiements (Payment) — 100 % simulés
   -------------------------------------------------------------------------- */

export const MOCK_PAYMENTS = [
  { id: '01KM0A1B2C3D4E5F6G7H8J9K0L1', number: 'PAY-2026-000001', invoiceId: '01KB0A1B2C3D4E5F6G7H8J9K0L1', companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', status: 'successful', method: 'bank_transfer', amount: 231280, currency: 'XAF', transactionReference: 'VIR-76912', paymentDate: '2026-07-06', receivedDate: '2026-07-06', failureReason: null, createdAt: '2026-07-06T08:12:00.000Z', updatedAt: '2026-07-06T08:12:00.000Z' },
  { id: '01KM0B2C3D4E5F6G7H8J9K0L1M2', number: 'PAY-2026-000002', invoiceId: '01KB0C3D4E5F6G7H8J9K0L1M2N3', companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', status: 'successful', method: 'mobile_money', amount: 30000, currency: 'XAF', transactionReference: 'MMO-88452', paymentDate: '2026-07-14', receivedDate: '2026-07-14', failureReason: null, createdAt: '2026-07-14T10:00:00.000Z', updatedAt: '2026-07-14T10:00:00.000Z' },
  { id: '01KM0C3D4E5F6G7H8J9K0L1M2N3', number: 'PAY-2026-000003', invoiceId: '01KB0D4E5F6G7H8J9K0L1M2N3P4', companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', status: 'failed', method: 'card', amount: 61124, currency: 'XAF', transactionReference: 'CARD-33571', paymentDate: '2026-07-01', receivedDate: null, failureReason: 'Fonds insuffisants sur la carte.', createdAt: '2026-07-01T09:00:00.000Z', updatedAt: '2026-07-01T09:00:00.000Z' },
  { id: '01KM0D4E5F6G7H8J9K0L1M2N3P4', number: 'PAY-2026-000004', invoiceId: '01KB0F6G7H8J9K0L1M2N3P4Q5R6', companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', status: 'successful', method: 'bank_transfer', amount: 932.2, currency: 'EUR', transactionReference: 'VIR-84210', paymentDate: '2026-07-28', receivedDate: '2026-07-28', failureReason: null, createdAt: '2026-07-28T10:00:00.000Z', updatedAt: '2026-07-28T10:00:00.000Z' },
  { id: '01KM0E5F6G7H8J9K0L1M2N3P4Q5', number: 'PAY-2026-000005', invoiceId: '01KB0G7H8J9K0L1M2N3P4Q5R6S7', companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', status: 'failed', method: 'mobile_money', amount: 22420, currency: 'XAF', transactionReference: 'MMO-91203', paymentDate: '2026-07-11', receivedDate: null, failureReason: 'Paiement refusé — compte Mobile Money bloqué.', createdAt: '2026-07-11T18:00:00.000Z', updatedAt: '2026-07-11T18:00:00.000Z' },
  { id: '01KM0F6G7H8J9K0L1M2N3P4Q5R6', number: 'PAY-2026-000006', invoiceId: '01KB0H8J9K0L1M2N3P4Q5R6S7T8', companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', status: 'successful', method: 'mobile_money', amount: 60000, currency: 'XAF', transactionReference: 'MMO-99014', paymentDate: '2026-07-25', receivedDate: '2026-07-25', failureReason: null, createdAt: '2026-07-25T14:00:00.000Z', updatedAt: '2026-07-25T14:00:00.000Z' },
  { id: '01KM0G7H8J9K0L1M2N3P4Q5R6S7', number: 'PAY-2026-000007', invoiceId: '01KB0K0L1M2N3P4Q5R6S7T8U9V1', companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', status: 'successful', method: 'bank_transfer', amount: 22420, currency: 'XAF', transactionReference: 'VIR-55123', paymentDate: '2026-06-12', receivedDate: '2026-06-12', failureReason: null, createdAt: '2026-06-12T09:00:00.000Z', updatedAt: '2026-06-12T09:00:00.000Z' },
  { id: '01KM0H8J9K0L1M2N3P4Q5R6S7T8', number: 'PAY-2026-000008', invoiceId: '01KB0K0L1M2N3P4Q5R6S7T8U9V1', companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', status: 'refunded', method: 'bank_transfer', amount: 22420, currency: 'XAF', transactionReference: 'RMB-00008', paymentDate: '2026-06-30', receivedDate: '2026-06-30', failureReason: null, refundReason: 'Résiliation de l’abonnement.', createdAt: '2026-06-30T15:00:00.000Z', updatedAt: '2026-06-30T15:00:00.000Z' },
  { id: '01KM0J9K0L1M2N3P4Q5R6S7T8U9', number: 'PAY-2026-000009', invoiceId: '01KB0M2N3P4Q5R6S7T8U9V1W2X3', companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', status: 'processing', method: 'card', amount: 61124, currency: 'XAF', transactionReference: 'CARD-67214', paymentDate: '2026-08-03', receivedDate: null, failureReason: null, createdAt: '2026-08-03T09:30:00.000Z', updatedAt: '2026-08-03T09:30:00.000Z' },
  { id: '01KM0K0L1M2N3P4Q5R6S7T8U9V1', number: 'PAY-2026-000010', invoiceId: '01KB0N3P4Q5R6S7T8U9V1W2X3Y4', companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', status: 'successful', method: 'bank_transfer', amount: 3528.2, currency: 'EUR', transactionReference: 'VIR-90001', paymentDate: '2026-07-20', receivedDate: '2026-07-20', failureReason: null, createdAt: '2026-07-20T09:00:00.000Z', updatedAt: '2026-07-20T09:00:00.000Z' },
  { id: '01KM0L1M2N3P4Q5R6S7T8U9V1W2', number: 'PAY-2026-000011', invoiceId: '01KB0Q5R6S7T8U9V1W2X3Y4Z5A6', companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', status: 'successful', method: 'cash', amount: 219480, currency: 'XAF', transactionReference: 'CSH-00231', paymentDate: '2026-06-10', receivedDate: '2026-06-10', failureReason: null, createdAt: '2026-06-10T09:00:00.000Z', updatedAt: '2026-06-10T09:00:00.000Z' },
  { id: '01KM0M2N3P4Q5R6S7T8U9V1W2X3', number: 'PAY-2026-000012', invoiceId: '01KB0R6S7T8U9V1W2X3Y4Z5A6B7', companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', status: 'successful', method: 'bank_transfer', amount: 115286, currency: 'XAF', transactionReference: 'VIR-44880', paymentDate: '2026-06-25', receivedDate: '2026-06-25', failureReason: null, createdAt: '2026-06-25T11:00:00.000Z', updatedAt: '2026-06-25T11:00:00.000Z' },
  { id: '01KM0N3P4Q5R6S7T8U9V1W2X3Y4', number: 'PAY-2026-000013', invoiceId: '01KB0J9K0L1M2N3P4Q5R6S7T8U9', companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', status: 'cancelled', method: 'card', amount: 22420, currency: 'XAF', transactionReference: 'CARD-10112', paymentDate: '2026-07-09', receivedDate: null, failureReason: 'Tentative annulée par l’utilisateur.', createdAt: '2026-07-09T12:00:00.000Z', updatedAt: '2026-07-09T12:00:00.000Z' },
  { id: '01KM0P4Q5R6S7T8U9V1W2X3Y4Z5', number: 'PAY-2026-000014', invoiceId: '01KB0B2C3D4E5F6G7H8J9K0L1M2', companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', status: 'pending', method: 'bank_transfer', amount: 231280, currency: 'XAF', transactionReference: 'VIR-99877', paymentDate: '2026-08-05', receivedDate: null, failureReason: null, createdAt: '2026-08-05T05:30:00.000Z', updatedAt: '2026-08-05T05:30:00.000Z' },
  { id: '01KM0Q5R6S7T8U9V1W2X3Y4Z5A6', number: 'PAY-2026-000015', invoiceId: '01KB0P4Q5R6S7T8U9V1W2X3Y4Z5', companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', status: 'pending', method: 'mobile_money', amount: 115286, currency: 'XAF', transactionReference: 'MMO-10144', paymentDate: '2026-08-05', receivedDate: null, failureReason: null, createdAt: '2026-08-05T06:00:00.000Z', updatedAt: '2026-08-05T06:00:00.000Z' },
];

/* --------------------------------------------------------------------------
   Crédits de facturation (BillingCredit)
   -------------------------------------------------------------------------- */

export const MOCK_BILLING_CREDITS = [
  { id: '01KC0A1B2C3D4E5F6G7H8J9K0L1', number: 'CRD-2026-000001', companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', status: 'available', amount: 250, balance: 250, currency: 'EUR', reason: 'Surpaiement sur la facture NAVIX-2026-000006.', expiresAt: '2027-01-28', createdAt: '2026-07-29T09:00:00.000Z', updatedAt: '2026-07-29T09:00:00.000Z' },
  { id: '01KC0B2C3D4E5F6G7H8J9K0L1M2', number: 'CRD-2026-000002', companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', status: 'used', amount: 20000, balance: 0, currency: 'XAF', reason: 'Avoir appliqué sur la facture NAVIX-2026-000008.', expiresAt: '2027-01-25', createdAt: '2026-07-25T14:00:00.000Z', updatedAt: '2026-07-25T14:00:00.000Z' },
  { id: '01KC0C3D4E5F6G7H8J9K0L1M2N3', number: 'CRD-2026-000003', companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', status: 'expired', amount: 22420, balance: 22420, currency: 'XAF', reason: 'Avoir issu du remboursement NAVIX-2026-000010 — expiré.', expiresAt: '2026-09-30', createdAt: '2026-06-30T15:00:00.000Z', updatedAt: '2026-07-01T00:00:00.000Z' },
  { id: '01KC0D4E5F6G7H8J9K0L1M2N3P4', number: 'CRD-2026-000004', companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', status: 'available', amount: 100, balance: 100, currency: 'EUR', reason: 'Remise de fidélité pour engagement annuel.', expiresAt: '2027-07-20', createdAt: '2026-07-20T09:00:00.000Z', updatedAt: '2026-07-20T09:00:00.000Z' },
];

/* --------------------------------------------------------------------------
   Remises (BillingDiscount)
   -------------------------------------------------------------------------- */

export const MOCK_BILLING_DISCOUNTS = [
  { id: '01KD0A1B2C3D4E5F6G7H8J9K0L1', code: 'WELCOME10', label: 'Bienvenue — 10 %', type: 'percentage', value: 10, currency: 'EUR', isActive: true, expiresAt: '2026-12-31', createdAt: '2026-01-05T08:00:00.000Z', updatedAt: '2026-01-05T08:00:00.000Z' },
  { id: '01KD0B2C3D4E5F6G7H8J9K0L1M2', code: 'REMISE-CORPO', label: 'Remise corporative', type: 'fixed', value: 10000, currency: 'XAF', isActive: true, expiresAt: '2027-01-01', createdAt: '2026-03-10T08:00:00.000Z', updatedAt: '2026-03-10T08:00:00.000Z' },
  { id: '01KD0C3D4E5F6G7H8J9K0L1M2N3', code: 'ANNIV100', label: 'Promotion anniversaire', type: 'fixed', value: 100, currency: 'EUR', isActive: false, expiresAt: '2026-06-01', createdAt: '2026-05-01T08:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z' },
];

/* --------------------------------------------------------------------------
   Journal de facturation (BillingHistoryEntry)
   -------------------------------------------------------------------------- */

export const MOCK_BILLING_HISTORY = [
  { id: '01KN0A1B2C3D4E5F6G7H8J9K0L1', companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', invoiceId: '01KB0P4Q5R6S7T8U9V1W2X3Y4Z5', type: 'invoice_issued', message: 'Facture NAVIX-2026-000014 émise pour OuagaLogistics.', amount: 115286, currency: 'XAF', createdAt: '2026-08-05T06:00:00.000Z' },
  { id: '01KN0B2C3D4E5F6G7H8J9K0L1M2', companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', invoiceId: '01KB0B2C3D4E5F6G7H8J9K0L1M2', type: 'invoice_issued', message: 'Facture NAVIX-2026-000002 émise pour Navix Trans.', amount: 231280, currency: 'XAF', createdAt: '2026-08-05T05:30:00.000Z' },
  { id: '01KN0C3D4E5F6G7H8J9K0L1M2N3', companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', invoiceId: '01KB0B2C3D4E5F6G7H8J9K0L1M2', type: 'payment_pending', message: 'Paiement en attente de confirmation — virement bancaire (Navix Trans).', amount: 231280, currency: 'XAF', createdAt: '2026-08-05T05:30:00.000Z' },
  { id: '01KN0D4E5F6G7H8J9K0L1M2N3P4', companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', invoiceId: '01KB0M2N3P4Q5R6S7T8U9V1W2X3', type: 'payment_processing', message: 'Paiement en cours de validation — carte bancaire (Douala Cars).', amount: 61124, currency: 'XAF', createdAt: '2026-08-03T09:30:00.000Z' },
  { id: '01KN0E5F6G7H8J9K0L1M2N3P4Q5', companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', invoiceId: '01KB0N3P4Q5R6S7T8U9V1W2X3Y4', type: 'payment_received', message: 'Paiement reçu — 3 528,20 € (Libreville Moves).', amount: 3528.2, currency: 'EUR', createdAt: '2026-07-20T09:00:00.000Z' },
  { id: '01KN0F6G7H8J9K0L1M2N3P4Q5R6', companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', invoiceId: '01KB0F6G7H8J9K0L1M2N3P4Q5R6', type: 'payment_received', message: 'Paiement reçu — 932,20 € (SenTrans).', amount: 932.2, currency: 'EUR', createdAt: '2026-07-28T10:00:00.000Z' },
  { id: '01KN0G7H8J9K0L1M2N3P4Q5R6S7', companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', invoiceId: '01KB0H8J9K0L1M2N3P4Q5R6S7T8', type: 'credit_applied', message: 'Avoir de 20 000 FCFA appliqué sur la facture NAVIX-2026-000008.', amount: 20000, currency: 'XAF', createdAt: '2026-07-25T14:00:00.000Z' },
  { id: '01KN0H8J9K0L1M2N3P4Q5R6S7T8', companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', invoiceId: '01KB0H8J9K0L1M2N3P4Q5R6S7T8', type: 'payment_received', message: 'Paiement Mobile Money reçu — 60 000 FCFA (OuagaLogistics).', amount: 60000, currency: 'XAF', createdAt: '2026-07-25T14:00:00.000Z' },
  { id: '01KN0J9K0L1M2N3P4Q5R6S7T8U9', companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', invoiceId: '01KB0G7H8J9K0L1M2N3P4Q5R6S7', type: 'invoice_overdue', message: 'Facture NAVIX-2026-000007 en retard (Bamakotrans).', amount: 22420, currency: 'XAF', createdAt: '2026-07-11T18:00:00.000Z' },
  { id: '01KN0K0L1M2N3P4Q5R6S7T8U9V1', companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', invoiceId: '01KB0G7H8J9K0L1M2N3P4Q5R6S7', type: 'payment_failed', message: 'Paiement Mobile Money échoué — 22 420 FCFA (Bamakotrans).', amount: 22420, currency: 'XAF', createdAt: '2026-07-11T18:00:00.000Z' },
  { id: '01KN0L1M2N3P4Q5R6S7T8U9V1W2', companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', invoiceId: '01KB0M2N3P4Q5R6S7T8U9V1W2X3', type: 'invoice_issued', message: 'Facture NAVIX-2026-000012 émise pour Douala Cars.', amount: 61124, currency: 'XAF', createdAt: '2026-07-10T06:00:00.000Z' },
  { id: '01KN0M2N3P4Q5R6S7T8U9V1W2X3', companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', invoiceId: '01KB0J9K0L1M2N3P4Q5R6S7T8U9', type: 'invoice_cancelled', message: 'Facture NAVIX-2026-000009 annulée (Bénin Express).', amount: 22420, currency: 'XAF', createdAt: '2026-07-09T12:00:00.000Z' },
  { id: '01KN0N3P4Q5R6S7T8U9V1W2X3Y4', companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', invoiceId: '01KB0A1B2C3D4E5F6G7H8J9K0L1', type: 'payment_received', message: 'Paiement reçu — 231 280 FCFA (Navix Trans).', amount: 231280, currency: 'XAF', createdAt: '2026-07-06T08:12:00.000Z' },
  { id: '01KN0P4Q5R6S7T8U9V1W2X3Y4Z5', companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', invoiceId: '01KB0K0L1M2N3P4Q5R6S7T8U9V1', type: 'refund_issued', message: 'Remboursement intégral émis — 22 420 FCFA (Bénin Express).', amount: 22420, currency: 'XAF', createdAt: '2026-06-30T15:00:00.000Z' },
  { id: '01KN0Q5R6S7T8U9V1W2X3Y4Z5A6', companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', invoiceId: '01KB0Q5R6S7T8U9V1W2X3Y4Z5A6', type: 'discount_applied', message: 'Remise REMISE-CORPO appliquée sur NAVIX-2026-000015.', amount: 10000, currency: 'XAF', createdAt: '2026-06-10T09:00:00.000Z' },
  { id: '01KN0R6S7T8U9V1W2X3Y4Z5A6B7', companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', invoiceId: '01KB0D4E5F6G7H8J9K0L1M2N3P4', type: 'invoice_overdue', message: 'Facture NAVIX-2026-000004 en retard (Trans Express CI).', amount: 61124, currency: 'XAF', createdAt: '2026-06-16T08:00:00.000Z' },
];

/* --------------------------------------------------------------------------
   Paramètres de facturation (BillingSettings)
   -------------------------------------------------------------------------- */

export const MOCK_BILLING_SETTINGS = {
  id: '01KF0S0T1U2V3W4X5Y6Z7A8B9C0D1',
  defaultCurrency: 'EUR',
  paymentTermsDays: 15,
  defaultTaxRate: 0.18,
  allowPartialPayments: true,
  invoicePrefix: 'NAVIX',
  nextInvoiceNumber: 17,
  nextPaymentNumber: 16,
  autoReminders: { enabled: true, daysBeforeDue: 3 },
  defaultPaymentMethods: ['bank_transfer', 'mobile_money', 'card', 'cash'],
  companyInfo: {
    legalName: 'Navix SAS',
    taxId: 'RCCM-CI-ABJ-2024-B12345',
    address: 'Cocody, Riviera Golf 3 — Abidjan, Côte d’Ivoire',
    email: 'billing@navix.app',
    phone: '+225 27 22 48 19 00',
    website: 'https://navix.app',
  },
  updatedAt: '2026-08-01T09:00:00.000Z',
};

/* --------------------------------------------------------------------------
   Références croisées (documentation de cohérence multi-tenant)
   -------------------------------------------------------------------------- */

/** Carte entreprise → nom, réutilisée par les composants du module. */
export const MOCK_BILLING_COMPANY_NAMES = Object.fromEntries(
  MOCK_COMPANIES.map((company) => [company.id, company.name]),
);

/** Documente la cohérence entre les factures et les entreprises. */
export const MOCK_BILLING_COMPANY_REFERENCE = Object.fromEntries(
  MOCK_INVOICES.map((invoice) => [invoice.id, companyName(invoice.companyId)]),
);

/** Documente la cohérence entre les factures et les abonnements SaaS. */
export const MOCK_BILLING_SUBSCRIPTION_REFERENCE = Object.fromEntries(
  MOCK_INVOICES.map((invoice) => [
    invoice.id,
    MOCK_SUBSCRIPTIONS.find((subscription) => subscription.id === invoice.subscriptionId)?.planId ?? null,
  ]),
);
