/**
 * Navix Reports — ReportExportButton
 * --------------------------------------------------------------------------
 * Bouton d'export du module : sélecteur de format (CSV, JSON, XLSX, PDF)
 * + ExportButton Core.
 *   - CSV / JSON : générés côté client (ExportButton Core, données + colonnes).
 *   - XLSX / PDF : simulés — déclenche `onExport` si fourni, sinon bouton
 *     désactivé avec mention « architecture préparée ».
 *
 * Props :
 *   data          : lignes à exporter
 *   columns       : [{ key, label }] — entêtes CSV / sélection des champs
 *   filename      : nom de fichier sans extension
 *   formats       : [{ value, label }]                    (défaut : EXPORT_FORMATS)
 *   defaultFormat : format initial                         (défaut : 'csv')
 *   onExport      : ({ format, data }) => void — export personnalisé
 *   loading       : booléen — export en cours
 *   disabled      : booléen
 *   label         : libellé du bouton                      (défaut : 'Exporter')
 *   size          : 'sm' | 'md' | 'lg'                     (défaut : 'md')
 */
import { useState } from 'react';
import { ExportButton } from '@/components/core';
import { EXPORT_FORMATS } from '../constants';
import './ReportComponents.css';

const SIMULATED_FORMATS = ['xlsx', 'pdf'];

const ReportExportButton = ({
  data,
  columns = [],
  filename = 'rapport',
  formats = EXPORT_FORMATS,
  defaultFormat = 'csv',
  onExport,
  loading = false,
  disabled = false,
  label = 'Exporter',
  size = 'md',
}) => {
  const [format, setFormat] = useState(defaultFormat);
  const isSimulated = SIMULATED_FORMATS.includes(format);

  return (
    <div className="navix-report-export">
      <label className="visually-hidden" htmlFor="navix-report-export-format">
        Format d'export
      </label>
      <select
        id="navix-report-export-format"
        className="form-select form-select-sm"
        value={format}
        onChange={(event) => setFormat(event.target.value)}
        disabled={disabled}
      >
        {formats.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ExportButton
        format={format}
        data={data}
        columns={columns}
        filename={filename}
        onExport={onExport}
        loading={loading}
        disabled={disabled || (isSimulated && !onExport)}
        label={label}
        size={size}
        title={
          isSimulated && !onExport
            ? 'L’export XLSX/PDF est simulé — architecture préparée pour le backend.'
            : undefined
        }
      />
    </div>
  );
};

export default ReportExportButton;
