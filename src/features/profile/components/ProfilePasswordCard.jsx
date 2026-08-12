/**
 * Navix Profile — ProfilePasswordCard
 * --------------------------------------------------------------------------
 * Mot de passe : aucun module de changement de mot de passe n'existe encore
 * dans le dashboard (la page Sécurité redirige vers le futur module dédié).
 * Un lien cohérent est proposé vers le flux public « Mot de passe oublié »
 * (Forgot / Reset Password) existant — aucune fausse API n'est créée.
 */
import { Card, Button } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';

const ProfilePasswordCard = () => (
  <Card title="Sécurité" subtitle="Gérez l'accès à votre compte.">
    <p className="navix-profile-password__text">
      Le changement de mot de passe s'effectue via le flux de réinitialisation : vous recevrez un lien
      sécurisé sur votre adresse email.
    </p>
    <Button variant="outline" size="sm" icon="bi-key" fullWidth href={ROUTES.FORGOT_PASSWORD}>
      Réinitialiser mon mot de passe
    </Button>
  </Card>
);

export default ProfilePasswordCard;
