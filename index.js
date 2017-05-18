var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');
var nconf = require('nconf');

// self define js library
var router = require("./src/router.js");
var SystemConfig = require("./src/config.js");

nconf.argv()
       .env()
       .defaults(SystemConfig.getConfig());


var app = express();

// all environments
app.set('port', nconf.get('port') || 18080);
app.set('views', path.join(__dirname, 'jade'));
app.set('view engine', 'jade');
app.use(favicon(path.join(__dirname, 'static/favicon.ico')));
app.use(logger(nconf.get("logger:format") || 'dev'));
app.use(methodOverride());
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(multer());

if('product' == app.get('env')){
  app.set("views", path.join(__dirname, 'jade_dist'));
  app.use(express.static(path.join(__dirname, 'static_dist')))
}
app.use(express.static(path.join(__dirname, 'static')));

if ('development' == app.get('env')) {
  app.use(errorHandler());
}

router.register(app);

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});