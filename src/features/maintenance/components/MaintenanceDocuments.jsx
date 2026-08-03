/**
 * Navix Maintenance — MaintenanceDocuments
 * --------------------------------------------------------------------------
 * Gestion des pièces jointes d'un entretien (simulée — aucun envoi réseau).
 * Affiche les pièces existantes (avec catégorie), permet d'en ajouter via le
 * FileUploader générique de la bibliothèque core (drag & drop, validation) et
 * d'en retirer, puis de sauvegarder via `onSave(attachments)`.
 *
 * Props :
 *   maintenance : entretien (attachments initiaux)
 *   readOnly    : booléen — affichage seul (aucun ajout / retrait)
 *   onSave      : (attachments: object[]) => Promise<void>
 *   saving      : booléen — sauvegarde en cours
 *   saved       : booléen — sauvegarde réussie (message transitoire)
 *   onResetSaved : () => void — remet `saved` à faux après affichage
 */
import { useState } from 'react';
import { Button } from '@/components/ui';
import { FileUploader } from '@/components/core';
import './MaintenanceDocuments.css';

const CATEGORY_LABELS = {
  devis: 'Devis',
  facture: 'Facture',
  controle: 'Contrôle',
  photo: 'Photo',
  autre: 'Autre',
};

const MaintenanceDocuments = ({
  maintenance = {},
  readOnly = false,
  onSave,
  saving = false,
  saved = false,
  onResetSaved,
}) => {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [removed, setRemoved] = useState([]);

  const existing = (maintenance.attachments || []).filter(
    (attachment) => !removed.includes(attachment.name),
  );

  const handleSave = async () => {
    const added = pendingFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      category: 'autre',
    }));
    await onSave([...existing, ...added]);
  };

  const reset = () => {
    setPendingFiles([]);
    setRemoved([]);
    onResetSaved?.();
  };

  return (
    <div className="navix-maint-docs">
      {existing.length > 0 && (
        <ul className="list-group list-group-flush navix-maint-docs__list mb-3">
          {existing.map((attachment) => (
            <li key={attachment.name} className="list-group-item d-flex align-items-center gap-3 px-0">
              <span className="navix-maint-docs__icon" aria-hidden="true">
                <i className="bi bi-paperclip" />
              </span>
              <span className="flex-grow-1 min-w-0">
                <span className="navix-maint-docs__name">{attachment.name}</span>
                <span className="navix-maint-docs__meta d-block">
                  {CATEGORY_LABELS[attachment.category] || 'Pièce jointe'}
                  {attachment.size ? ` · ${(attachment.size / 1024).toFixed(0)} Ko` : ''}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon="bi-x-lg"
                aria-label={`Retirer ${attachment.name}`}
                onClick={() => setRemoved((current) => [...current, attachment.name])}
                disabled={readOnly}
              />
            </li>
          ))}
        </ul>
      )}

      {!readOnly && (
        <FileUploader
          accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
          maxSize={5 * 1024 * 1024}
          multiple
          label="Ajouter des pièces jointes"
          hint="PDF ou image, 5 Mo max."
          value={pendingFiles}
          onChange={setPendingFiles}
        />
      )}

      {!readOnly && (
        <div className="d-flex justify-content-end gap-2 mt-3">
          {(existing.length > 0 || pendingFiles.length > 0) && (
            <>
              <Button variant="secondary" size="sm" onClick={reset} disabled={saving}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" icon="bi-check-lg" onClick={handleSave} loading={saving}>
                Enregistrer les pièces
              </Button>
            </>
          )}
          {saved && (
            <span className="navix-maint-docs__saved" role="status">
              <i className="bi bi-check2-circle me-1" aria-hidden="true" />
              Pièces jointes enregistrées.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MaintenanceDocuments;
