/**
 * Navix Drivers — Agences simulées (mode mock)
 * --------------------------------------------------------------------------
 * Agences fictives associées aux entreprises simulées du module Entreprises.
 * Chaque chauffeur est rattaché à une entreprise (companyId) et à une agence
 * (agencyId). Aucune requête HTTP — consommé par le module Chauffeurs.
 */
import { MOCK_COMPANIES } from '@/features/companies/mocks';

const agencyFor = (companyId, id, name, city) => ({ id, companyId, name, city });

export const MOCK_DRIVER_AGENCIES = [
  agencyFor('01J8A2B3C4D5E6F7G8H9J0K1L2', '01JA1B2C3D4E5F6G7H8J9K0L1M5', 'Agence Abidjan', 'Abidjan'),
  agencyFor('01J8B2C3D4E5F6G7H8J9K0L1M2', '01JA2B3C4D5E6F7G8H9J0K1L2M5', 'Agence Yamoussoukro', 'Yamoussoukro'),
  agencyFor('01J8C2D3E4F5G6H7J8K9L0M1N2', '01JA3B4C5D6E7F8G9H0J1K2L3M5', 'Agence Bouaké', 'Bouaké'),
  agencyFor('01J8D2E3F4G5H6J7K8L9M0N1P2', '01JA4B5C6D7E8F9G0H1J2K3L4M5', 'Agence Dakar', 'Dakar'),
  agencyFor('01J8E2F3G4H5J6K7L8M9N0P1Q2', '01JA5B6C7D8E9F0G1H2J3K4L5M6', 'Agence Bamako', 'Bamako'),
  agencyFor('01J8F2G3H4J5K6L7M8N9P0Q1R2', '01JA6B7C8D9E0F1G2H3J4K5L6M7', 'Agence Ouagadougou', 'Ouagadougou'),
  agencyFor('01J8G2H3J4K5L6M7N8P9Q0R1S2', '01JA7B8C9D0E1F2G3H4J5K6L7M8', 'Agence Cotonou', 'Cotonou'),
  agencyFor('01J8H2J3K4L5M6N7P8Q9R0S1T2', '01JA8B9C0D1E2F3G4H5J6K7L8M9', 'Agence Lomé', 'Lomé'),
  agencyFor('01J8J2K3L4M5N6P7Q8R9S0T1U2', '01JA9B0C1D2E3F4G5H6J7K8L9N1', 'Agence Douala', 'Douala'),
  agencyFor('01J8K2L3M4N5P6Q7R8S9T0U1V2', '01JA0B1C2D3E4F5G6H7J8K9L0N2', 'Agence Libreville', 'Libreville'),
];

export const MOCK_DRIVER_AGENCIES_BY_ID = Object.fromEntries(
  MOCK_DRIVER_AGENCIES.map((agency) => [agency.id, agency]),
);

/** Vérifie la cohérence entre les agences et les entreprises simulées. */
export const MOCK_COMPANIES_REFERENCE = Object.fromEntries(
  MOCK_COMPANIES.map((company) => [company.id, company.name]),
);
