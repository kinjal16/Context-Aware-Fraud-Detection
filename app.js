
/**
 * Module dependencies.
 */

var application_root = __dirname;
var http = require("http");
var express = require("express");
var path = require("path");
var	ejs = require("ejs");
var request = require("request");
//var client = require("./routes/redis-client.js");
var app = express();
//var favicon = require('serve-favicon');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser=require('body-parser');
var multer = require('multer');
var methodOverride = require('method-override');
var session = require('express-session');
var errorhandler = require('errorhandler');
var app = module.exports = express();

app.set('port', '3000');
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({ resave: true,
    saveUninitialized: true,
    secret: 'uwotm8' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.use(multer());
global.CONFIG_FILE = require('./configuration/config');

var routes = require('./routes/router');
app.use('/ui',express.static(path.join(__dirname, 'public')));
app.use('/',routes);

/*client.on('connect', function() {
    console.log('Redis connected');
});

client.on('error', function (er) {
	  console.trace('Module A') // [1]
	  console.error(er.stack) // [2]
});*/
var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});