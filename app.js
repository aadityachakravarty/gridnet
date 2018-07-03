const express = require('express');
const bodyParser = require('body-parser');
const helmet = require("helmet");
const compress = require("compression");
const morgan = require("morgan");

/* Global Variables */
global.__base = __dirname + '/';

const config = require(__base + 'system/config');

/* Express Instance */
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

if(global.xe.morgan != undefined) {
  app.use(morgan(global.xe.morgan));
}

app.set('signature', global.xe.sign);
app.set('salt', global.xe.salt);
app.set('cbLink', global.xe.cbLink);

if(global.xe.type === "production") {
  app.use(compress());
  app.use(helmet());
  app.enable('trust proxy');
  if(global.httpsRedir) {
    app.get('*', (req, res, next) => {
        if (req.get('x-forwarded-proto') != "https") {
            res.set('x-forwarded-proto', 'https');
            res.redirect('https://' + req.get('host') + req.url);
        } else {
            next();
        }
    });
  }
}

/* Cross-Origin Access */
if (config.settings.origin.access) {
  const x_handler = require(__base+'modules/misc/xors');
  app.use(x_handler);
}

/* API Routes */
app.use('/auth', require('./routes/auth'));

module.exports = app;
