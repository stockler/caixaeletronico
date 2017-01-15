'use strict';

let SwaggerExpress = require('swagger-express-mw');
let app = require('express')();
let compression = require('compression')
let session = require('express-session');
let bodyParser = require('body-parser');
let path = require('path');
let helmet = require('helmet');


app.use(compression());

app.use(helmet());

app.set('trust proxy', 1) // trust first proxy
app.use( session({
   secret : 'GSW_ATM!!@.@',
   name : 'sessionId',
   proxy: true,
   resave: true,
   saveUninitialized: true
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'https://caixaeletronico-frontend.herokuapp.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, X-UA-Compatible, X-XSS-Protection');
  next();
});

module.exports = app; // for testing

let config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }
  // install middleware
  swaggerExpress.register(app);

  let port = process.env.PORT || 10010;
  app.listen(port);
});
