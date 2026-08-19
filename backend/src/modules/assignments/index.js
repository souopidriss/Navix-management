export const ASSIGNMENT_TYPES = ['permanent', 'temporary', 'mission', 'replacement', 'maintenance', 'trial'];
export const ASSIGNMENT_STATUSES = ['planned', 'active', 'completed', 'cancelled', 'suspended'];

export const VALID_STATUS_TRANSITIONS = {
  planned: ['active', 'cancelled'],
  active: ['completed', 'suspended', 'cancelled'],
  suspended: ['active', 'cancelled', 'completed'],
  cancelled: [],
  completed: [],
};
