export const DOCUMENT_VISIBILITY = ['public', 'private', 'restricted'];

export const ASSOCIATION_TYPES = ['company', 'vehicle', 'driver', 'maintenance', 'trip', 'fuel', 'user'];

export const RESOURCE_CATEGORIES = {
  vehicle: ['carte_grise', 'assurance', 'visite_technique', 'certificat_conformite', 'contrat', 'photo', 'autre'],
  driver: ['permis', 'piece_identite', 'contrat', 'certificat', 'photo', 'autre'],
  maintenance: ['facture', 'devis', 'rapport', 'bon_reparation', 'photo', 'autre'],
  company: ['administratif', 'contrat', 'facture', 'certificat', 'autre'],
  trip: ['bon_de_route', 'rapport', 'photo', 'autre'],
  fuel: ['bon_de_cuve', 'facture', 'rapport', 'autre'],
  user: ['piece_identite', 'photo', 'contrat', 'certificat', 'autre'],
};

export const FILE_TYPE_IN_USE = 'FILE_TYPE_IN_USE';
export const DOCUMENT_FINAL_LOCKED = 'DOCUMENT_FINAL_LOCKED';
