/**
 * Navix Core — ImagePreview
 * --------------------------------------------------------------------------
 * Aperçu d'image générique : accepte une URL (string) ou un fichier local
 * (File) dont l'URL objet est gérée (création/révocation automatiques).
 * Affiche un espace réservé si aucune image.
 *
 * Props :
 *   src        : URL de l'image ou objet File
 *   alt        : texte alternatif
 *   fallback   : nœud d'espace réservé (défaut : icône image)
 *   rounded    : booléen — coins arrondis
 *   objectFit  : 'cover' | 'contain'           (défaut : 'cover')
 *   aspect     : 'square' | '4/3' | '16/9' | 'auto'   (défaut : 'square')
 *   className  : classes additionnelles
 *
 * Exemple :
 *   <ImagePreview src={file} alt="Photo du véhicule" rounded />
 *   <ImagePreview src="/photos/vehicle.jpg" aspect="16/9" />
 */
import { memo, useEffect, useState } from 'react';
import './ImagePreview.css';

const ASPECTS = {
  square: 'navix-image-preview--square',
  '4/3': 'navix-image-preview--4-3',
  '16/9': 'navix-image-preview--16-9',
  auto: 'navix-image-preview--auto',
};

const ImagePreview = ({ src, alt = '', fallback, rounded = false, objectFit = 'cover', aspect = 'square', className }) => {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (src instanceof File) {
      const url = URL.createObjectURL(src);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
    return undefined;
  }, [src]);

  const imageSrc = src instanceof File ? objectUrl : src;
  const classes = [
    'navix-image-preview',
    ASPECTS[aspect] || ASPECTS.square,
    rounded && 'navix-image-preview--rounded',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!imageSrc) {
    return (
      <div className={`${classes} navix-image-preview--empty`.trim()}>
        {fallback ?? <i className="bi bi-image" aria-hidden="true" />}
      </div>
    );
  }

  return (
    <div className={classes}>
      <img
        className="navix-image-preview__img"
        src={imageSrc}
        alt={alt}
        style={{ objectFit }}
      />
    </div>
  );
};

export default memo(ImagePreview);
