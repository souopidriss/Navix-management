/**
 * Navix Partner Portal — PartnerVehicleDetailsModal (PROMPT 063)
 * --------------------------------------------------------------------------
 * Détail d'un véhicule de la flotte partenaire, organisé en 4 sections :
 * IDENTITÉ (marque, modèle, année, immatriculation, type, couleur) ·
 * EXPLOITATION (km, statut, agence, chauffeur actuel, mise en service) ·
 * TECHNIQUE (dernière/prochaine maintenance, assurance, visite technique) ·
 * FINANCE (coût acquisition / maintenance / carburant, FCFA). Lecture seule.
 */
import { Button, Divider } from '@/components/ui';
import { FormModal, StatusBadge } from '@/components/core';
import { getVehicleStatus, formatMileage, formatVehicleDate } from '@/features/vehicles/constants';
import { getPartnerVehicleType } from '../../constants/partner.constants';

const DetailRow = ({ icon, label, value }) => (
  <div className="navix-pveh-detail">
    <span className="navix-pveh-detail__icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <span className="navix-pveh-detail__body">
      <span className="navix-pveh-detail__label">{label}</span>
      <span className="navix-pveh-detail__value">{value || <span className="text-secondary">—</span>}</span>
    </span>
  </div>
);

const PartnerVehicleDetailsModal = ({ open, onClose, vehicle }) => {
  if (!vehicle) return null;

  const status = getVehicleStatus(vehicle.status);
  const typeMeta = getPartnerVehicleType(vehicle.type);
  const cost = (value) => `${Number(value ?? 0).toLocaleString('fr-FR')} FCFA`;

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={`${vehicle.brand} ${vehicle.model}`}
      subtitle={vehicle.registrationNumber}
      icon="bi-truck"
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="row g-4">
        <div className="col-12">
          <Divider>Identité</Divider>
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-badge-tm" label="Marque" value={vehicle.brand} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-badge-tm" label="Modèle" value={vehicle.model} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-calendar2-check" label="Année" value={vehicle.year} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-upc-scan" label="Immatriculation" value={vehicle.registrationNumber} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon={typeMeta.icon} label="Type" value={typeMeta.label} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-palette" label="Couleur" value={vehicle.color} />
        </div>

        <div className="col-12">
          <Divider>Exploitation</Divider>
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-speedometer2" label="Kilométrage" value={formatMileage(vehicle.mileage)} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-geo-alt" label="Agence" value={vehicle.agency} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-person-badge" label="Chauffeur actuel" value={vehicle.currentDriver} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-calendar-plus" label="Mise en service" value={formatVehicleDate(vehicle.serviceStartDate)} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <span className="navix-pveh-detail">
            <span className="navix-pveh-detail__icon" aria-hidden="true">
              <i className="bi bi-shield-check" />
            </span>
            <span className="navix-pveh-detail__body">
              <span className="navix-pveh-detail__label">Statut</span>
              <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
            </span>
          </span>
        </div>

        <div className="col-12">
          <Divider>Technique</Divider>
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-wrench-adjustable" label="Dernière maintenance" value={formatVehicleDate(vehicle.lastMaintenance)} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-calendar-event" label="Prochaine maintenance" value={formatVehicleDate(vehicle.nextMaintenance)} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-shield-lock" label="Assurance (expiration)" value={formatVehicleDate(vehicle.insuranceExpiry)} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-clipboard-check" label="Visite technique (expiration)" value={formatVehicleDate(vehicle.inspectionExpiry)} />
        </div>

        <div className="col-12">
          <Divider>Finance</Divider>
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-cash-stack" label="Coût d’acquisition" value={cost(vehicle.costAcquisition)} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-tools" label="Coût maintenance" value={cost(vehicle.costMaintenance)} />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DetailRow icon="bi-fuel-pump" label="Coût carburant" value={cost(vehicle.costFuel)} />
        </div>
      </div>
    </FormModal>
  );
};

export default PartnerVehicleDetailsModal;
