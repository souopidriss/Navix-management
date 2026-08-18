/**
 * Navix Auth — RegisterForm
 * --------------------------------------------------------------------------
 * Formulaire d'inscription partagé entre Client, Chauffeur et Partenaire.
 * Affiche les champs communs (prénom, nom, email, mot de passe, confirmation)
 * et les champs spécifiques au rôle passé en prop `roleType`.
 *
 * Props :
 *   roleType : 'client' | 'driver' | 'partner'
 *   schema   : schéma Zod de validation
 *   defaults : valeurs par défaut
 */
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Alert, Button } from '@/components/ui';
import { TextInput, SelectInput } from '@/components/ui';
import { resolveLandingRoute } from '@/routes/route.constants';
import { useAuthStore } from '../store';
import { useZodForm } from '../hooks';
import EmailInput from './EmailInput';
import PasswordInput from './PasswordInput';

const SECTORS = [
  { value: 'transport', label: 'Transport de marchandises' },
  { value: 'logistique', label: 'Logistique' },
  { value: 'construction', label: 'Construction' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'mining', label: 'Exploitation minière' },
  { value: 'energy', label: 'Énergie' },
  { value: 'other', label: 'Autre' },
];

const PARTNER_TYPES = [
  { value: 'station', label: 'Station-service' },
  { value: 'workshop', label: 'Atelier de maintenance' },
  { value: 'depot', label: 'Dépôt de carburant' },
  { value: 'other', label: 'Autre' },
];

const COUNTRIES = [
  { value: 'Cameroun', label: 'Cameroun' },
  { value: 'Gabon', label: 'Gabon' },
  { value: 'Congo', label: 'Congo' },
  { value: 'RDC', label: 'Rép. Dém. du Congo' },
  { value: 'Tchad', label: 'Tchad' },
  { value: 'Centrafrique', label: 'Centrafrique' },
  { value: 'Guinée Équatoriale', label: 'Guinée Équatoriale' },
];

const RegisterForm = ({ roleType, schema, defaults }) => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const { values, errors, isSubmitting, setField, handleSubmit } = useZodForm({
    schema,
    defaultValues: defaults,
    onSubmit: async (data) => {
      const result = await register(roleType, data);
      if (result.success) {
        toast.success('Compte créé avec succès. Connexion automatique…');
        const currentRole = useAuthStore.getState().currentRole;
        navigate(resolveLandingRoute(currentRole), { replace: true });
      }
    },
  });

  return (
    <form className="d-grid gap-3" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert variant="danger" closable onClose={clearError}>
          {error}
        </Alert>
      )}

      <div className="row g-3">
        <div className="col-6">
          <TextInput
            id={`${roleType}-firstName`}
            label="Prénom"
            value={values.firstName}
            onChange={(v) => setField('firstName', v)}
            error={errors.firstName}
            placeholder="Votre prénom"
            icon="bi-person-fill"
            required
          />
        </div>
        <div className="col-6">
          <TextInput
            id={`${roleType}-lastName`}
            label="Nom"
            value={values.lastName}
            onChange={(v) => setField('lastName', v)}
            error={errors.lastName}
            placeholder="Votre nom"
            required
          />
        </div>
      </div>

      <EmailInput
        id={`${roleType}-email`}
        label="Adresse email"
        value={values.email}
        onChange={(v) => setField('email', v)}
        error={errors.email}
        placeholder="vous@entreprise.com"
      />

      <PasswordInput
        id={`${roleType}-password`}
        label="Mot de passe"
        value={values.password}
        onChange={(v) => setField('password', v)}
        error={errors.password}
        autoComplete="new-password"
        placeholder="Min. 8 caractères"
        hint="Au moins 8 caractères, 1 majuscule et 1 chiffre."
      />

      <PasswordInput
        id={`${roleType}-confirmPassword`}
        label="Confirmer le mot de passe"
        value={values.confirmPassword}
        onChange={(v) => setField('confirmPassword', v)}
        error={errors.confirmPassword}
        autoComplete="new-password"
        placeholder="Retapez votre mot de passe"
      />

      {roleType === 'client' && (
        <>
          <TextInput
            id={`${roleType}-companyName`}
            label="Nom de l'entreprise"
            value={values.companyName}
            onChange={(v) => setField('companyName', v)}
            error={errors.companyName}
            placeholder="Ex: Transports Express"
            icon="bi-building"
            required
          />
          <SelectInput
            id={`${roleType}-sector`}
            label="Secteur d'activité"
            value={values.sector}
            onChange={(v) => setField('sector', v)}
            error={errors.sector}
            options={SECTORS}
            placeholder="Choisir un secteur"
            icon="bi-briefcase"
            required
          />
        </>
      )}

      {roleType === 'partner' && (
        <>
          <TextInput
            id={`${roleType}-companyName`}
            label="Nom de la station"
            value={values.companyName}
            onChange={(v) => setField('companyName', v)}
            error={errors.companyName}
            placeholder="Ex: Station Oyem"
            icon="bi-fuel-pump"
            required
          />
          <SelectInput
            id={`${roleType}-partnerType`}
            label="Type de partenaire"
            value={values.partnerType}
            onChange={(v) => setField('partnerType', v)}
            error={errors.partnerType}
            options={PARTNER_TYPES}
            placeholder="Choisir un type"
            icon="bi-tag"
            required
          />
        </>
      )}

      <div className="row g-3">
        <div className="col-6">
          <TextInput
            id={`${roleType}-city`}
            label="Ville"
            value={values.city}
            onChange={(v) => setField('city', v)}
            error={errors.city}
            placeholder="Ex: Douala"
            icon="bi-geo-alt"
            required
          />
        </div>
        <div className="col-6">
          <SelectInput
            id={`${roleType}-country`}
            label="Pays"
            value={values.country}
            onChange={(v) => setField('country', v)}
            error={errors.country}
            options={COUNTRIES}
            placeholder="Choisir un pays"
            required
          />
        </div>
      </div>

      <Button type="submit" size="lg" fullWidth loading={isLoading} disabled={isSubmitting}>
        Créer mon compte
      </Button>
    </form>
  );
};

export default RegisterForm;
