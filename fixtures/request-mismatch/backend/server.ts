import express from 'express';
import { z } from 'zod';

const app = express();

const registerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email()
});

app.post('/api/register', (req, res) => {
  const { firstName, lastName, email } = req.body;
  res.json({ success: true });
});
