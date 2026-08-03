/**
 * Navix Core — FormModal
 * --------------------------------------------------------------------------
 * Modale de formulaire générique : entête (titre, sous-titre, icône, fermer),
 * corps défilant (champs + erreur) et pied (Annuler / Soumettre). Si
 * `onSubmit` est fourni, les boutons sont câblés dans un <form> natif
 * (soumission par Enter possible). Aucune logique métier.
 *
 * Props :
 *   open         : booléen — modale ouverte
 *   onClose      : () => void
 *   title        : titre du dialogue
 *   subtitle     : sous-titre (optionnel)
 *   icon         : classe d'icône Bootstrap Icons (optionnel)
 *   size         : 'sm' | 'md' | 'lg' | 'xl'        (défaut : 'md')
 *   children     : contenu du formulaire
 *   onSubmit     : handler de soumission (si fourni, rend un <form>)
 *   submitLabel  : libellé du bouton de soumission   (défaut : 'Enregistrer')
 *   submitIcon   : icône du bouton de soumission     (défaut : 'bi-check-lg')
 *   cancelLabel  : libellé du bouton d'annulation    (défaut : 'Annuler')
 *   loading      : booléen — soumission en cours
 *   error        : message d'erreur (optionnel)
 *   footer       : pied personnalisé (remplace Annuler / Soumettre)
 *   dismissible  : booléen — affiche le bouton de fermeture (défaut : true)
 *
 * Exemple :
 *   <FormModal
 *     open={open}
 *     onClose={onClose}
 *     title="Ajouter un pointage"
 *     icon="bi-plus-lg"
 *     onSubmit={handleSubmit}
 *     loading={isSaving}
 *     error={error}
 *   >
 *     <FormField ... />
 *   </FormModal>
 */
import { useId } from 'react';
import { Alert, Button } from '@/components/ui';
import Dialog from '../_shared/Dialog';

const FormModal = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  size = 'md',
  children,
  onSubmit,
  submitLabel = 'Enregistrer',
  submitIcon = 'bi-check-lg',
  cancelLabel = 'Annuler',
  loading = false,
  error,
  footer,
  dismissible = true,
}) => {
  const id = useId();
  const titleId = `${id}-title`;

  const header = (
    <>
      <div>
        {icon && <i className={`bi ${icon} me-2`} aria-hidden="true" />}
        <h2 className="modal-title h5 d-inline" id={titleId}>
          {title}
        </h2>
        {subtitle && <p className="modal-subtitle mb-0">{subtitle}</p>}
      </div>
      {dismissible && (
        <Button variant="ghost" size="sm" icon="bi-x-lg" onClick={onClose} aria-label="Fermer la fenêtre" />
      )}
    </>
  );

  const body = (
    <>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      {children}
    </>
  );

  const defaultFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button type="submit" variant="primary" icon={submitIcon} loading={loading}>
        {submitLabel}
      </Button>
    </>
  );

  const dialog = (
    <Dialog
      open={open}
      onClose={onClose}
      size={size}
      labelledBy={titleId}
      header={header}
      body={body}
      footer={footer ?? defaultFooter}
    />
  );

  if (onSubmit) {
    return <form onSubmit={onSubmit}>{dialog}</form>;
  }

  return dialog;
};

export default FormModal;
