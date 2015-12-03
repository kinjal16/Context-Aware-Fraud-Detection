var	ejs = require("ejs");
var request = require("request");
var monk = require('monk');
var db = monk('52.33.120.205:27017/master');
var drillAPI = require('../models/dataHandler');

exports.getCPTUpload = function(req, res){
     ejs.renderFile('views/cptUpload.ejs', 
        {session: req.session, uploadSuccess : false, duplicate : false, error : false},
        function(err, result) {
        if (!err) {
            res.send(result);
        }else {
            res.send('An error occurred');
            console.log(err);
        }
    });	
};

exports.uploadCPTData = function(req, res){
    var collection = db.get('cpt');
    var jsonObject = {};
    var params = {};
    var info ={};
	info["CPT"]=req.body.cpt;
	info["Description"]=req.body.descr;
	info["Cost"] = parseFloat(req.body.cost);
    console.log(req.body.cpt);
    jsonObject.queryType = 'SQL';
    jsonObject.query = "select * from mongo.master.`cpt` where CPT = '" + req.body.cpt + "'";
    params.body = jsonObject;
    drillAPI.requestDrillAPI(params, function(result){
        if(result){
            if(result.data.rows[0].CPT){              
                  
                    ejs.renderFile('views/cptUpload.ejs', 
                        {session: req.session, uploadSuccess : false, duplicate: true, error : false},
                        function(err, result) {
                        if (!err) {
                            res.send(result);
                        }else {
                            res.send('An error occurred');
                            console.log(err);
                        }
                    });
               
            }else{
                
                 collection.insert(info);
                    ejs.renderFile('views/cptUpload.ejs', 
                        {session: req.session, uploadSuccess : true, duplicate: false, error : false},
                        function(err, result) {
                        if (!err) {
                            res.send(result);
                        }else {
                            res.send('An error occurred');
                            console.log(err);
                        }
                    });
            }
        }else{
            
            ejs.renderFile('views/cptUpload.ejs', 
                        {session: req.session, uploadSuccess : false, duplicate: false, error : true},
                        function(err, result) {
                        if (!err) {
                            res.send(result);
                        }else {
                            res.send('An error occurred');
                            console.log(err);
                        }
                    });
        }
    });    
};