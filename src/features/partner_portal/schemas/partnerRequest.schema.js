/**
 * Navix Partner Portal — Schema demande partenaire
 * ------------------------------------------------
 * Validation Zod pour le refus, l'annulation et la conversion de mission.
 */
import { z } from 'zod';

export const rejectRequestSchema = z.object({
  rejectionReason: z.string().min(1, 'Le motif de refus est requis.').max(500),
});

export const cancelRequestSchema = z.object({
  cancelReason: z.string().max(500).optional(),
});

export const convertToMissionSchema = z.object({
  vehicleId: z.string().min(1, 'Le véhicule est requis.'),
  driverId: z.string().optional(),
  notes: z.string().max(1000).optional(),
});
