/**
 * Navix Client Finance — ClientFinanceActions
 * --------------------------------------------------------------------------
 * Actions rapides du centre financier, visibles selon les permissions
 * (Can / useCan) : ajouter des fonds, effectuer une transaction, retirer des
 * fonds, transférer des fonds. FCFA uniquement.
 */
import { Button } from '@/components/ui';
import { useCan } from '@/features/rbac/hooks';
import { PERMISSIONS } from '@/features/rbac/constants';
import './ClientFinance.css';

const ClientFinanceActions = ({ onDeposit, onWithdraw, onTransfer, onPayment }) => {
  const can = useCan();

  return (
    <div className="navix-client-finance__actions" role="group" aria-label="Actions financières">
      {can(PERMISSIONS.CLIENT_FINANCE_WALLET_DEPOSIT) && (
        <Button variant="success" size="sm" icon="bi-plus-circle" onClick={onDeposit}>
          Ajouter des fonds
        </Button>
      )}
      {can(PERMISSIONS.CLIENT_FINANCE_CREATE) && (
        <Button variant="primary" size="sm" icon="bi-cash-coin" onClick={onPayment}>
          Effectuer une transaction
        </Button>
      )}
      {can(PERMISSIONS.CLIENT_FINANCE_WALLET_WITHDRAW) && (
        <Button variant="danger" size="sm" icon="bi-arrow-up-circle" onClick={onWithdraw}>
          Retirer des fonds
        </Button>
      )}
      {can(PERMISSIONS.CLIENT_FINANCE_WALLET_TRANSFER) && (
        <Button variant="info" size="sm" icon="bi-arrow-left-right" onClick={onTransfer}>
          Transférer des fonds
        </Button>
      )}
    </div>
  );
};

export default ClientFinanceActions;
