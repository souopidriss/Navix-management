export const FUEL_TYPES = ['diesel', 'essence', 'hybride', 'electrique'];

export const FUEL_STATUSES = ['pending', 'validated', 'cancelled'];

export const PAYMENT_METHODS = ['cash', 'card', 'fuel_card', 'bank_transfer', 'company_account'];

export const VALID_STATUS_TRANSITIONS = {
  pending: ['validated', 'cancelled'],
  validated: ['cancelled'],
  cancelled: [],
};
