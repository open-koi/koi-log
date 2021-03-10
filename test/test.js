const Express = require('express');
const { joinKoi } = require('../dist/index.js');

var app = new Express ();

// add koi tasks
joinKoi(app, "/home/al/");

// start the server listener
app.listen(process.env.PORT || 3000, () => {
  console.log(`[app] started on http://localhost:${process.env.PORT || 3000}`);
});