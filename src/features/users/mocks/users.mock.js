/**
 * Navix Users — Utilisateurs simulés (mode mock)
 * --------------------------------------------------------------------------
 * 30 utilisateurs fictifs au format métier complet : id, companyId, agencyId,
 * firstName, lastName, fullName, email, phone, avatar (initiales), jobTitle,
 * status, roleIds (un utilisateur peut avoir plusieurs rôles), lastLoginAt,
 * createdAt, updatedAt.
 *
 * Cohérence :
 *   - les identifiants usr_001 → usr_015 reprennent exactement les profils du
 *     module Audit Log (AUDIT_USERS) — l'« acteur » d'un log et la fiche
 *     utilisateur restent cohérents ;
 *   - companyId / agencyId référencent les mocks Entreprises et Agences ;
 *   - roleIds référencent les rôles de roles.mock.js ;
 *   - chaque entreprise possède plusieurs utilisateurs, plusieurs statuts
 *     (active, inactive, suspended, pending, invited) et plusieurs profils.
 *
 * Aucune requête HTTP — consommé par userService (mode mock).
 */

const CO = {
  NAVIX: '01J8A2B3C4D5E6F7G8H9J0K1L2',
  TRX: '01J8B2C3D4E5F6G7H8J9K0L1M2',
  LOGISUD: '01J8C2D3E4F5G6H7J8K9L0M1N2',
  SEN: '01J8D2E3F4G5H6J7K8L9M0N1P2',
  BKO: '01J8E2F3G4H5J6K7L8M9N0P1Q2',
  OGA: '01J8F2G3H4J5K6L7M8N9P0Q1R2',
  BEN: '01J8G2H3J4K5L6M7N8P9Q0R1S2',
  LOME: '01J8H2J3K4L5M6N7P8Q9R0S1T2',
  DLA: '01J8J2K3L4M5N6P7Q8R9S0T1U2',
  LBV: '01J8K2L3M4N5P6Q7R8S9T0U1V2',
};

const AG = {
  ABJ: '01JA1B2C3D4E5F6G7H8J9K0L1M5',
  SIE: '01JB1C2D3E4F5G6H7J8K9L0M1N2P3',
  DEP: '01JB2C3D4E5F6G7H8J9K0L1M2N3P4',
  YAM: '01JA2B3C4D5E6F7G8H9J0K1L2M5',
  BKA: '01JA3B4C5D6E7F8G9H0J1K2L3M5',
  DKR: '01JA4B5C6D7E8F9G0H1J2K3L4M5',
  BKO: '01JA5B6C7D8E9F0G1H2J3K4L5M6',
  OUA: '01JA6B7C8D9E0F1G2H3J4K5L6M7',
  CTA: '01JA7B8C9D0E1F2G3H4J5K6L7M8',
  LOM: '01JA8B9C0D1E2F3G4H5J6K7L8M9',
  DLA: '01JA9B0C1D2E3F4G5H6J7K8L9N1',
  LBV: '01JA0B1C2D3E4F5G6H7J8K9L0N2',
  ATL: '01JB4C5D6E7F8G9H0J1K2L3M4N5P6',
};

const u = (
  id,
  companyId,
  agencyId,
  firstName,
  lastName,
  jobTitle,
  status,
  roleIds,
  lastLoginAt,
  createdAt,
) => ({
  id,
  companyId,
  agencyId,
  firstName,
  lastName,
  fullName: `${firstName} ${lastName}`,
  email: `${firstName.toLowerCase().replace(/[^a-z]/g, '.')}.${lastName.toLowerCase().replace(/[^a-z]/g, '.')}@navix.app`,
  phone: `+225 07 ${String(10 + (id.length % 80)).padStart(2, '0')} ${String(10 + (id.length % 70)).padStart(2, '0')} ${String(10 + (id.length % 60)).padStart(2, '0')}`,
  avatar: `${firstName[0]}${lastName[0]}`.toUpperCase(),
  jobTitle,
  status,
  roleIds,
  lastLoginAt,
  createdAt,
  updatedAt: createdAt,
});

export const MOCK_USERS = [
  /* Navix Trans — entreprise de démonstration (7 profils) */
  u('usr_001', CO.NAVIX, AG.SIE, 'Awa', 'Kouamé', 'Super Administrateur', 'active', ['role_super_admin'], '2026-08-05T08:42:00.000Z', '2025-10-02T08:00:00.000Z'),
  u('usr_011', CO.NAVIX, AG.ABJ, 'Yao', 'N’Guessan', 'Gestionnaire de flotte', 'active', ['role_fleet_manager'], '2026-08-05T07:15:00.000Z', '2025-11-12T08:00:00.000Z'),
  u('usr_012', CO.NAVIX, AG.SIE, 'Jean', 'Kouassi', 'Comptable', 'active', ['role_accountant'], '2026-08-04T16:20:00.000Z', '2025-11-20T08:00:00.000Z'),
  u('usr_016', CO.NAVIX, AG.ABJ, 'Aminata', 'Kourouma', 'Opératrice de flotte', 'active', ['role_fleet_operator'], '2026-08-05T06:50:00.000Z', '2026-01-08T08:00:00.000Z'),
  u('usr_017', CO.NAVIX, AG.ABJ, 'Serge', 'N’Dri', 'Chauffeur', 'active', ['role_driver'], '2026-08-04T05:10:00.000Z', '2026-01-15T08:00:00.000Z'),
  u('usr_018', CO.NAVIX, AG.DEP, 'Pauline', 'Abé', 'Responsable maintenance', 'active', ['role_maintenance_manager'], '2026-08-03T14:00:00.000Z', '2026-02-01T08:00:00.000Z'),
  u('usr_020', CO.NAVIX, AG.SIE, 'Salimata', 'Bamba', 'Responsable RH', 'active', ['role_hr_manager', 'role_viewer'], '2026-08-05T09:05:00.000Z', '2026-02-14T08:00:00.000Z'),
  u('usr_021', CO.NAVIX, AG.SIE, 'Jean-Marc', 'Tia', 'Répartiteur', 'active', ['role_dispatcher'], '2026-08-05T07:40:00.000Z', '2026-03-03T08:00:00.000Z'),
  u('usr_019', CO.NAVIX, AG.ABJ, 'Didier', 'Koffi', 'Consultant', 'invited', ['role_viewer'], null, '2026-07-28T10:00:00.000Z'),
  u('usr_022', CO.NAVIX, AG.ABJ, 'Kader', 'Ouattara', 'Chauffeur', 'suspended', ['role_driver'], '2026-07-21T12:30:00.000Z', '2026-03-20T08:00:00.000Z'),

  /* Trans Express CI */
  u('usr_002', CO.TRX, AG.YAM, 'Ibrahim', 'Traoré', 'Propriétaire', 'active', ['role_company_admin'], '2026-08-05T08:10:00.000Z', '2025-10-05T08:00:00.000Z'),
  u('usr_013', CO.TRX, AG.YAM, 'Moussa', 'Koné', 'Gestionnaire de flotte', 'inactive', ['role_fleet_manager'], '2026-05-18T09:00:00.000Z', '2025-11-22T08:00:00.000Z'),
  u('usr_023', CO.TRX, AG.YAM, 'Adama', 'Traoré', 'Opérateur de flotte', 'pending', ['role_fleet_operator'], null, '2026-07-30T09:00:00.000Z'),
  u('usr_024', CO.TRX, AG.YAM, 'Fatoumata', 'Diabaté', 'Comptable', 'active', ['role_accountant'], '2026-08-04T15:00:00.000Z', '2026-02-02T08:00:00.000Z'),
  u('usr_025', CO.TRX, AG.YAM, 'Issa', 'Kébé', 'Chauffeur', 'active', ['role_driver'], '2026-08-05T05:55:00.000Z', '2026-02-18T08:00:00.000Z'),
  u('usr_026', CO.TRX, AG.YAM, 'Moussa', 'Doumbia', 'Responsable exploitation', 'active', ['role_ops_manager'], '2026-08-05T07:05:00.000Z', '2026-03-06T08:00:00.000Z'),

  /* LogiSud */
  u('usr_003', CO.LOGISUD, AG.BKA, 'Mariam', 'Koné', 'Administratrice', 'active', ['role_company_admin'], '2026-08-04T10:30:00.000Z', '2025-10-08T08:00:00.000Z'),
  u('usr_027', CO.LOGISUD, AG.BKA, 'Yacouba', 'Konaté', 'Opérateur de flotte', 'invited', ['role_fleet_operator'], null, '2026-07-26T09:00:00.000Z'),

  /* SenTrans */
  u('usr_004', CO.SEN, AG.DKR, 'Ousmane', 'Diallo', 'Propriétaire', 'active', ['role_company_admin'], '2026-08-05T08:30:00.000Z', '2025-10-10T08:00:00.000Z'),
  u('usr_015', CO.SEN, AG.DKR, 'Aïcha', 'Diallo', 'Comptable', 'active', ['role_accountant'], '2026-08-04T17:00:00.000Z', '2026-01-05T08:00:00.000Z'),
  u('usr_028', CO.SEN, AG.DKR, 'Mame', 'Diarra', 'Chauffeur', 'active', ['role_driver'], '2026-08-05T06:10:00.000Z', '2026-02-25T08:00:00.000Z'),

  /* Bamakotrans */
  u('usr_005', CO.BKO, AG.BKO, 'Seydou', 'Coulibaly', 'Propriétaire', 'active', ['role_company_admin'], '2026-08-03T11:00:00.000Z', '2025-10-12T08:00:00.000Z'),
  u('usr_029', CO.BKO, AG.BKO, 'Souleymane', 'Keita', 'Responsable maintenance', 'active', ['role_maintenance_manager'], '2026-08-04T13:00:00.000Z', '2026-03-10T08:00:00.000Z'),

  /* OuagaLogistics */
  u('usr_006', CO.OGA, AG.OUA, 'Fatou', 'Sawadogo', 'Propriétaire', 'active', ['role_company_admin'], '2026-08-05T08:05:00.000Z', '2025-10-15T08:00:00.000Z'),
  u('usr_014', CO.OGA, AG.OUA, 'Rasmata', 'Ouédraogo', 'Administratrice', 'suspended', ['role_company_admin'], '2026-06-30T09:00:00.000Z', '2026-01-10T08:00:00.000Z'),

  /* Bénin Express */
  u('usr_007', CO.BEN, AG.CTA, 'Koffi', 'Ahouansou', 'Propriétaire', 'active', ['role_company_admin'], '2026-08-04T09:30:00.000Z', '2025-10-18T08:00:00.000Z'),

  /* LoméTrans */
  u('usr_008', CO.LOME, AG.LOM, 'Abla', 'Mensah', 'Propriétaire', 'active', ['role_company_admin'], '2026-08-03T15:00:00.000Z', '2025-10-20T08:00:00.000Z'),

  /* Douala Cars */
  u('usr_009', CO.DLA, AG.DLA, 'Estelle', 'Ngono', 'Propriétaire', 'active', ['role_company_admin'], '2026-08-05T08:00:00.000Z', '2025-10-22T08:00:00.000Z'),

  /* Libreville Moves */
  u('usr_010', CO.LBV, AG.LBV, 'Charles', 'Mba', 'Propriétaire', 'inactive', ['role_company_admin'], '2026-04-12T09:00:00.000Z', '2025-10-25T08:00:00.000Z'),
  u('usr_030', CO.LBV, AG.LBV, 'Prisca', 'Okemba', 'Gestionnaire de flotte', 'pending', ['role_fleet_manager'], null, '2026-07-29T09:00:00.000Z'),
];

/** Recherche un utilisateur par identifiant. */
export const getUserById = (id) => MOCK_USERS.find((user) => user.id === id) ?? null;

/** Utilisateurs d'une entreprise (bornés au tenant). */
export const getUsersByCompany = (companyId) =>
  companyId ? MOCK_USERS.filter((user) => user.companyId === companyId) : MOCK_USERS;

/** Utilisateurs actifs uniquement (pour les sélecteurs). */
export const getActiveUsers = (companyId) =>
  getUsersByCompany(companyId).filter((user) => user.status === 'active');
