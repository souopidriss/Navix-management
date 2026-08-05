/**
 * Navix Agencies — AgencyLocation
 * --------------------------------------------------------------------------
 * Localisation d'une agence : adresse complète, région, pays, code postal
 * et coordonnées géographiques (sans carte — affichage textuel uniquement).
 *
 * Props :
 *   agency : agence dont on affiche la localisation
 */
import { formatAgencyCoordinates } from '../constants';
import './AgencyLocation.css';

const AgencyLocation = ({ agency }) => {
  const address = agency.address || '';
  const city = agency.city || '';
  const region = agency.region || '';
  const country = agency.country || '';
  const postalCode = agency.postalCode || '';

  const fullAddress = [address, city, region, country, postalCode].filter(Boolean).join(', ');
  const coordinates = formatAgencyCoordinates(agency.latitude, agency.longitude);

  return (
    <div className="navix-agency-location">
      <div className="navix-agency-location__address">
        <span className="navix-agency-location__icon" aria-hidden="true">
          <i className="bi bi-geo-alt" />
        </span>
        <span>{fullAddress || 'Adresse non renseignée'}</span>
      </div>

      {coordinates !== '—' && (
        <div className="navix-agency-location__coordinates">
          <span className="navix-agency-location__icon navix-agency-location__icon--coords" aria-hidden="true">
            <i className="bi bi-crosshair" />
          </span>
          <span>
            <code>{coordinates}</code>
          </span>
        </div>
      )}
    </div>
  );
};

export default AgencyLocation;
