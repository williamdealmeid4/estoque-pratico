import express from 'express';
import pg from 'pg';
import { nextBalance, validProduct } from './domain.mjs';

if (!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL antes de iniciar.');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
app.use(express.json({limit:'32kb'}));
app.use(express.static('public'));
app.get('/api/products', async (_req, res) => {
  try { const result = await pool.query('SELECT * FROM products ORDER BY name'); res.json(result.rows); }
  catch { res.status(500).json({error:'Não foi possível consultar produtos.'}); }
});
app.get('/api/movements', async (_req, res) => {
  try { const result = await pool.query('SELECT m.*, p.name FROM movements m JOIN products p ON p.id=m.product_id ORDER BY m.created_at DESC, m.id DESC LIMIT 50'); res.json(result.rows); }
  catch { res.status(500).json({error:'Não foi possível consultar movimentações.'}); }
});
app.post('/api/products', async (req, res) => {
  const {name, minimum} = req.body ?? {};
  if (!validProduct(name, minimum) || name.trim().length > 120) return res.status(400).json({error:'Informe nome e estoque mínimo válido.'});
  try { const result = await pool.query('INSERT INTO products(name, minimum) VALUES($1,$2) RETURNING *', [name.trim(),minimum]); return res.status(201).json(result.rows[0]); }
  catch { return res.status(500).json({error:'Não foi possível cadastrar o produto.'}); }
});
app.post('/api/products/:id/movements', async (req, res) => {
  const id = Number(req.params.id); const {kind, quantity, note=''} = req.body ?? {};
  if (!Number.isSafeInteger(id) || id <= 0 || typeof note !== 'string' || note.length > 300) return res.status(400).json({error:'Dados inválidos.'});
  const client = await pool.connect().catch(() => null);
  if (!client) return res.status(500).json({error:'Banco indisponível.'});
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT * FROM products WHERE id=$1 FOR UPDATE',[id]);
    if (!found.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({error:'Produto não encontrado.'}); }
    let balance: number;
    try { balance = nextBalance(found.rows[0].quantity, kind, quantity); }
    catch { await client.query('ROLLBACK'); return res.status(400).json({error:'Movimento inválido ou estoque insuficiente.'}); }
    await client.query('UPDATE products SET quantity=$1 WHERE id=$2',[balance,id]);
    await client.query('INSERT INTO movements(product_id,kind,quantity,note) VALUES($1,$2,$3,$4)',[id,kind,quantity,note.trim()]);
    await client.query('COMMIT'); return res.status(201).json({quantity:balance});
  } catch { await client.query('ROLLBACK'); return res.status(500).json({error:'Não foi possível registrar o movimento.'}); }
  finally { client.release(); }
});
const port = Number(process.env.PORT || 3000);
app.listen(port, '127.0.0.1', () => console.log(`Estoque em http://127.0.0.1:${port}`));