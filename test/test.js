const Express = require('express');
// import { config } from 'dotenv';
const { joinKoi } = require('../dist/index.js');

// config();

var app = new Express ();

// add koi tasks
joinKoi(app);

// start the server listener
app.listen(process.env.PORT || 3000, () => {
  log.info(`[app] started on http://localhost:${process.env.PORT || 3000}`);
});