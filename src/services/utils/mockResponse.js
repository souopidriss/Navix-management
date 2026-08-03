/**
 * Navix Services — Résolution d'une réponse simulée (mode mock).
 * Attends `latency` ms puis retourne `data` — ou rejette `error` si fourni.
 * Permet aux services de restituer des Promises fidèles à la future API sans
 * appeler de backend.
 *
 * @param {unknown} data — données retournées par la future API
 * @param {{ latency?: number, error?: Error }} [options]
 */
import { delay } from './delay';

export const mockResponse = async (data, { latency = 600, error = null } = {}) => {
  await delay(latency);

  if (error) throw error;

  return data;
};
