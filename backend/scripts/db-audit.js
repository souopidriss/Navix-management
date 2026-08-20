import { createPool, getPool } from '../src/database/index.js';

createPool();
const pool = getPool();

const [tables] = await pool.query('SHOW TABLES');
const tableNames = tables.map(t => Object.values(t)[0]);
console.log('=== TABLES (' + tableNames.length + ') ===');
console.log(tableNames.join('\n'));

console.log('\n=== INDEXES ===');
for (const tbl of tableNames) {
  const [indexes] = await pool.query('SHOW INDEX FROM ??', [tbl]);
  for (const idx of indexes) {
    if (idx.Key_name !== 'PRIMARY') {
      console.log(`${tbl}.${idx.Column_name} -> ${idx.Key_name}${idx.Non_unique ? '' : ' (unique)'}`);
    }
  }
}

console.log('\n=== FOREIGN KEYS ===');
const fkQuery = `SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = 'navix_management' AND REFERENCED_TABLE_NAME IS NOT NULL
  ORDER BY TABLE_NAME, COLUMN_NAME`;
const [fks] = await pool.query(fkQuery);
for (const fk of fks) {
  console.log(`${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
}

console.log('\n=== COLUMNS WITHOUT INDEX (candidates) ===');
for (const tbl of tableNames) {
  const [cols] = await pool.query(`SHOW COLUMNS FROM ??`, [tbl]);
  const [indexes] = await pool.query('SHOW INDEX FROM ??', [tbl]);
  const indexedCols = new Set(indexes.map(i => i.Column_name));
  for (const col of cols) {
    if ((col.Field === 'company_id' || col.Field === 'deleted_at' || col.Field === 'status' || col.Field === 'created_at') && !indexedCols.has(col.Field)) {
      console.log(`${tbl}.${col.Field} - NOT INDEXED`);
    }
  }
}

console.log('\n=== TABLES WITHOUT deleted_at ===');
for (const tbl of tableNames) {
  const [cols] = await pool.query(`SHOW COLUMNS FROM ??`, [tbl]);
  if (!cols.some(c => c.Field === 'deleted_at')) {
    console.log(tbl);
  }
}

await pool.end();
process.exit(0);
