import express from 'express';
const app = express();
const apiRouter = express.Router();
const usersRouter = express.Router();

usersRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});

apiRouter.use('/users', usersRouter);
app.use('/api/v1', apiRouter);
