const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const client = require('./redis');

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ origin: 'https://localhost:8080' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SNESt Socket Server Api!',
  });
});

app.get('/:key', async (req, res) => {
  const message = await client.get(`user:${req.params.key}`);

  // send response
  res.send({
    status: 200,
    message,
    key: req.params.key
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
