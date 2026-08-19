export const MAINTENANCE_TYPES = [
  'vidange', 'revision', 'controle_technique', 'freinage', 'pneumatiques',
  'batterie', 'moteur', 'transmission', 'suspension', 'climatisation',
  'carrosserie', 'reparation', 'inspection', 'autre',
];

export const MAINTENANCE_STATUSES = ['planned', 'pending', 'in_progress', 'completed', 'cancelled'];

export const MAINTENANCE_PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export const VALID_STATUS_TRANSITIONS = {
  planned: ['pending', 'in_progress', 'cancelled'],
  pending: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const FINISHED_STATUSES = ['completed', 'cancelled'];
export const IMMOBILIZING_STATUSES = ['in_progress'];
export const DEFAULT_CURRENCY = 'XAF';
