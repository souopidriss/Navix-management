/**
 * Navix Settings — SettingsForm
 * --------------------------------------------------------------------------
 * Gabarit de formulaire de paramètres : détecte les modifications non
 * enregistrées, valide via Zod, et expose Enregistrer / Annuler /
 * Réinitialiser ainsi qu'un indicateur d'état (« Modifications non
 * enregistrées » / « Paramètres enregistrés »).
 *
 * Props :
 *   title, subtitle, icon, breadcrumbs : en-tête de page
 *   section                            : clé de section (ids + accessibilité)
 *   schema                             : schéma Zod de la section
 *   data                               : valeurs enregistrées (ou null)
 *   onSave(values)                     : Promise<{ success, error? }>
 *   onRetry()                          : rechargement (ErrorState)
 *   isSaving, loading, error           : états du store
 *   showSave                           : affiche/masque Enregistrer (défaut true)
 *   extraActions                       : actions additionnelles (en-tête)
 *   children({ values, errors, setField, touched }) : corps du formulaire
 */
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { Alert, Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState, ErrorState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { getSettingsFormValues } from '../schemas';
import './settings.css';

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const errorsFromResult = (result) => {
  const fieldErrors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (field !== undefined && fieldErrors[field] === undefined) {
      fieldErrors[field] = issue.message;
    }
  });
  return fieldErrors;
};

const SettingsStatus = ({ touched, savedAt, isSaving }) => {
  if (isSaving) {
    return (
      <span className="settings-status settings-status--saving" role="status">
        <i className="bi bi-arrow-repeat" aria-hidden="true" />
        Sauvegarde…
      </span>
    );
  }
  if (savedAt) {
    return (
      <span className="settings-status settings-status--saved" role="status">
        <i className="bi bi-check-circle" aria-hidden="true" />
        Paramètres enregistrés
      </span>
    );
  }
  if (touched) {
    return (
      <span className="settings-status settings-status--unsaved" role="status">
        <i className="bi bi-exclamation-triangle" aria-hidden="true" />
        Modifications non enregistrées
      </span>
    );
  }
  return (
    <span className="settings-status settings-status--clean">
      <i className="bi bi-check2" aria-hidden="true" />
      Paramètres à jour
    </span>
  );
};

const SettingsForm = ({
  title,
  subtitle,
  icon = 'bi-gear',
  breadcrumbs,
  section = 'settings',
  schema,
  data = null,
  onSave,
  onRetry,
  isSaving = false,
  loading = false,
  error,
  onClearError,
  showSave = true,
  extraActions,
  children,
  contained = true,
}) => {
  const [draft, setDraft] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [errors, setErrors] = useState({});
  const [savedAt, setSavedAt] = useState(null);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!data) return;
    const formValues = getSettingsFormValues(section, data);
    setDraft(formValues);
    setBaseline(formValues);
    setErrors({});
    if (!syncedRef.current) {
      syncedRef.current = true;
      setSavedAt(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (!savedAt) return undefined;
    const timer = setTimeout(() => setSavedAt(null), 4000);
    return () => clearTimeout(timer);
  }, [savedAt]);

  const touched = Boolean(draft && baseline && !deepEqual(draft, baseline));

  const handleSave = async () => {
    if (!draft) return;
    const result = schema.safeParse(draft);
    if (!result.success) {
      setErrors(errorsFromResult(result));
      return;
    }
    setErrors({});
    const outcome = await onSave?.(result.data);
    if (outcome?.success) {
      setBaseline(result.data);
      setSavedAt(Date.now());
      toast.success('Paramètres enregistrés.');
    }
  };

  const handleCancel = () => {
    if (!baseline) return;
    setDraft(baseline);
    setErrors({});
  };

  const handleReset = () => {
    setDraft(getSettingsFormValues(section, {}));
    setErrors({});
  };

  const defaultCrumbs = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Paramètres', to: ROUTES.SETTINGS },
    { label: title },
  ];

  const loadingInner = (
    <>
      <Helmet>
        <title>{title} — Navix Management</title>
      </Helmet>
      {loading || data === null ? (
        <LoadingState variant="text" lines={6} label="Chargement des paramètres…" />
      ) : (
        <ErrorState
          title="Impossible de charger les paramètres"
          message={error || 'Une erreur est survenue.'}
          onRetry={onRetry}
        />
      )}
    </>
  );

  if (!draft) {
    return contained ? <PageContainer>{loadingInner}</PageContainer> : loadingInner;
  }

  const form = (
    <>
      <Helmet>
        <title>{title} — Navix Management</title>
      </Helmet>

      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        breadcrumbs={breadcrumbs ?? defaultCrumbs}
        actions={
          <div className="d-flex flex-wrap align-items-center gap-2">
            <SettingsStatus touched={touched} savedAt={savedAt} isSaving={isSaving} />
            {extraActions}
            <Button
              variant="secondary"
              size="sm"
              icon="bi-x-lg"
              onClick={handleCancel}
              disabled={!touched || isSaving}
            >
              Annuler
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="bi-arrow-counterclockwise"
              onClick={handleReset}
              disabled={isSaving}
              title="Rétablir les valeurs par défaut de cette section"
            >
              Réinitialiser
            </Button>
            {showSave && (
              <Button
                variant="primary"
                size="sm"
                icon="bi-check-lg"
                loading={isSaving}
                disabled={!touched}
                onClick={handleSave}
              >
                Enregistrer
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <Alert variant="danger" closable={Boolean(onClearError)} onClose={onClearError} className="mb-3">
          {error}
        </Alert>
      )}

      <form noValidate aria-label={title}>
        {children({ values: draft, errors, setField: (name, value) => setDraft((current) => ({ ...current, [name]: value })), touched })}
      </form>
    </>
  );

  return contained ? <PageContainer>{form}</PageContainer> : form;
};

export default SettingsForm;
