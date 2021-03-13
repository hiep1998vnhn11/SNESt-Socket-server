const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { get, set } = require('./redis');

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
  const message = await get(req.params.key).catch((err) => {
    if (err) console.error(err);
  });

  // send response
  res.send({
    status: 200,
    message,
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
