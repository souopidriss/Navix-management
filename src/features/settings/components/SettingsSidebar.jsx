/**
 * Navix Settings — SettingsSidebar
 * --------------------------------------------------------------------------
 * Navigation entre les sections de paramètres (filtrée par permission) et
 * action « Réinitialiser tous les paramètres » (confirmée via ConfirmDialog).
 * Sur mobile, la liste devient une barre de navigation horizontale défilable.
 */
import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/core';
import { hasPermission, useRbacStore } from '@/features/rbac';
import { useSettingsStore } from '../store';
import { SETTINGS_SECTIONS, SETTINGS_SECTION_GROUPS } from '../constants';
import './settings.css';

const SettingsSidebar = () => {
  const permissions = useRbacStore((state) => state.permissions);
  const resetAllSettings = useSettingsStore((state) => state.resetAllSettings);
  const resetUserPreferences = useSettingsStore((state) => state.resetUserPreferences);
  const savingSection = useSettingsStore((state) => state.savingSection);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [confirmResetPrefs, setConfirmResetPrefs] = useState(false);

  const sections = useMemo(
    () => SETTINGS_SECTIONS.filter((section) => hasPermission(permissions, section.permission)),
    [permissions],
  );

  const groups = useMemo(
    () =>
      SETTINGS_SECTION_GROUPS.map((group) => ({
        ...group,
        items: sections.filter((section) => section.group === group.key),
      })).filter((group) => group.items.length > 0),
    [sections],
  );

  const handleResetAll = async () => {
    const result = await resetAllSettings();
    setConfirmResetAll(false);
    if (result?.success) {
      toast.success('Tous les paramètres ont été réinitialisés.');
    } else {
      toast.error(result?.error || 'Impossible de réinitialiser les paramètres.');
    }
  };

  const handleResetPrefs = async () => {
    const result = await resetUserPreferences();
    setConfirmResetPrefs(false);
    if (result?.success) {
      toast.success('Vos préférences ont été réinitialisées.');
    } else {
      toast.error(result?.error || 'Impossible de réinitialiser vos préférences.');
    }
  };

  return (
    <>
      <nav className="settings-sidebar" aria-label="Sections de paramètres">
        {groups.map((group) => (
          <div className="settings-sidebar__group" key={group.key}>
            <p className="settings-sidebar__group-label">{group.label}</p>
            <ul className="settings-sidebar__list">
              {group.items.map((section) => (
                <li key={section.key}>
                  <NavLink
                    to={section.route}
                    className={({ isActive }) =>
                      `settings-sidebar__link ${isActive ? 'settings-sidebar__link--active' : ''}`.trim()
                    }
                  >
                    <i className={`bi ${section.icon}`} aria-hidden="true" />
                    <span>{section.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="settings-sidebar__footer">
          <Button
            variant="outline"
            size="sm"
            icon="bi-person-gear"
            fullWidth
            loading={savingSection === 'user-preferences'}
            disabled={savingSection !== null && savingSection !== 'user-preferences'}
            onClick={() => setConfirmResetPrefs(true)}
          >
            Réinitialiser mes préférences
          </Button>
          <p className="settings-sidebar__footer-note">
            Rétablit uniquement vos préférences (thème, langue, formats, tableaux, notifications).
          </p>
          <Button
            variant="outline"
            size="sm"
            icon="bi-arrow-counterclockwise"
            fullWidth
            loading={savingSection === 'all'}
            disabled={savingSection !== null && savingSection !== 'all'}
            onClick={() => setConfirmResetAll(true)}
          >
            Réinitialiser tout
          </Button>
          <p className="settings-sidebar__footer-note">
            Rétablit les valeurs par défaut de toutes les sections.
          </p>
        </div>
      </nav>

      <ConfirmDialog
        open={confirmResetPrefs}
        onClose={() => setConfirmResetPrefs(false)}
        title="Réinitialiser vos préférences"
        message="Vos préférences personnelles (thème, langue, formats, tableaux, notifications) repasseront à leurs valeurs par défaut. Les paramètres de l’entreprise et de la plateforme ne sont pas modifiés."
        confirmLabel="Réinitialiser mes préférences"
        confirmVariant="danger"
        icon="bi-person-gear"
        loading={savingSection === 'user-preferences'}
        onConfirm={handleResetPrefs}
      />

      <ConfirmDialog
        open={confirmResetAll}
        onClose={() => setConfirmResetAll(false)}
        title="Réinitialiser tous les paramètres"
        message="Toutes les sections (entreprise, flotte, maintenance, carburant, notifications…) repasseront à leurs valeurs par défaut. Cette action est simulée, mais les valeurs actuellement affichées seront perdues."
        confirmLabel="Réinitialiser tout"
        confirmVariant="danger"
        icon="bi-exclamation-triangle"
        loading={savingSection === 'all'}
        onConfirm={handleResetAll}
      />
    </>
  );
};

export default SettingsSidebar;
