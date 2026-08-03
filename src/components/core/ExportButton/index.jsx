/**
 * Navix Core — ExportButton (architecture)
 * --------------------------------------------------------------------------
 * Bouton d'export générique. Deux modes :
 *  1. `onExport` fourni → callback ({ format, data }) — le module gère
 *     l'export (API, génération lourde, PDF serveur…).
 *  2. `onExport` absent mais `data` + `columns` → génération et téléchargement
 *     CSV / JSON 100 % côté client (aucun backend requis).
 * Les formats non couverts (xlsx, pdf) passent par `onExport`.
 *
 * Props :
 *   format     : 'csv' | 'json' | 'xlsx' | 'pdf'    (défaut : 'csv')
 *   filename   : nom du fichier sans extension       (défaut : 'export')
 *   data       : tableau d'objets à exporter (mode client)
 *   columns    : [{ key, label }] — entêtes CSV       (défaut : clés du 1er objet)
 *   onExport   : ({ format, data }) => void
 *   label      : libellé du bouton                    (défaut : 'Exporter')
 *   icon       : icône du bouton                      (défaut : 'bi-download')
 *   loading    : booléen — export en cours
 *   disabled   : booléen
 *   variant    : variante du bouton                   (défaut : 'outline')
 *   size       : taille du bouton                     (défaut : 'md')
 *   className  : classes additionnelles
 *
 * Exemple :
 *   <ExportButton format="csv" data={items} columns={COLUMNS} filename="vehicules" />
 *   <ExportButton format="pdf" onExport={({ format }) => exportPdf(format)} />
 */
import { memo } from 'react';
import { Button } from '@/components/ui';

const MIME_TYPES = {
  csv: 'text/csv;charset=utf-8',
  json: 'application/json;charset=utf-8',
};

const EXTENSIONS = {
  csv: 'csv',
  json: 'json',
  xlsx: 'xlsx',
  pdf: 'pdf',
};

const download = (content, mimeType, filename) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const toCsv = (data = [], columns = []) => {
  const resolved = columns.length > 0 ? columns : (data[0] ? Object.keys(data[0]) : []).map((key) => ({ key, label: key }));
  const escapeCell = (value) => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const header = resolved.map((column) => escapeCell(column.label)).join(',');
  const body = data
    .map((row) => resolved.map((column) => escapeCell(row[column.key])).join(','))
    .join('\n');
  return `${header}\n${body}`;
};

const toJson = (data = []) => JSON.stringify(data, null, 2);

const ExportButton = ({
  format = 'csv',
  filename = 'export',
  data,
  columns = [],
  onExport,
  label = 'Exporter',
  icon = 'bi-download',
  loading = false,
  disabled = false,
  variant = 'outline',
  size = 'md',
  className,
  ...rest
}) => {
  const handleClick = () => {
    if (onExport) {
      onExport({ format, data });
      return;
    }

    if (!Array.isArray(data)) return;

    if (format === 'csv') {
      download(toCsv(data, columns), MIME_TYPES.csv, `${filename}.${EXTENSIONS.csv}`);
    } else if (format === 'json') {
      download(toJson(data), MIME_TYPES.json, `${filename}.${EXTENSIONS.json}`);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      icon={icon}
      loading={loading}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      {...rest}
    >
      {label}
    </Button>
  );
};

export default memo(ExportButton);
