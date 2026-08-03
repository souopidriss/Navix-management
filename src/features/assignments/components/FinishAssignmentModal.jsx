/**
 * Navix Assignments — FinishAssignmentModal
 * --------------------------------------------------------------------------
 * Modale de clôture d'une affectation active : date de fin (obligatoire),
 * kilométrage final, niveau de carburant final et motif. Validation Zod
 * (useZodForm + assignmentFinishSchema). Contrôlée en React comme les autres
 * modales du module (Échap, backdrop, verrouillage du scroll).
 *
 * Props :
 *   assignment : affectation à terminer (null = modale fermée)
 *   open       : booléen — ouvre la modale
 *   loading    : booléen — soumission en cours
 *   error      : message d'erreur global (optionnel)
 *   onSubmit   : (values: object) => Promise<void>
 *   onClose    : () => void — ferme la modale
 */
import { useEffect } from 'react';
import { Alert, Button } from '@/components/ui';
import { useZodForm } from '@/features/auth';
import { assignmentFinishSchema, finishDefaultValues } from '../schemas';
import './FinishAssignmentModal.css';

const FinishAssignmentModal = ({ assignment, open, loading, error, onSubmit, onClose }) => {
  const { values, errors, setField, handleSubmit, reset } = useZodForm({
    schema: assignmentFinishSchema,
    defaultValues: finishDefaultValues,
    onSubmit,
  });

  useEffect(() => {
    if (open && assignment) {
      reset({ ...finishDefaultValues, endDate: new Date().toISOString().slice(0, 10) });
    }
  }, [open, assignment, reset]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('navix-modal-open');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('navix-modal-open');
    };
  }, [open, onClose]);

  if (!open || !assignment) return null;

  return (
    <div
      className="navix-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="navix-modal__backdrop" aria-hidden="true" />
      <div
        className="navix-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="finish-assignment-title"
        aria-describedby="finish-assignment-description"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h5" id="finish-assignment-title">
              Terminer {assignment.assignmentNumber}
            </h2>
            <Button variant="ghost" size="sm" icon="bi-x-lg" onClick={onClose} disabled={loading} aria-label="Fermer la fenêtre" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}
              <p id="finish-assignment-description" className="text-secondary small">
                Renseignez les informations de clôture de l’affectation.
              </p>

              <div className="mb-3">
                <label className="form-label" htmlFor="finish-end-date">
                  Date de fin
                </label>
                <input
                  id="finish-end-date"
                  type="date"
                  className={errors.endDate ? 'form-control is-invalid' : 'form-control'}
                  value={values.endDate}
                  onChange={(event) => setField('endDate', event.target.value)}
                  aria-invalid={errors.endDate ? true : undefined}
                  aria-describedby={errors.endDate ? 'finish-end-date-error' : undefined}
                />
                {errors.endDate && (
                  <div className="invalid-feedback d-block" id="finish-end-date-error">
                    {errors.endDate}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="finish-end-mileage">
                  Kilométrage final
                </label>
                <input
                  id="finish-end-mileage"
                  type="number"
                  inputMode="numeric"
                  className={errors.endMileage ? 'form-control is-invalid' : 'form-control'}
                  value={values.endMileage}
                  onChange={(event) => setField('endMileage', event.target.value)}
                  placeholder="0"
                  aria-invalid={errors.endMileage ? true : undefined}
                  aria-describedby={errors.endMileage ? 'finish-end-mileage-error' : undefined}
                />
                {errors.endMileage && (
                  <div className="invalid-feedback d-block" id="finish-end-mileage-error">
                    {errors.endMileage}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="finish-fuel-level">
                  Niveau de carburant final (%)
                </label>
                <input
                  id="finish-fuel-level"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  className={errors.fuelLevelEnd ? 'form-control is-invalid' : 'form-control'}
                  value={values.fuelLevelEnd}
                  onChange={(event) => setField('fuelLevelEnd', event.target.value)}
                  placeholder="0"
                  aria-invalid={errors.fuelLevelEnd ? true : undefined}
                  aria-describedby={errors.fuelLevelEnd ? 'finish-fuel-level-error' : undefined}
                />
                {errors.fuelLevelEnd && (
                  <div className="invalid-feedback d-block" id="finish-fuel-level-error">
                    {errors.fuelLevelEnd}
                  </div>
                )}
              </div>

              <div className="mb-0">
                <label className="form-label" htmlFor="finish-reason">
                  Motif de fin
                </label>
                <textarea
                  id="finish-reason"
                  className="form-control"
                  rows={3}
                  value={values.reason}
                  onChange={(event) => setField('reason', event.target.value)}
                  placeholder="Ex. Mission terminée, fin de période…"
                />
              </div>
            </div>

            <div className="modal-footer">
              <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" variant="success" icon="bi-check2-circle" loading={loading}>
                Terminer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinishAssignmentModal;
