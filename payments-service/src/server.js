import express from 'express';
import { orders, payments, createOrder, createPayment, findPaymentByExternalId } from './store.js';
import { reconcile } from './reconcile.js';

export const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, llmMode: process.env.LLM_MODE || 'mock' }));

// ---- Orders (minimal, so payments have something to pay) ----
app.get('/api/orders', (_req, res) => res.json([...orders.values()]));
app.get('/api/orders/:id', (req, res) => {
  const o = orders.get(req.params.id);
  return o ? res.json(o) : res.status(404).json({ error: 'order not found' });
});
app.post('/api/orders', (req, res) => {
  const { customer, total, currency } = req.body ?? {};
  if (!customer || typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ error: 'customer and positive total are required' });
  }
  return res.status(201).json(createOrder({ customer, total, currency }));
});

// ---- Payments ----
// Receives a payment (from a bank feed, a Stripe-style webhook, or a form), then matches it to an order.
app.post('/api/payments', async (req, res) => {
  const { payer, amount, currency = 'EUR', reference = '', externalId } = req.body ?? {};
  if (!payer || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'payer and a positive numeric amount are required' });
  }
  if (externalId) {
    const existing = findPaymentByExternalId(externalId);
    if (existing) return res.status(200).json(existing); // same payment sent twice: do nothing
  }
  const payment = createPayment({ payer, amount, currency, reference: String(reference).slice(0, 300), externalId });
  await reconcile(payment);
  return res.status(201).json(payment);
});

app.get('/api/payments', (req, res) => {
  const list = [...payments.values()];
  res.json(req.query.status ? list.filter((p) => p.status === req.query.status) : list);
});
app.get('/api/payments/:id', (req, res) => {
  const p = payments.get(req.params.id);
  return p ? res.json(p) : res.status(404).json({ error: 'payment not found' });
});

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`ShopDesk payments on http://localhost:${port} (LLM_MODE=${process.env.LLM_MODE || 'mock'})`));
}
