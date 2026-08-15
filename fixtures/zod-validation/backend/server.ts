import express from 'express';
import { z } from 'zod';

const itemSchema = z.object({
  name: z.string(),
  price: z.number()
});

const app = express();
app.post('/api/items', (req, res) => {
  res.json({ success: true });
});
