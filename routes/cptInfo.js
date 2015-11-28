var	ejs = require("ejs");
var drillAPI = require('../models/dataHandler');

exports.getCPTSearchPage = function(req, res){
     ejs.renderFile('views/searchCPT.ejs', 
        {code : null, descrCPT : null, rangeFrom : null, rangeTo : null, isNewSearch : true},
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
    var option = req.query.cpttype;
    var jsonObject = {};
    var params = {};
    var code = null;
    var descr = null;
    var rangeFrom = null;
    var rangeTo = null;
    jsonObject.queryType = 'SQL';
    console.log(option);
    switch(option){
        case 'code' : 
             code = req.query.cpt;
             jsonObject.query = "select * from mongo.master.`cpt` where `CPT` like '%" + code + "%'";
             break;
        case 'descr' :
             descr = req.query.cptdescr;
             jsonObject.query = "select * from mongo.master.`cpt` where `Description` like '%" + descr + "%'";
             break;
        case 'codeRange' :
            rangeFrom = req.query.from;
            rangeTo = req.query.to;
            jsonObject.query = "select * from mongo.master.`cpt` where `CPT` between " + rangeFrom + " and " + rangeTo ;
            break;
            
    }
   // jsonObject.query = "select * from mongo.master.`cpt` where `CPT` like '%" + code + "%'";
    params.body = jsonObject;
    console.log("params:" + params);
    console.log("query:" + jsonObject.query);
    drillAPI.requestDrillAPI(params, function(result){
        if(result){
            console.log(result);
           ejs.renderFile('views/searchCPT.ejs',
                {code : code, descrCPT : descr, rangeFrom : rangeFrom, rangeTo : rangeTo, data : result.data.rows, length : result.data.rows.length, isNewSearch : false},
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