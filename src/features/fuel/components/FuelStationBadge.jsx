/**
 * Navix Fuel — FuelStationBadge
 * --------------------------------------------------------------------------
 * Représentation compacte d'une station-service : icône, nom de la station
 * et ville. Utilisé dans le tableau et les cartes.
 *
 * Props :
 *   stationName : nom de la station-service
 *   stationCity : ville de la station (optionnel)
 */
import './FuelStationBadge.css';

const FuelStationBadge = ({ stationName = '—', stationCity }) => (
  <span className="navix-fuel-station">
    <span className="navix-fuel-station__icon" aria-hidden="true">
      <i className="bi bi-fuel-pump" />
    </span>
    <span className="navix-fuel-station__body">
      <span className="navix-fuel-station__name">{stationName}</span>
      {stationCity ? <span className="navix-fuel-station__city">{stationCity}</span> : null}
    </span>
  </span>
);

export default FuelStationBadge;
