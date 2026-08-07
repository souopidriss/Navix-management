/**
 * Navix Settings — SettingsPage (layout)
 * --------------------------------------------------------------------------
 * Gabarit des paramètres : sidebar de navigation (filtrée par permissions)
 * + contenu de la section courante (Outlet). Charge le bundle complet des
 * paramètres à l'ouverture pour que chaque section s'affiche instantanément.
 *
 * `SettingsLanding` redirige `/dashboard/settings` vers la première section
 * accessible par l'utilisateur.
 */
import { useEffect, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageContainer } from '@/components/core';
import { hasPermission, useRbacStore } from '@/features/rbac';
import { useSettingsStore } from '../store';
import { SETTINGS_SECTIONS } from '../constants';
import { SettingsSidebar } from '../components';
import '../components/settings.css';

/** Redirige vers la première section de paramètres accessible. */
export const SettingsLanding = () => {
  const permissions = useRbacStore((state) => state.permissions);
  const firstRoute = useMemo(
    () =>
      SETTINGS_SECTIONS.find((section) => hasPermission(permissions, section.permission))?.route ??
      SETTINGS_SECTIONS[0].route,
    [permissions],
  );
  return <Navigate to={firstRoute} replace />;
};

const SettingsPage = () => {
  const general = useSettingsStore((state) => state.general);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    if (general === null) {
      fetchSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [general]);

  return (
    <PageContainer>
      <Helmet>
        <title>Paramètres — Navix Management</title>
      </Helmet>
      <div className="settings-page">
        <aside className="settings-page__sidebar" aria-label="Navigation des paramètres">
          <SettingsSidebar />
        </aside>
        <div className="settings-page__content">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
