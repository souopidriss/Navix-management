export const BILLING_INVOICE_STATUSES = [
  'draft', 'issued', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded',
];

export const BILLING_PAYMENT_STATUSES = [
  'pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded',
];

export const BILLING_PAYMENT_METHODS = [
  'bank_transfer', 'mobile_money', 'card', 'cash', 'other',
];

export const BILLING_HISTORY_TYPES = [
  'invoice_created', 'invoice_issued', 'invoice_cancelled', 'invoice_overdue',
  'payment_pending', 'payment_processing', 'payment_received', 'payment_failed',
  'credit_applied', 'discount_applied', 'refund_issued',
];

export const BILLING_ITEM_KINDS = [
  'subscription_renewal', 'setup', 'usage', 'addon', 'credit_note',
];
