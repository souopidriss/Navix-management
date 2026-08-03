/**
 * Navix Core — QRCode (placeholder d'architecture)
 * --------------------------------------------------------------------------
 * Aperçu de code QR sans génération réelle : rend un visuel stylisé avec le
 * motif attendu, la valeur et le libellé. L'intégration d'une vraie
 * bibliothèque (ex. `qrcode` / `react-qr-code`) sera branchée ici sans
 * changer l'API. Aucun backend requis.
 *
 * Props :
 *   value      : données à encoder (URL, identifiant, texte…)
 *   size       : taille du carré en pixels                  (défaut : 128)
 *   label      : libellé affiché sous le code               (défaut : 'Code QR')
 *   alt        : texte accessible                           (défaut : 'Code QR (aperçu)')
 *   className  : classes additionnelles
 *
 * Exemple :
 *   <QRCode value={`https://app.navix.dev/vehicle/${id}`} size={160} label="Véhicule" />
 */
import { memo } from 'react';
import './QRCode.css';

const QRCode = ({ value, size = 128, label = 'Code QR', alt = 'Code QR (aperçu)', className }) => (
  <figure className={`navix-qrcode ${className || ''}`.trim()} style={{ '--navix-qrcode-size': `${size}px` }}>
    <div className="navix-qrcode__pattern" role="img" aria-label={alt}>
      <span className="navix-qrcode__finder navix-qrcode__finder--tl" aria-hidden="true" />
      <span className="navix-qrcode__finder navix-qrcode__finder--tr" aria-hidden="true" />
      <span className="navix-qrcode__finder navix-qrcode__finder--bl" aria-hidden="true" />
      <span className="navix-qrcode__dots" aria-hidden="true" />
    </div>
    <figcaption className="navix-qrcode__caption">
      {label}
      {value && <span className="navix-qrcode__value">{value}</span>}
    </figcaption>
  </figure>
);

export default memo(QRCode);
