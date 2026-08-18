import { memo } from 'react';
import { getVehicleGroup } from '@/features/vehicles/constants';

const FleetVehicleImage = ({ vehicle, size = 'md' }) => {
  const group = getVehicleGroup(vehicle?.group);
  return (
    <span className={`navix-fleet-img navix-fleet-img--${size}`} aria-hidden="true">
      <i className={`bi ${group?.icon || 'bi-truck'}`} />
    </span>
  );
};

export default memo(FleetVehicleImage);
