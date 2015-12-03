var	ejs = require("ejs");
var drillAPI = require('../models/dataHandler');
var json2csv = require('json2csv');
var fs = require('fs');
var request = require('request');
var monk = require('monk');
var db = monk('52.33.120.205:27017/master');

exports.getCPTSearchPage = function(req, res){
    
     ejs.renderFile('views/deleteCPT.ejs', 
        {code : null, descrCPT : null, rangeFrom : null, rangeTo : null, isNewSearch : true, deleteSuccess : false},
        function(err, result) {
        if (!err) {
            res.send(result);
        }else {
            res.send('An error occurred');
            console.log(err);
        }
    });	    
};

exports.getCPTData = function(req, res){

  var file = __dirname + '/cptDataFile.csv';

  res.download(file);
};


exports.getCPTDetails = function(req, res){
    var option = req.query.cpttype;
    var jsonObject = {};
    var params = {};
    var code = null;
    var descr = null;
    var rangeFrom = null;
    var rangeTo = null;
    var fields = ['CPT', 'Description', 'Cost'];
   
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
            jsonObject.query = "select * from mongo.master.`cpt` where `CPT` between '" + rangeFrom + "' and '" + rangeTo + "'" ;
            break;
            
    }
   // jsonObject.query = "select * from mongo.master.`cpt` where `CPT` like '%" + code + "%'";
    params.body = jsonObject;
    console.log("params:" + params);
    console.log("query:" + jsonObject.query);
    drillAPI.requestDrillAPI(params, function(result){
        if(result){
            console.log(result);
            json2csv({ data: result.data.rows, fields: fields }, function(err, csv) {
              if (err) console.log(err);
              console.log(csv);

              var file = __dirname + '/cptDataFile.csv';

                console.log(file);
              fs.writeFile(file, csv, function(err) {
                if (err) throw err;
                console.log('file saved');                
              });
            }); 
           ejs.renderFile('views/deleteCPT.ejs',
                {code : code, descrCPT : descr, rangeFrom : rangeFrom, rangeTo : rangeTo, data : result.data.rows, length : result.data.rows.length, isNewSearch : false, deleteSuccess : false},
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

exports.deleteCPT = function(req, res){
    var code = req.body.cpt;
    var collection = db.get('cpt');
    var info ={};
	info["CPT"]=req.body.cpt;
    collection.remove(info);
     ejs.renderFile('views/deleteCPT.ejs',
                {code : null, descrCPT : null, rangeFrom : null, rangeTo : null, data : null, length : null, isNewSearch : true, deleteSuccess : true},
                function(err, result) {
                if (!err) {
                    res.send(result);
                }else {
                    res.send('An error occurred');
                    console.log(err);
                }
            });	
};