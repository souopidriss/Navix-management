/**
 * Navix Settings — AppearanceSettingsPage
 * --------------------------------------------------------------------------
 * Thème (réutilise useThemeStore — source unique), densité, sidebar et
 * animations (persistés par le service de paramètres). Portée utilisateur.
 */
import { Card } from '@/components/ui';
import { THEME_MODES } from '@/config';
import useThemeStore from '@/store/theme.store';
import { useAppearanceSettings } from '../hooks';
import { appearanceSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldSwitch, FieldSegmented } from '../components';
import { UI_DENSITIES, SIDEBAR_MODES } from '../constants';

const THEME_OPTIONS = [
  { value: THEME_MODES.SYSTEM, label: 'Système', description: 'Suit le mode du système' },
  { value: THEME_MODES.LIGHT, label: 'Clair', description: 'Fond clair en permanence' },
  { value: THEME_MODES.DARK, label: 'Sombre', description: 'Fond sombre en permanence' },
];

const AppearanceSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useAppearanceSettings();
  const setTheme = useThemeStore((state) => state.setTheme);

  const handleThemeChange = (value, setField) => {
    setField('theme', value);
    setTheme(value);
  };

  return (
    <SettingsForm
      title="Paramètres d’apparence"
      subtitle="Personnalisez l’affichage de la plateforme pour votre compte."
      icon="bi-palette"
      section="appearance"
      schema={appearanceSettingsSchema}
      data={data}
      onSave={update}
      onRetry={fetch}
      isSaving={isSaving}
      loading={loading}
      error={error}
      onClearError={clearError}
      contained={false}
    >
      {({ values, errors, setField }) => (
        <div className="row g-3">
          <div className="col-lg-8">
            <Card title="Thème">
              <FieldSegmented
                label="Mode de thème"
                value={values.theme}
                onChange={(value) => handleThemeChange(value, setField)}
                options={THEME_OPTIONS}
                error={errors.theme}
                hint="Appliqué immédiatement, conservé dans vos préférences."
              />
            </Card>

            <Card title="Disposition" className="mt-3">
              <div className="row g-3">
                <div className="col-12">
                  <FieldSegmented
                    label="Sidebar"
                    value={values.sidebarMode}
                    onChange={(value) => setField('sidebarMode', value)}
                    options={SIDEBAR_MODES}
                    error={errors.sidebarMode}
                  />
                </div>
                <div className="col-12">
                  <FieldSegmented
                    label="Densité de l’interface"
                    value={values.density}
                    onChange={(value) => setField('density', value)}
                    options={UI_DENSITIES}
                    error={errors.density}
                  />
                </div>
                <div className="col-12">
                  <FieldSwitch
                    label="Animations de l’interface"
                    value={values.animations}
                    onChange={(value) => setField('animations', value)}
                    hint="Réduit les transitions si vous êtes sensible au mouvement."
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="appearance" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default AppearanceSettingsPage;
