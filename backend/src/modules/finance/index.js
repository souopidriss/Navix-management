export const TRANSACTION_TYPES = [
  'deposit', 'withdrawal', 'transfer', 'payment',
  'refund', 'commission', 'fee', 'adjustment',
  'income', 'expense', 'transfer_in', 'transfer_out',
];

export const TRANSACTION_TYPE_DIRECTIONS = {
  deposit: 'in',
  withdrawal: 'out',
  transfer: 'out',
  transfer_in: 'in',
  transfer_out: 'out',
  payment: 'out',
  refund: 'in',
  commission: 'in',
  fee: 'out',
  adjustment: 'out',
  income: 'in',
  expense: 'out',
};

export const TRANSACTION_STATUSES = ['pending', 'completed', 'failed', 'cancelled', 'reversed', 'success'];

export const TRANSACTION_DIRECTIONS = ['in', 'out'];

export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'mobile_money', 'cheque', 'other'];

export const INVOICE_STATUSES = ['draft', 'issued', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded'];

export const INVOICE_STATUS_TRANSITIONS = {
  draft: ['issued', 'cancelled'],
  issued: ['sent', 'paid', 'partially_paid', 'overdue', 'cancelled'],
  sent: ['paid', 'partially_paid', 'overdue', 'cancelled'],
  paid: ['refunded'],
  partially_paid: ['paid', 'overdue', 'cancelled'],
  overdue: ['paid', 'cancelled'],
  cancelled: [],
  refunded: [],
};

export const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

export const ACCOUNT_TYPES = ['main', 'savings', 'operating', 'petty_cash', 'escrow'];

export const FINANCIAL_PERIODS = ['today', 'week', 'month', 'quarter', 'year', 'custom'];

export const INVOICE_PREFIX = 'INV';

export const DEFAULT_CURRENCY = 'XAF';

export const SENSITIVE_FINANCIAL_KEYS = ['amount', 'balance', 'balance_before', 'balance_after', 'total'];
