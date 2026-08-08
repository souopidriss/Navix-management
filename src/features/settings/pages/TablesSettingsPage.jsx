/**
 * Navix Settings — TablesSettingsPage
 * --------------------------------------------------------------------------
 * Préférences génériques des tableaux (pagination, densité, tri par défaut,
 * colonnes visibles, en-tête fixe). Configurations volontairement génériques —
 * aucune section par entité (véhicules, chauffeurs, …). Portée utilisateur.
 */
import { Card } from '@/components/ui';
import { useTablesSettings } from '../hooks';
import { tablesSettingsSchema } from '../schemas';
import { SettingsForm, SettingsSectionInfo, FieldSelect, FieldSwitch, FieldCheckboxes, FieldSegmented } from '../components';
import { UI_DENSITIES, TABLE_SORTS, SORT_DIRECTIONS, ITEMS_PER_PAGE_OPTIONS, TABLE_COLUMNS } from '../constants';

const TablesSettingsPage = () => {
  const { data, meta, loading, isSaving, error, clearError, fetch, update } = useTablesSettings();

  return (
    <SettingsForm
      title="Paramètres des tableaux"
      subtitle="Pagination, densité et affichage des listes de la plateforme."
      icon="bi-table"
      section="tables"
      schema={tablesSettingsSchema}
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
            <Card title="Affichage">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Lignes par page"
                    value={String(values.rowsPerPage)}
                    onChange={(value) => setField('rowsPerPage', value)}
                    options={ITEMS_PER_PAGE_OPTIONS.map((count) => ({
                      value: String(count),
                      label: `${count} lignes`,
                    }))}
                    error={errors.rowsPerPage}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Densité par défaut"
                    value={values.density}
                    onChange={(value) => setField('density', value)}
                    options={UI_DENSITIES}
                    error={errors.density}
                  />
                </div>
                <div className="col-12">
                  <FieldSegmented
                    label="En-tête fixe"
                    value={values.stickyHeader ? 'yes' : 'no'}
                    onChange={(value) => setField('stickyHeader', value === 'yes')}
                    options={[
                      { value: 'yes', label: 'Fixe' },
                      { value: 'no', label: 'Défilant' },
                    ]}
                  />
                </div>
              </div>
            </Card>

            <Card title="Tri par défaut" className="mt-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Colonne de tri"
                    value={values.defaultSortBy}
                    onChange={(value) => setField('defaultSortBy', value)}
                    options={TABLE_SORTS}
                    error={errors.defaultSortBy}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FieldSelect
                    label="Sens de tri"
                    value={values.defaultSortDirection}
                    onChange={(value) => setField('defaultSortDirection', value)}
                    options={SORT_DIRECTIONS}
                    error={errors.defaultSortDirection}
                  />
                </div>
              </div>
            </Card>

            <Card title="Colonnes visibles" className="mt-3">
              <FieldCheckboxes
                label="Colonnes affichées dans les listes"
                selected={values.visibleColumns}
                onChange={(value) => setField('visibleColumns', value)}
                options={TABLE_COLUMNS}
                error={errors.visibleColumns}
                hint="S'applique par défaut à toutes les listes ; chaque liste reste personnalisable."
              />
            </Card>
          </div>

          <div className="col-lg-4">
            <SettingsSectionInfo section="tables" updatedAt={meta?.updatedAt} />
          </div>
        </div>
      )}
    </SettingsForm>
  );
};

export default TablesSettingsPage;
