
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

app.set('port', '3000');
app.set('views', path.join(__dirname, 'views'));
// all environments
app.configure(function () {
	app.use(express.cookieParser());
	app.use(express.session({secret: "LP1988"}));
	app.use(express.bodyParser());
	app.use(express.json());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(application_root, "")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
//app.listen(4297);

global.CONFIG_FILE = require('./configuration/config');

require('./routes/router')(app);

client.on('connect', function() {
    console.log('Redis connected');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});