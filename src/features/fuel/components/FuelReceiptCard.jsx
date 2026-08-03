/**
 * Navix Fuel — FuelReceiptCard
 * --------------------------------------------------------------------------
 * Carte « reçu » d'un plein (page de détail) : station, ville, type de
 * carburant, quantité, prix unitaire, montant total, mode de paiement, n°
 * de facture et dates de référence.
 *
 * Props :
 *   fuel : plein à afficher
 */
import { Badge } from '@/components/ui';
import {
  getFuelType,
  getPaymentMethod,
  formatFuelDate,
  formatFuelLongDate,
  formatFuelMoney,
  formatFuelQuantity,
  formatFuelUnitPrice,
} from '../constants';
import './FuelReceiptCard.css';

const ReceiptRow = ({ icon, label, value }) => (
  <div className="d-flex align-items-start gap-2 py-2">
    <span className="navix-fuel-receipt__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <div className="min-w-0">
      <dt className="navix-fuel-receipt__label">{label}</dt>
      <dd className="navix-fuel-receipt__value mb-0">{value}</dd>
    </div>
  </div>
);

const FuelReceiptCard = ({ fuel }) => {
  const type = getFuelType(fuel.fuelType);
  const payment = getPaymentMethod(fuel.paymentMethod);

  return (
    <div className="card navix-fuel-receipt">
      <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <h2 className="h6 mb-0">
          <i className="bi bi-receipt me-2" aria-hidden="true" />
          Reçu de carburant
        </h2>
        <span className="navix-fuel-receipt__number">{fuel.fuelNumber}</span>
      </div>
      <div className="card-body">
        <dl className="row g-0 navix-fuel-receipt__grid mb-0">
          <div className="col-12 col-sm-6">
            <ReceiptRow icon="bi-fuel-pump" label="Station" value={fuel.stationName || '—'} />
          </div>
          <div className="col-12 col-sm-6">
            <ReceiptRow icon="bi-geo-alt" label="Ville" value={fuel.stationCity || '—'} />
          </div>
          <div className="col-12 col-sm-6">
            <ReceiptRow
              icon={type.icon}
              label="Type de carburant"
              value={
                <Badge variant={type.variant} soft>
                  {type.label}
                </Badge>
              }
            />
          </div>
          <div className="col-12 col-sm-6">
            <ReceiptRow icon="bi-cash-coin" label="Mode de paiement" value={payment.label} />
          </div>
          <div className="col-12 col-sm-6">
            <ReceiptRow icon="bi-droplet" label="Quantité" value={formatFuelQuantity(fuel.quantity)} />
          </div>
          <div className="col-12 col-sm-6">
            <ReceiptRow
              icon="bi-tag"
              label="Prix unitaire"
              value={formatFuelUnitPrice(fuel.unitPrice, fuel.currency)}
            />
          </div>
          <div className="col-12 col-sm-6">
            <ReceiptRow icon="bi-receipt-cutoff" label="N° de facture" value={fuel.invoiceNumber || '—'} />
          </div>
          <div className="col-12 col-sm-6">
            <ReceiptRow icon="bi-calendar3" label="Date du plein" value={formatFuelDate(fuel.createdAt)} />
          </div>
        </dl>

        <div className="navix-fuel-receipt__total">
          <span>Montant total</span>
          <strong>{formatFuelMoney(fuel.totalCost, fuel.currency)}</strong>
        </div>

        {fuel.receiptImage && (
          <div className="navix-fuel-receipt__image">
            <img src={fuel.receiptImage} alt={`Reçu ${fuel.fuelNumber}`} />
          </div>
        )}

        {fuel.createdAt && (
          <p className="navix-fuel-receipt__meta mb-0">
            Saisi le {formatFuelLongDate(fuel.createdAt)}
            {fuel.createdBy ? ` par ${fuel.createdBy}` : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default FuelReceiptCard;
