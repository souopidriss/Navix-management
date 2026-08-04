/**
 * Navix Documents — FileTypeForm
 * --------------------------------------------------------------------------
 * Grille de champs d'un type de fichier, embarquée dans le FormModal
 * générique (enveloppe <form>, pied Annuler / Enregistrer, alerte
 * d'erreur globale fournis par la bibliothèque core). L'état du formulaire
 * est piloté par useZodForm depuis la page — composant 100 % déclaratif.
 *
 * Les extensions et types MIME sont saisis sous forme de listes séparées
 * par des virgules ; la taille maximale est saisie en Mo puis convertie en
 * octets au moment de l'édition du champ (payload en octets).
 *
 * Props :
 *   values   : valeurs contrôlées du formulaire
 *   errors   : { champ: message } — erreurs de validation Zod
 *   setField : (name, value) => void
 */
import { Divider } from '@/components/ui';

const toExtensionsInput = (extensions = []) => extensions.join(', ');
const toMimesInput = (mimes = []) => mimes.join(', ');

const FieldError = ({ id, error }) =>
  error ? (
    <div className="invalid-feedback d-block" id={id}>
      {error}
    </div>
  ) : null;

const FileTypeForm = ({ values, errors = {}, setField }) => {
  const handleExtensionsChange = (event) => {
    const extensions = event.target.value
      .split(',')
      .map((extension) => extension.trim())
      .filter(Boolean);
    setField('extensions', extensions);
  };

  const handleMimesChange = (event) => {
    const mimes = event.target.value
      .split(',')
      .map((mime) => mime.trim())
      .filter(Boolean);
    setField('mimeTypes', mimes);
  };

  const handleMaxSizeChange = (event) => {
    const megaBytes = Number(event.target.value);
    setField('maxSize', Number.isFinite(megaBytes) && megaBytes > 0 ? megaBytes * 1024 * 1024 : 0);
  };

  return (
    <div className="row g-3 navix-doc-form">
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="ft-title">
          Titre
        </label>
        <input
          id="ft-title"
          type="text"
          className={errors.title ? 'form-control is-invalid' : 'form-control'}
          value={values.title}
          onChange={(event) => setField('title', event.target.value)}
          placeholder="Ex. PDF"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? 'ft-title-error' : undefined}
        />
        <FieldError id="ft-title-error" error={errors.title} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="ft-max-size">
          Taille maximale (Mo)
        </label>
        <input
          id="ft-max-size"
          type="number"
          inputMode="decimal"
          min="1"
          step="1"
          className={errors.maxSize ? 'form-control is-invalid' : 'form-control'}
          value={values.maxSize ? Math.round(values.maxSize / (1024 * 1024)) : ''}
          onChange={handleMaxSizeChange}
          placeholder="Ex. 10"
          aria-invalid={errors.maxSize ? true : undefined}
          aria-describedby={errors.maxSize ? 'ft-max-size-error' : undefined}
        />
        <FieldError id="ft-max-size-error" error={errors.maxSize} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="ft-extensions">
          Extensions (séparées par des virgules)
        </label>
        <input
          id="ft-extensions"
          type="text"
          className={errors.extensions ? 'form-control is-invalid' : 'form-control'}
          value={toExtensionsInput(values.extensions)}
          onChange={handleExtensionsChange}
          placeholder="Ex. .pdf, .PDF"
          aria-invalid={errors.extensions ? true : undefined}
          aria-describedby={errors.extensions ? 'ft-extensions-error' : undefined}
        />
        <FieldError id="ft-extensions-error" error={errors.extensions} />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="ft-mimes">
          Types MIME (séparés par des virgules, facultatif)
        </label>
        <input
          id="ft-mimes"
          type="text"
          className="form-control"
          value={toMimesInput(values.mimeTypes)}
          onChange={handleMimesChange}
          placeholder="Ex. application/pdf"
        />
      </div>

      <div className="col-12">
        <Divider>Description</Divider>
      </div>

      <div className="col-12">
        <label className="form-label" htmlFor="ft-description">
          Description
        </label>
        <textarea
          id="ft-description"
          className="form-control"
          rows={3}
          value={values.description}
          onChange={(event) => setField('description', event.target.value)}
          placeholder="Usage recommandé de ce type de fichier…"
        />
      </div>

      <div className="col-12">
        <div className="form-check form-switch">
          <input
            id="ft-active"
            type="checkbox"
            role="switch"
            className="form-check-input"
            checked={values.isActive}
            onChange={(event) => setField('isActive', event.target.checked)}
          />
          <label className="form-check-label" htmlFor="ft-active">
            Type de fichier actif (disponible à la sélection)
          </label>
        </div>
      </div>
    </div>
  );
};

export default FileTypeForm;
