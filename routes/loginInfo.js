var	ejs = require("ejs");
var request = require("request");
var drillAPI = require('../models/dataHandler');
var client = require("../redis-client.js");

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

exports.getCPTCache = function(req,res){
	var jsonObject = {};
    var params = {};
    
    jsonObject.queryType = 'SQL';
    jsonObject.query = "select * from mongo.master.`cpt`";
    params.body = jsonObject;
    drillAPI.requestDrillAPI(params, function(result){
        if(result){
        	for (var i = 0; i < result.data.rows.length; i++) {
        		client.hmset(result.data.rows[i].CPT,{description:result.data.rows[i].Description, cost:result.data.rows[i].Cost});
        	}
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
           ejs.renderFile('views/searchCPT.ejs',
                {session : req.session, code : null, isNewSearch : true},
                function(err, result) {
                if (!err) {
                    res.send(result);
                }else {
                    res.send('An error occurred');
                    console.log(err);
                }
            });	
        }else
            res.send("Invalid Login Details");
    });
   
};
