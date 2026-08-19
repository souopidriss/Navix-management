export const TRIP_TYPES = ['mission', 'delivery', 'transport', 'service', 'maintenance', 'personnel', 'trial'];
export const TRIP_STATUSES = ['planned', 'in_progress', 'completed', 'cancelled', 'suspended'];

export const VALID_STATUS_TRANSITIONS = {
  planned: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'suspended', 'cancelled'],
  suspended: ['in_progress', 'completed'],
  completed: [],
  cancelled: [],
};
