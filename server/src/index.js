const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const apiRouter = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    message: 'Invincible Me API is running',
    docs: '/api/status',
  });
});

app.use('/api', apiRouter);

const distPath = path.resolve(__dirname, '../../client/dist');
const hasClientBuild = fs.existsSync(distPath);

if (hasClientBuild) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    return res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Invincible Me API listening on port ${PORT}`);
});

module.exports = app;

