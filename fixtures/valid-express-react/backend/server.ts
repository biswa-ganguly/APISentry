import express from 'express';
const app = express();

app.get('/api/profile', (req, res) => {
  res.json({ id: 1, name: 'Alice' });
});
