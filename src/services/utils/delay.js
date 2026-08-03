/**
 * Navix Services — Simule la latence réseau pour les services mockés.
 * Le backend n'existant pas encore, chaque réponse simulée passe par un délai
 * afin de reproduire un comportement réaliste (loading, spinner, etc.).
 */
export const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));
