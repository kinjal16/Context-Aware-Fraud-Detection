var	ejs = require("ejs");
var cpt = require('./cptInfo');
var login = require('./loginInfo');
var client = require("./redis-client.js");
var dashboard = require('./dashboard');
var express = require('express');
var path = require('path');

var router = express.Router();

//module.exports = function(app){

	router.get('/', function (req, res) {
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
    
    router.get('/dashboard', dashboard.getDashboard);
    
    router.get('/searchCPT', cpt.getCPTSearchPage);
    
    router.get('/searchCPTByCode', cpt.getCPTDetails);
    
    router.get('/login', login.getLoginPage);
    
    router.post('/validateUser', login.getLoginDetails);

module.exports = router;
