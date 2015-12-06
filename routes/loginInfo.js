var	ejs = require("ejs");
var request = require("request");
var async = require("async");
var drillAPI = require('../models/dataHandler');
var client = require("./redis-client.js");
var monk = require('monk');
var db = monk('52.33.120.205:27017/master');

exports.getLoginPage = function(req, res){
    ejs.renderFile('views/register.ejs', 
       {session : null, msg: null},
       function(err, result) {
       if (!err) {
           res.send(result);
       }else {
           res.send('An error occurred');
           console.log(err);
       }
   });	    
};

exports.logout = function(req, res){
	req.session.destroy();
    ejs.renderFile('views/landing.ejs', 
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
            if(result.data.rows[0].FirstName != undefined){
               req.session.userid = result.data.rows[0]._id;
               req.session.firstname = result.data.rows[0].FirstName;
               req.session.company = result.data.rows[0].Company;
               if (result.data.rows[0].Company == 'admin') {
            	   res.redirect('/cptUpload');
               } else {
            	   res.redirect('/dashboard');
               }
            }else {
            	var msg1 = "Your credentials don't match. Please login again.";
	        	ejs.renderFile('views/register.ejs', 
	        	       {session : null, msg : msg1},
	        	       function(err, result) {
	        	       if (!err) {
	        	           res.send(result);
	        	       }else {
	        	           res.send('An error occurred');
	        	           console.log(err);
	        	       }
	        	});
            }
	     }else
	    	 res.send("Unable to get data from Drill");
    });
   
};



exports.signup = function(req,res) {
	var collection = db.get('signup');
    var info ={};
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
    info["Username"]=req.body.username;
    info["Password"]=req.body.password;
    info["Company"]=req.body.company;
    info["FirstName"]=req.body.firstname;
    info["LastName"]=req.body.lastname;
    
    collection.insert(info);
    req.session.firstname = req.body.firstname;
    req.session.company = req.body.company;
    res.redirect('/dashboard');
};