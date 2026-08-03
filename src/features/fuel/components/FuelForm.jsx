/**
 * Navix Fuel — FuelForm
 * --------------------------------------------------------------------------
 * Formulaire de création / édition d'un plein de carburant. Validation
 * exclusive Zod (useZodForm + fuelSchema). L'entreprise détermine les options
 * des listes liées (véhicule, chauffeur, trajet) ; le montant total est
 * affiché en direct (quantité × prix unitaire).
 *
 * Props :
 *   initialValues : valeurs initiales (fuelDefaultValues pour la création)
 *   companies     : liste des entreprises
 *   vehicles      : liste des véhicules (filtrés par entreprise)
 *   drivers       : liste des chauffeurs (filtrés par entreprise)
 *   trips         : liste des trajets (filtrés par entreprise et véhicule)
 *   onSubmit      : (values: object) => Promise<void>
 *   submitLabel   : libellé du bouton de soumission
 *   loading       : booléen — soumission en cours
 *   error         : erreur globale (affichée en alerte)
 *   onCancel      : () => void — retour en arrière
 */
import { Alert, Button, Divider } from '@/components/ui';
import { useZodForm } from '@/features/auth';
import { fuelSchema, fuelDefaultValues } from '../schemas';
import {
  FUEL_TYPES,
  FUEL_TYPE_VALUES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_VALUES,
  formatFuelMoney,
} from '../constants';
import './FuelForm.css';

const toLabelOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const tripLabel = (trip, vehicles) => {
  const vehicle = vehicles.find((item) => item.id === trip.vehicleId) ?? {};
  const vehicleLabel =
    vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() || '';
  return `${trip.tripNumber}${vehicleLabel ? ` · ${vehicleLabel}` : ''}`;
};

const FuelForm = ({
  initialValues = fuelDefaultValues,
  companies = [],
  vehicles = [],
  drivers = [],
  trips = [],
  onSubmit,
  submitLabel = 'Enregistrer',
  loading = false,
  error = null,
  onCancel,
}) => {
  const { values, errors, setField, handleSubmit } = useZodForm({
    schema: fuelSchema,
    defaultValues: initialValues,
    onSubmit,
  });

  const handleCompanyChange = (value) => {
    setField('companyId', value);
    setField('vehicleId', '');
    setField('driverId', '');
    setField('tripId', '');
  };

  const handleVehicleChange = (value) => {
    setField('vehicleId', value);
    setField('driverId', '');
    setField('tripId', '');
  };

  const vehicleOptions = vehicles.filter(
    (vehicle) => !values.companyId || vehicle.companyId === values.companyId,
  );
  const driverOptions = drivers.filter(
    (driver) => !values.companyId || driver.companyId === values.companyId,
  );
  const tripOptions = trips.filter(
    (trip) =>
      (!values.companyId || trip.companyId === values.companyId) &&
      (!values.vehicleId || trip.vehicleId === values.vehicleId),
  );

  const totalCost =
    Number(values.quantity) > 0 && Number(values.unitPrice) > 0
      ? Math.round(Number(values.quantity) * Number(values.unitPrice) * 100) / 100
      : 0;

  return (
    <form onSubmit={handleSubmit} noValidate className="navix-fuel-form">
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <div className="row g-3">
        <div className="col-12">
          <Divider>Rattachement</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="fuel-company">
            Entreprise
          </label>
          <select
            id="fuel-company"
            className={errors.companyId ? 'form-select is-invalid' : 'form-select'}
            value={values.companyId}
            onChange={(event) => handleCompanyChange(event.target.value)}
            aria-invalid={errors.companyId ? true : undefined}
            aria-describedby={errors.companyId ? 'fuel-company-error' : undefined}
          >
            <option value="" disabled hidden>
              Sélectionner une entreprise…
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {errors.companyId && (
            <div className="invalid-feedback d-block" id="fuel-company-error">
              {errors.companyId}
            </div>
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="fuel-vehicle">
            Véhicule
          </label>
          <select
            id="fuel-vehicle"
            className={errors.vehicleId ? 'form-select is-invalid' : 'form-select'}
            value={values.vehicleId}
            onChange={(event) => handleVehicleChange(event.target.value)}
            disabled={!values.companyId}
            aria-invalid={errors.vehicleId ? true : undefined}
            aria-describedby={errors.vehicleId ? 'fuel-vehicle-error' : undefined}
          >
            <option value="" disabled hidden>
              {values.companyId ? 'Sélectionner un véhicule…' : 'Choisir d’abord une entreprise'}
            </option>
            {vehicleOptions.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.registrationNumber || `${vehicle.brand} ${vehicle.model}`.trim()}
              </option>
            ))}
          </select>
          {errors.vehicleId && (
            <div className="invalid-feedback d-block" id="fuel-vehicle-error">
              {errors.vehicleId}
            </div>
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="fuel-driver">
            Chauffeur
          </label>
          <select
            id="fuel-driver"
            className="form-select"
            value={values.driverId}
            onChange={(event) => setField('driverId', event.target.value)}
            disabled={!values.companyId}
          >
            <option value="" hidden>
              {values.companyId ? 'Chauffeur (optionnel)…' : 'Choisir d’abord une entreprise'}
            </option>
            {driverOptions.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="fuel-trip">
            Trajet lié
          </label>
          <select
            id="fuel-trip"
            className="form-select"
            value={values.tripId}
            onChange={(event) => setField('tripId', event.target.value)}
            disabled={!values.companyId}
          >
            <option value="" hidden>
              {values.companyId ? 'Trajet (optionnel)…' : 'Choisir d’abord une entreprise'}
            </option>
            {tripOptions.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {tripLabel(trip, vehicles)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <Divider>Plein</Divider>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="fuel-type">
            Type de carburant
          </label>
          <select
            id="fuel-type"
            className={errors.fuelType ? 'form-select is-invalid' : 'form-select'}
            value={values.fuelType}
            onChange={(event) => setField('fuelType', event.target.value)}
            aria-invalid={errors.fuelType ? true : undefined}
            aria-describedby={errors.fuelType ? 'fuel-type-error' : undefined}
          >
            <option value="" disabled hidden>
              Sélectionner un type…
            </option>
            {toLabelOptions(FUEL_TYPE_VALUES, FUEL_TYPES).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.fuelType && (
            <div className="invalid-feedback d-block" id="fuel-type-error">
              {errors.fuelType}
            </div>
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="fuel-station-name">
            Station-service
          </label>
          <input
            id="fuel-station-name"
            type="text"
            className={errors.stationName ? 'form-control is-invalid' : 'form-control'}
            value={values.stationName}
            onChange={(event) => setField('stationName', event.target.value)}
            placeholder="Ex. TotalEnergies Riviera"
            aria-invalid={errors.stationName ? true : undefined}
            aria-describedby={errors.stationName ? 'fuel-station-name-error' : undefined}
          />
          {errors.stationName && (
            <div className="invalid-feedback d-block" id="fuel-station-name-error">
              {errors.stationName}
            </div>
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="fuel-station-city">
            Ville
          </label>
          <input
            id="fuel-station-city"
            type="text"
            className="form-control"
            value={values.stationCity}
            onChange={(event) => setField('stationCity', event.target.value)}
            placeholder="Ex. Abidjan"
          />
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label" htmlFor="fuel-quantity">
            Quantité (L)
          </label>
          <input
            id="fuel-quantity"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            className={errors.quantity ? 'form-control is-invalid' : 'form-control'}
            value={values.quantity}
            onChange={(event) => setField('quantity', event.target.value)}
            placeholder="0"
            aria-invalid={errors.quantity ? true : undefined}
            aria-describedby={errors.quantity ? 'fuel-quantity-error' : undefined}
          />
          {errors.quantity && (
            <div className="invalid-feedback d-block" id="fuel-quantity-error">
              {errors.quantity}
            </div>
          )}
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label" htmlFor="fuel-unit-price">
            Prix/L
          </label>
          <input
            id="fuel-unit-price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            className={errors.unitPrice ? 'form-control is-invalid' : 'form-control'}
            value={values.unitPrice}
            onChange={(event) => setField('unitPrice', event.target.value)}
            placeholder="0"
            aria-invalid={errors.unitPrice ? true : undefined}
            aria-describedby={errors.unitPrice ? 'fuel-unit-price-error' : undefined}
          />
          {errors.unitPrice && (
            <div className="invalid-feedback d-block" id="fuel-unit-price-error">
              {errors.unitPrice}
            </div>
          )}
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label" htmlFor="fuel-mileage">
            Kilométrage
          </label>
          <input
            id="fuel-mileage"
            type="number"
            inputMode="numeric"
            min="0"
            className={errors.mileage ? 'form-control is-invalid' : 'form-control'}
            value={values.mileage}
            onChange={(event) => setField('mileage', event.target.value)}
            placeholder="0"
            aria-invalid={errors.mileage ? true : undefined}
            aria-describedby={errors.mileage ? 'fuel-mileage-error' : undefined}
          />
          {errors.mileage && (
            <div className="invalid-feedback d-block" id="fuel-mileage-error">
              {errors.mileage}
            </div>
          )}
        </div>

        <div className="col-6 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="fuel-payment-method">
            Mode de paiement
          </label>
          <select
            id="fuel-payment-method"
            className={errors.paymentMethod ? 'form-select is-invalid' : 'form-select'}
            value={values.paymentMethod}
            onChange={(event) => setField('paymentMethod', event.target.value)}
            aria-invalid={errors.paymentMethod ? true : undefined}
            aria-describedby={errors.paymentMethod ? 'fuel-payment-method-error' : undefined}
          >
            <option value="" disabled hidden>
              Sélectionner un mode…
            </option>
            {toLabelOptions(PAYMENT_METHOD_VALUES, PAYMENT_METHODS).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.paymentMethod && (
            <div className="invalid-feedback d-block" id="fuel-payment-method-error">
              {errors.paymentMethod}
            </div>
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label" htmlFor="fuel-invoice-number">
            N° de facture
          </label>
          <input
            id="fuel-invoice-number"
            type="text"
            className="form-control"
            value={values.invoiceNumber}
            onChange={(event) => setField('invoiceNumber', event.target.value)}
            placeholder="Ex. FAC-2026-0824"
          />
        </div>

        <div className="col-12">
          <Divider>Total</Divider>
        </div>

        <div className="col-12">
          <div className="navix-fuel-form__total">
            <span>Montant total estimé</span>
            <strong>{formatFuelMoney(totalCost)}</strong>
          </div>
          <small className="form-text text-secondary">
            Le montant total est calculé automatiquement (quantité × prix unitaire).
          </small>
        </div>

        <div className="col-12">
          <label className="form-label" htmlFor="fuel-notes">
            Notes
          </label>
          <textarea
            id="fuel-notes"
            className="form-control"
            rows={3}
            value={values.notes}
            onChange={(event) => setField('notes', event.target.value)}
            placeholder="Observations, relevé du compteur, anomalies…"
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 flex-wrap mt-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
        )}
        <Button type="submit" variant="primary" icon="bi-check-lg" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default FuelForm;
