/**
 * Full Express app (scripts/tests). Production entry is ../server.js (health before route load).
 */
const express = require('express');
const app = express();
app.set('trust proxy', 1);
require('./routesSetup')(app);
module.exports = app;
