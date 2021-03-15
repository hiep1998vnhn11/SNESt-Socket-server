const https = require('https');
const fs = require('fs');
const app = require('./app');

const server = https.createServer(
  {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert'),
  },
  app
);
const sockets = require('./sockets');

sockets(server);

const port = process.env.PORT || 5000;
server.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: https://localhost:${port}`);
  /* eslint-enable no-console */
});
