var	ejs = require("ejs");
var cpt = require('./cptInfo');
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
    
   // app.get('/searchCPTRange', cpt.getCPTRange);
    
    //app.get('/searchCPTByRange', cpt.getCPTByRange);
//}

module.exports = router;