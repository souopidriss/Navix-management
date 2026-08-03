/**
 * Navix Vehicles — VehicleQRCode
 * --------------------------------------------------------------------------
 * Représentation simulée du QR code d'un véhicule.
 * Aucune génération réelle : le composant prépare uniquement l'architecture
 * (placeholder visuel + valeur métier) pour le futur rendu côté client ou
 * serveur. Le rendu sera remplacé par une bibliothèque QR dédiée.
 *
 * Props :
 *   value      : valeur métier encodée (ex. QRV-AB3824KL)
 *   title      : libellé accessible                 (défaut : 'QR Code du véhicule')
 *   className  : classes additionnelles
 *   ...rest    : attributs transmis au conteneur
 */
import './VehicleQRCode.css';

const VehicleQRCode = ({ value, title = 'QR Code du véhicule', className, ...rest }) => (
  <div
    className={`navix-vehicle-qr ${className || ''}`.trim()}
    role="img"
    aria-label={`${title} (simulation)`}
    title={`${title} — simulation`}
    {...rest}
  >
    <i className="bi bi-qr-code" aria-hidden="true" />
    {value && <small className="navix-vehicle-qr__value">{value}</small>}
  </div>
);

export default VehicleQRCode;
