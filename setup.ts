import { readFile } from 'node:fs/promises';
import pg from 'pg';
if (!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try { await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8')); console.log('Banco preparado.'); } finally { await pool.end(); }