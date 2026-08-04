/**
 * Navix Documents — DocumentSizeBadge
 * --------------------------------------------------------------------------
 * Taille de fichier lisible (ex. « 1,2 Mo ») avec repli « — ».
 *
 * Props :
 *   size : taille en octets
 */
import { formatDocumentSize } from '../constants';

const DocumentSizeBadge = ({ size }) => (
  <span className="text-secondary">{formatDocumentSize(size)}</span>
);

export default DocumentSizeBadge;
