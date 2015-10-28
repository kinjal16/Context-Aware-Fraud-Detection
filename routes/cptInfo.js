var	ejs = require("ejs");
var drillAPI = require('../models/dataHandler');

exports.getCPTSearchPage = function(req, res){
     ejs.renderFile('views/searchCPT.ejs', 
        {code : null, isNewSearch : true},
        function(err, result) {
        if (!err) {
            res.send(result);
        }else {
            res.send('An error occurred');
            console.log(err);
        }
    });	    
};

exports.getCPTDetails = function(req, res){
    var code = req.query.cpt;
    var jsonObject = {};
    var params = {};
    jsonObject.queryType = 'SQL';
    jsonObject.query = "select * from mongo.master.`cpt` where `CPT` like '%" + code + "%'";
    params.body = jsonObject;
    drillAPI.requestDrillAPI(params, function(result){
        if(result){
           ejs.renderFile('views/searchCPT.ejs',
                {code : code, data : result.data.rows, length : result.data.rows.length, isNewSearch : false},
                function(err, result) {
                if (!err) {
                    res.send(result);
                }else {
                    res.send('An error occurred');
                    console.log(err);
                }
            });	
        }else
            res.send("Error occured in connecting to API");
    });
   
};