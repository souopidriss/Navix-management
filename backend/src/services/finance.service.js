import financialAccountRepository from '../repositories/FinancialAccountRepository.js';
import financialTransactionRepository from '../repositories/FinancialTransactionRepository.js';
import { getPool } from '../database/index.js';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/index.js';
import { TRANSACTION_TYPE_DIRECTIONS } from '../modules/finance/index.js';
import { recordAudit } from './audit.service.js';

function directionOfType(type) {
  return TRANSACTION_TYPE_DIRECTIONS[type] || 'out';
}

function formatAccountResponse(row) {
  if (!row) return null;
  return {
    walletId: row.id,
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    accountType: row.account_type,
    balance: Number(row.balance) || 0,
    currency: row.currency,
    totalIn: Number(row.total_in) || 0,
    totalOut: Number(row.total_out) || 0,
    status: row.status,
    description: row.description || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatTransactionResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    reference: row.reference || '',
    companyId: row.company_id,
    accountId: row.account_id,
    type: row.transaction_type,
    label: row.label || row.description || '',
    description: row.description || '',
    amount: Number(row.amount) || 0,
    currency: row.currency || 'XAF',
    direction: row.direction || directionOfType(row.transaction_type),
    status: row.status,
    source: row.source || '',
    destination: row.destination || null,
    counterparty: row.counterparty || '',
    method: row.method || '',
    balanceBefore: Number(row.balance_before) || 0,
    balanceAfter: Number(row.balance_after) || 0,
    category: row.category || '',
    entityType: row.entity_type || null,
    entityId: row.entity_id || null,
    metadata: row.metadata_json ? (typeof row.metadata_json === 'string' ? JSON.parse(row.metadata_json) : row.metadata_json) : {},
    createdBy: row.created_by || '',
    createdAt: row.transaction_date || row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureDefaultAccount(companyId) {
  let account = await financialAccountRepository.getDefaultAccount(companyId);
  if (!account) {
    account = await financialAccountRepository.createDefaultAccount(companyId);
  }
  return account;
}

export async function getWallet(companyId) {
  const account = await ensureDefaultAccount(companyId);
  return formatAccountResponse(account);
}

export async function getBalance(companyId) {
  const account = await ensureDefaultAccount(companyId);
  return Number(account.balance) || 0;
}

export async function getStatistics(companyId, { dateFrom, dateTo } = {}) {
  const account = await ensureDefaultAccount(companyId);
  const stats = await financialTransactionRepository.getStatistics(companyId, { dateFrom, dateTo });
  const evolution = await financialTransactionRepository.getMonthlyEvolution(companyId, 6);

  return {
    walletId: account.id,
    balance: Number(account.balance) || 0,
    currency: account.currency || 'XAF',
    totalIn: Number(account.total_in) || 0,
    totalOut: Number(account.total_out) || 0,
    updatedAt: account.updated_at,
    ...stats,
    monthlyEvolution: evolution,
  };
}

export async function getFinancialSummary(companyId) {
  const account = await ensureDefaultAccount(companyId);
  const stats = await financialTransactionRepository.getStatistics(companyId);
  const recentTransactions = await financialTransactionRepository.findByCompanyIdWithDetails(companyId, {
    page: 1,
    limit: 5,
    sort: 'transaction_date',
    order: 'DESC',
  });

  return {
    balance: Number(account.balance) || 0,
    currency: account.currency || 'XAF',
    incomeMonth: stats.incomeMonth,
    expenseMonth: stats.expenseMonth,
    variationMonth: stats.incomeMonth - stats.expenseMonth,
    totalIncome: stats.totalIncome,
    totalExpense: stats.totalExpense,
    transactionsCount: stats.transactionCount,
    transactionsMonth: stats.transactionsMonth,
    pendingCount: stats.pendingCount,
    recentTransactions: recentTransactions.rows.map(formatTransactionResponse),
  };
}

export async function listTransactions(companyId, query) {
  const result = await financialTransactionRepository.findByCompanyIdWithDetails(companyId, query);
  return {
    data: result.rows.map(formatTransactionResponse),
    pagination: {
      total: result.total,
      page: query.page || 1,
      limit: query.limit || 20,
      totalPages: Math.ceil(result.total / (query.limit || 20)),
    },
  };
}

export async function getTransactionById(id, companyId) {
  const tx = await financialTransactionRepository.findById(id);
  if (!tx || tx.company_id !== companyId) {
    throw new NotFoundError('Transaction');
  }
  return formatTransactionResponse(tx);
}

export async function createTransaction(payload, { companyId, userId }) {
  const account = await ensureDefaultAccount(companyId);

  const direction = payload.direction || directionOfType(payload.type);
  const amount = Number(payload.amount);
  const balance = Number(account.balance) || 0;

  if (direction === 'out' && amount > balance) {
    throw new BadRequestError('Solde insuffisant pour effectuer cette opération.', {
      available: balance,
      required: amount,
    });
  }

  const balanceBefore = balance;
  const balanceAfter = direction === 'in' ? balance + amount : balance - amount;

  const reference = await financialTransactionRepository.getNextReference(companyId);

  const { generateId } = await import('../utils/id.js');
  const id = generateId();

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO financial_transactions
        (id, company_id, account_id, transaction_type, direction, status, amount, currency,
         balance_before, balance_after, reference, label, description, source, destination,
         counterparty, method, category, entity_type, entity_id, metadata_json, created_by,
         transaction_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'completed', ?, 'XAF', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        id, companyId, account.id, payload.type, direction, amount,
        balanceBefore, balanceAfter, reference,
        payload.label || payload.description || '',
        payload.description || '',
        payload.source || '', payload.destination || null,
        payload.counterparty || '', payload.method || 'other',
        payload.category || payload.type,
        payload.entityType || null, payload.entityId || null,
        payload.metadata ? JSON.stringify(payload.metadata) : null,
        userId,
      ]
    );

    await financialAccountRepository.updateBalance(account.id, direction === 'in' ? amount : -amount, conn);

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const tx = await financialTransactionRepository.findById(id);
  recordAudit({
    companyId, userId,
    action: 'transaction.create',
    actionType: 'CREATE',
    entityType: 'transaction',
    entityId: id,
    description: `Transaction ${reference} créée: ${payload.type} ${amount} XAF`,
    newValues: { type: payload.type, amount, direction, reference },
  }).catch(() => {});

  return formatTransactionResponse(tx);
}

export async function reverseTransaction(id, { companyId, userId }) {
  const target = await financialTransactionRepository.findById(id);
  if (!target || target.company_id !== companyId) {
    throw new NotFoundError('Transaction');
  }

  if (target.status !== 'completed' && target.status !== 'success') {
    throw new BadRequestError('Seules les transactions réussies peuvent être annulées.');
  }

  const existingReversal = await financialTransactionRepository.queryOne(
    `SELECT id FROM financial_transactions WHERE entity_type = 'transaction' AND entity_id = ? AND transaction_type = 'refund' AND status IN ('completed', 'success')`,
    [id]
  );
  if (existingReversal) {
    throw new ConflictError('Cette transaction a déjà été annulée.');
  }

  const account = await ensureDefaultAccount(companyId);
  const amount = Number(target.amount);
  const reverseDirection = target.direction === 'in' ? 'out' : 'in';
  const balance = Number(account.balance) || 0;

  if (reverseDirection === 'out' && amount > balance) {
    throw new BadRequestError('Solde insuffisant pour effectuer cette opération.', {
      available: balance,
      required: amount,
    });
  }

  const balanceBefore = balance;
  const balanceAfter = reverseDirection === 'in' ? balance + amount : balance - amount;
  const reference = await financialTransactionRepository.getNextReference(companyId);
  const { generateId } = await import('../utils/id.js');
  const newId = generateId();

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO financial_transactions
        (id, company_id, account_id, transaction_type, direction, status, amount, currency,
         balance_before, balance_after, reference, label, description, source, destination,
         counterparty, method, category, entity_type, entity_id, metadata_json, created_by,
         transaction_date, created_at, updated_at)
       VALUES (?, ?, ?, 'refund', ?, 'completed', ?, 'XAF', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'refund', 'transaction', ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        newId, companyId, account.id, reverseDirection, amount,
        balanceBefore, balanceAfter, reference,
        `Annulation de ${target.reference}`,
        `Annulation / remboursement de la transaction ${target.reference}`,
        target.destination || target.counterparty || '',
        target.source || '',
        target.counterparty || target.source || '',
        target.method || 'other',
        id,
        JSON.stringify({ reversalOf: target.reference }),
        userId,
      ]
    );

    await financialAccountRepository.updateBalance(account.id, reverseDirection === 'in' ? amount : -amount, conn);

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const tx = await financialTransactionRepository.findById(newId);
  recordAudit({
    companyId, userId,
    action: 'transaction.reverse',
    actionType: 'UPDATE',
    entityType: 'transaction',
    entityId: newId,
    description: `Transaction ${target.reference} annulée via ${reference}`,
    oldValues: { originalReference: target.reference },
    newValues: { reversalReference: reference, amount },
  }).catch(() => {});

  return formatTransactionResponse(tx);
}

export async function getVehicleCosts(companyId, vehicleId) {
  return financialTransactionRepository.getVehicleCosts(companyId, vehicleId);
}

export async function getCategoryStats(companyId, { dateFrom, dateTo } = {}) {
  return financialTransactionRepository.getCategoryStats(companyId, { dateFrom, dateTo });
}

export async function previewReference(companyId) {
  return financialTransactionRepository.getNextReference(companyId);
}
