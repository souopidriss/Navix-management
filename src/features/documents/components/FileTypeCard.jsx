/**
 * Navix Documents — FileTypeCard
 * --------------------------------------------------------------------------
 * Carte d'un type de fichier (page « Types de fichiers ») : titre, statut,
 * description, extensions acceptées, taille maximale et nombre de documents
 * qui l'utilisent. La suppression est verrouillée (bouton désactivé) tant
 * que le type est référencé par au moins un document.
 *
 * Props :
 *   fileType   : type de fichier à afficher
 *   usageCount : nombre de documents utilisant ce type
 *   onEdit     : (fileType: object) => void
 *   onDelete   : (fileType: object) => void
 */
import { Badge, Button } from '@/components/ui';
import { formatDocumentSize, formatDocumentDate } from '../constants';
import './FileTypeCard.css';

const FileTypeCard = ({ fileType, usageCount = 0, onEdit, onDelete }) => {
  const locked = usageCount > 0;

  return (
    <article className="card h-100 navix-ft-card">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <h2 className="navix-ft-card__title">
            <i className="bi bi-file-earmark-check me-1" aria-hidden="true" />
            {fileType.title}
          </h2>
          <Badge variant={fileType.isActive ? 'success' : 'secondary'} soft size="sm">
            {fileType.isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>

        {fileType.description && (
          <p className="navix-ft-card__description mb-0">{fileType.description}</p>
        )}

        <div className="navix-ft-card__extensions">
          {fileType.extensions.map((extension) => (
            <Badge key={extension} variant="info" soft size="sm">
              {extension}
            </Badge>
          ))}
        </div>

        <dl className="navix-ft-card__meta">
          <div>
            <dt>
              <i className="bi bi-hdd" aria-hidden="true" /> Taille max
            </dt>
            <dd>{formatDocumentSize(fileType.maxSize)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-folder2-open" aria-hidden="true" /> Documents
            </dt>
            <dd>{usageCount}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-calendar3" aria-hidden="true" /> Créé le
            </dt>
            <dd>{formatDocumentDate(fileType.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="card-footer d-flex justify-content-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          icon="bi-pencil"
          onClick={() => onEdit(fileType)}
          title="Modifier"
          aria-label={`Modifier ${fileType.title}`}
        />
        <Button
          variant="ghost"
          size="sm"
          icon="bi-trash3"
          onClick={() => onDelete(fileType)}
          title={locked ? 'Suppression impossible : type utilisé par des documents' : 'Supprimer'}
          aria-label={`Supprimer ${fileType.title}`}
          disabled={locked}
        />
      </div>
    </article>
  );
};

export default FileTypeCard;
