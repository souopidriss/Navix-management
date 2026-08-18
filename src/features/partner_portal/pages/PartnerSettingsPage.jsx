/**
 * Navix Partner Portal — PartnerSettingsPage (PROMPT 061)
 * --------------------------------------------------------------------------
 * Paramètres de l'espace partenaire : préférences de notification (email,
 * push, in-app), langue et thème. Persistance simulée (service local).
 */
import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Card, Button } from '@/components/ui';
import { PageHeader, LoadingState, ErrorState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { usePartnerContext } from '../hooks/usePartnerContext';
import usePartnerPreferences from '../hooks/usePartnerPreferences';

const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'Français 🇨🇲' },
  { value: 'en', label: 'English' },
];

const THEME_OPTIONS = [
  { value: 'system', label: 'Système' },
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
];

const PartnerSettingsPage = () => {
  const { companyName } = usePartnerContext();
  const { preferences, isLoading, error, refetch, updatePreferences } = usePartnerPreferences();
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef(null);

  useEffect(() => () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current); }, []);

  const handleToggle = async (key) => {
    try {
      await updatePreferences({ [key]: !preferences[key] });
      toast.success('Préférence mise à jour (simulation).');
    } catch (err) {
      toast.error(err?.message || 'Impossible de mettre à jour la préférence.');
    }
  };

  const handleSelect = async (key, value) => {
    try {
      await updatePreferences({ [key]: value });
      toast.success('Paramètre mis à jour (simulation).');
    } catch (err) {
      toast.error(err?.message || 'Impossible de mettre à jour le paramètre.');
    }
  };

  const handleSave = () => {
    setSaved(true);
    toast.success('Paramètres enregistrés (simulation).');
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = window.setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading && !preferences) {
    return (
      <div>
        <PageHeader
          title="Paramètres"
          subtitle="Préférences de votre espace partenaire."
          icon="bi-gear"
          breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Paramètres' }]}
        />
        <LoadingState variant="cards" rows={3} label="Chargement de vos paramètres…" />
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div>
        <PageHeader
          title="Paramètres"
          subtitle="Préférences de votre espace partenaire."
          icon="bi-gear"
          breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Paramètres' }]}
        />
        <ErrorState title="Erreur de chargement" description={error} retry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Paramètres — Navix Partenaire</title>
      </Helmet>

      <PageHeader
        title="Paramètres"
        subtitle={`Préférences de ${companyName || 'votre espace partenaire'} 🇨🇲.`}
        icon="bi-gear"
        breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Paramètres' }]}
      />

      <div className="row g-3">
        <div className="col-lg-6">
          <Card title="Préférences de notification">
            <div className="vstack gap-3">
              <div className="form-check form-switch">
                <input
                  id="partner-pref-email"
                  className="form-check-input"
                  type="checkbox"
                  checked={Boolean(preferences?.email)}
                  onChange={() => handleToggle('email')}
                />
                <label className="form-check-label" htmlFor="partner-pref-email">
                  Notifications par email
                </label>
              </div>
              <div className="form-check form-switch">
                <input
                  id="partner-pref-push"
                  className="form-check-input"
                  type="checkbox"
                  checked={Boolean(preferences?.push)}
                  onChange={() => handleToggle('push')}
                />
                <label className="form-check-label" htmlFor="partner-pref-push">
                  Notifications push
                </label>
              </div>
              <div className="form-check form-switch">
                <input
                  id="partner-pref-inapp"
                  className="form-check-input"
                  type="checkbox"
                  checked={Boolean(preferences?.inApp)}
                  onChange={() => handleToggle('inApp')}
                />
                <label className="form-check-label" htmlFor="partner-pref-inapp">
                  Notifications in-app
                </label>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-lg-6">
          <Card title="Apparence & langue">
            <div className="vstack gap-3">
              <div>
                <label className="form-label small fw-semibold">Langue de l'interface</label>
                <select
                  className="form-select"
                  value={preferences?.language || 'fr'}
                  onChange={(event) => handleSelect('language', event.target.value)}
                  aria-label="Langue de l'interface"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label small fw-semibold">Thème</label>
                <select
                  className="form-select"
                  value={preferences?.theme || 'system'}
                  onChange={(event) => handleSelect('theme', event.target.value)}
                  aria-label="Thème de l'interface"
                >
                  {THEME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex justify-content-end">
                <Button variant="primary" icon={saved ? 'bi-check-lg' : 'bi-save'} onClick={handleSave}>
                  {saved ? 'Enregistré' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PartnerSettingsPage;
