/**
 * Navix Agencies — AgencyVehicles
 * --------------------------------------------------------------------------
 * Liste des véhicules rattachés à une agence : immatriculation, marque /
 * modèle, groupe (A→G), statut, kilométrage et carburant. Les badges
 * proviennent des constantes métier du module Véhicules.
 *
 * Props :
 *   vehicles : liste des véhicules de l'agence
 *   onView   : (id: string) => void — ouvre le détail du véhicule
 */
import { Badge, Button } from '@/components/ui';
import { EmptyState } from '@/components/core';
import {
  getVehicleStatus,
  getVehicleGroup,
  getFuelType,
  formatMileage,
} from '@/features/vehicles';
import './AgencyVehicles.css';

const AgencyVehicles = ({ vehicles = [], onView }) => (
  <div className="navix-agency-vehicles">
    {vehicles.length === 0 ? (
      <EmptyState
        compact
        icon="bi-truck"
        title="Aucun véhicule"
        description="Aucun véhicule n’est actuellement rattaché à cette agence."
      />
    ) : (
      <ul className="list-group list-group-flush navix-agency-vehicles__list">
        {vehicles.map((vehicle) => {
          const status = getVehicleStatus(vehicle.status);
          const group = getVehicleGroup(vehicle.group);
          const fuel = getFuelType(vehicle.fuelType);

          return (
            <li
              key={vehicle.id}
              className="list-group-item d-flex align-items-center gap-3 px-0 navix-agency-vehicles__item"
            >
              <span className="navix-agency-vehicles__icon" aria-hidden="true">
                <i className="bi bi-truck" />
              </span>
              <span className="flex-grow-1 min-w-0">
                <span className="navix-agency-vehicles__main">
                  {vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() || '—'}
                </span>
                <span className="navix-agency-vehicles__sub d-block">
                  {[vehicle.brand, vehicle.model, vehicle.category].filter(Boolean).join(' · ') || '—'}
                </span>
              </span>
              <span className="navix-agency-vehicles__meta text-end">
                <Badge variant={group.variant} soft>
                  {group.label}
                </Badge>
                <Badge variant={status.variant} soft className="ms-1">
                  {status.label}
                </Badge>
              </span>
              <span className="navix-agency-vehicles__mileage tabular-nums">
                {formatMileage(vehicle.mileage)}
                <span className="navix-agency-vehicles__fuel d-block">{fuel.label}</span>
              </span>
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="bi-eye"
                  onClick={() => onView(vehicle.id)}
                  title="Voir le détail"
                  aria-label={`Voir le détail de ${vehicle.registrationNumber || vehicle.brand}`}
                />
              )}
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

export default AgencyVehicles;
