
/**
 * Module dependencies.
 */

var application_root = __dirname;
var http = require("http");
var express = require("express");
var path = require("path");
var	ejs = require("ejs");
var request = require("request");
var client = require("./redis-client.js");
var app = express();
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser=require('body-parser');
var multer = require('multer');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var app = module.exports = express();

app.set('port', '3000');
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.use(multer());
global.CONFIG_FILE = require('./configuration/config');

var routes = require('./routes/router');
app.use('/ui',express.static(path.join(__dirname, 'public')));
app.use('/',routes);

client.on('connect', function() {
    console.log('Redis connected');
});

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// all environments
/*app.configure(function () {
	app.use(express.cookieParser());
	app.use(express.session({secret: "LP1988"}));
	app.use(express.bodyParser());
	app.use(express.json());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(application_root, "")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});*/

//require('./routes/router')(app);
/*
>>>>>>> 2a7b267a5e6c78d710f1a3073c3202c81bc24ae4
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});*/