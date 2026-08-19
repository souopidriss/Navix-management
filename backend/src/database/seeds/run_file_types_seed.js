import { createPool, closePool, getPool } from '../index.js';

const seedData = [
  ['01FILETYPE00000000000001', 'PDF', 'Document PDF', '[".pdf"]', '["application/pdf"]', 20971520],
  ['01FILETYPE00000000000002', 'PNG', 'Image PNG', '[".png"]', '["image/png"]', 10485760],
  ['01FILETYPE00000000000003', 'JPEG', 'Image JPEG', '[".jpg",".jpeg"]', '["image/jpeg"]', 10485760],
  ['01FILETYPE00000000000004', 'WEBP', 'Image WebP', '[".webp"]', '["image/webp"]', 10485760],
  ['01FILETYPE00000000000005', 'DOC', 'Document Word', '[".doc",".docx"]', '["application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"]', 15728640],
  ['01FILETYPE00000000000006', 'XLS', 'Tableur Excel', '[".xls",".xlsx"]', '["application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]', 15728640],
  ['01FILETYPE00000000000007', 'CSV', 'Fichier CSV', '[".csv"]', '["text/csv","application/csv"]', 10485760],
  ['01FILETYPE00000000000008', 'TXT', 'Fichier texte', '[".txt"]', '["text/plain"]', 5242880],
  ['01FILETYPE00000000000009', 'ZIP', 'Archive compressée', '[".zip"]', '["application/zip","application/x-zip-compressed"]', 52428800],
];

async function seed() {
  createPool();
  const pool = getPool();

  for (const [id, title, desc, exts, mimes, maxSize] of seedData) {
    await pool.query(
      `INSERT INTO file_types (id, title, description, extensions, mime_types, max_size, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE title = VALUES(title)`,
      [id, title, desc, exts, mimes, maxSize]
    );
  }

  console.log(`Seeded ${seedData.length} file types.`);
  await closePool();
}

seed().catch((err) => { console.error(err); process.exit(1); });
