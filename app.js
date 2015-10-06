
/**
 * Module dependencies.
 */

var application_root = __dirname;
var http = require("http");
var express = require("express");
var routes = require('./routes');
var user = require('./routes/user');
var path = require("path");
var	ejs = require("ejs");
var app = express();
var request = require("request");
//var mysql = require("./mysql_connect");

var app = express();
app.set('views', path.join(__dirname, 'views'));
// all environments
app.configure(function () {
	app.use(express.cookieParser());
	//app.use(express.session({secret: '1234567890QWERTY',store : new MySQLStore(options)}));
	app.use(express.bodyParser());
	app.use(express.json());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(application_root, "")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.listen(4297);

app.get('/', function (req, res) {
	ejs.renderFile('views/landing.ejs',
			function(err, result) {
			// render on success
			if (!err) {
				res.end(result);
			}
			// render or error
			else {
				res.end('An error occurred');
				console.log(err);
			}
	});		
});