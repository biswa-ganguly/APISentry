import express from 'express';
const app = express();

app.put('/api/profile', (req, res) => {
  res.json({ success: true });
});
