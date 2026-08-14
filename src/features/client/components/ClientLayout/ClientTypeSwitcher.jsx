/**
 * Navix Client — ClientTypeSwitcher
 * --------------------------------------------------------------------------
 * Composant de basculement entre Client Entreprise et Client Particulier.
 * Permet de tester et basculer instantanément le type d'expérience Client.
 */
import { useClientStore } from '../../store/client.store';
import { CLIENT_TYPES } from '../../constants/client.constants';

const ClientTypeSwitcher = ({ className = '' }) => {
  const clientType = useClientStore((state) => state.clientType);
  const setClientType = useClientStore((state) => state.setClientType);

  return (
    <div className={`btn-group btn-group-sm navix-client-switcher ${className}`.trim()} role="group" aria-label="Type de client">
      <button
        type="button"
        className={`btn ${clientType === CLIENT_TYPES.ENTERPRISE ? 'btn-primary' : 'btn-outline-secondary'}`}
        onClick={() => setClientType(CLIENT_TYPES.ENTERPRISE)}
        title="Mode Client Entreprise"
      >
        <i className="bi bi-buildings me-1" aria-hidden="true" />
        <span className="d-none d-lg-inline">Entreprise</span>
      </button>

      <button
        type="button"
        className={`btn ${clientType === CLIENT_TYPES.INDIVIDUAL ? 'btn-primary' : 'btn-outline-secondary'}`}
        onClick={() => setClientType(CLIENT_TYPES.INDIVIDUAL)}
        title="Mode Client Particulier"
      >
        <i className="bi bi-person me-1" aria-hidden="true" />
        <span className="d-none d-lg-inline">Particulier</span>
      </button>
    </div>
  );
};

export default ClientTypeSwitcher;
