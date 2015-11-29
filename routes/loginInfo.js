var	ejs = require("ejs");
var request = require("request");
var async = require("async");
var drillAPI = require('../models/dataHandler');
var client = require("./redis-client.js");

exports.getLoginPage = function(req, res){
    ejs.renderFile('views/register.ejs', 
       {session : null},
       function(err, result) {
       if (!err) {
           res.send(result);
       }else {
           res.send('An error occurred');
           console.log(err);
       }
   });	    
};

exports.getCPTCache = function(req, res, next){
	var jsonObject = {};
    var params = {};
    
    jsonObject.queryType = 'SQL';
    jsonObject.query = "select * from mongo.master.`cpt`";
    params.body = jsonObject;
    drillAPI.requestDrillAPI(params, function(result){
        if(result){
        	async.forEach(result.data.rows, function(item, callback) {
        		client.hmset(item.CPT, {description: item.Description, cost:item.Cost});
        		callback();
        	}, function(err){
                if(err) {
                    console.log(err);
                    next();
                }
                else{
                	next();
                }                                
        	});          
        }
    });
};

exports.getLoginDetails= function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var jsonObject = {};
    var params = {};
    if(req.session.userid == undefined)
	{
		req.session.userid = "";
	}
	if(req.session.firstname == undefined)
	{
		req.session.firstname = "";
	}
	if(req.session.company == undefined)
	{
		req.session.company = "";
	}
    jsonObject.queryType = 'SQL';
    jsonObject.query = "select * from mongo.master.`signup` where `Username` = '" + username + "' and `Password` = '" + password + "'";
    params.body = jsonObject;
    drillAPI.requestDrillAPI(params, function(result){
        if(result){
           req.session.userid = result.data.rows[0]._id;
           req.session.firstname = result.data.rows[0].FirstName;
           req.session.company = result.data.rows[0].Company;
           res.redirect('/dashboard');
        }else
            res.send("Invalid Login Details");
    });
   
};
