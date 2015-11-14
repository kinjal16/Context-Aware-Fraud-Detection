var ejs = require('ejs');
var async = require('async');
var drillAPI = require('../models/dataHandler');

module.exports.getDashboard = function(req, res){
    var respObj = {};
    async.parallel([
        function(callback){
            var jsonObject = {};
            var params = {};
            jsonObject.queryType = 'SQL';
            jsonObject.query = "select count(*) as TotCount from mongo.master.`employee` where Company = 'abc'";
            params.body = jsonObject;
            drillAPI.requestDrillAPI(params, function(result){
                if(result){
                    if(result.data.rows.length > 0){
                        respObj.totalEmployees = result.data.rows[0].TotCount;
                        callback();
                    }else{
                        respObj.totalEmployees = 0;
                        callback();
                    }
                }else
                    callback("Error occured in connecting to API");
            });  
        },
        function(callback){
            var jsonObject = {};
            var params = {};
            jsonObject.queryType = 'SQL';
            jsonObject.query = "select count(*) as TotCount from mongo.master.`employee_claim` where company = 'abc'";
            params.body = jsonObject;
            drillAPI.requestDrillAPI(params, function(result){
                if(result){
                    if(result.data.rows.length > 0){
                        respObj.totalClaims = result.data.rows[0].TotCount;
                        callback();
                    }else{
                        respObj.totalClaims = 0;
                        callback();
                    }
                }else
                    callback("Error occured in connecting to API");
            }); 
        },
        function(callback){
            exports.getFraudCount(function(err,result){
                if(err)
                    callback(err);
                else{
                    respObj.totalFraud = result;
                    callback();
                }                    
            });
        }
    ],function(err){
        if(err)
            res.send(err);
        else{
            ejs.renderFile('views/dashboard.ejs', 
                {data : respObj},
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

exports.getFraudCount = function(callback){
    var respObj = {};
    var fraudCount = 0;
    async.series([
        function(callback){
            var jsonObject = {};
            var params = {};
            jsonObject.queryType = 'SQL';
            jsonObject.query = "select cpt from mongo.master.`employee_claim` where company = 'abc'";
            params.body = jsonObject;
            drillAPI.requestDrillAPI(params, function(result){
                if(result){                        
                   if(result.data.rows.length > 0){
                        respObj.cptData = result.data.rows;
                        callback();
                    }else{
                        respObj.cptData = null;
                        callback();
                    }
                }else
                    callback("Error occured in connecting to API");
            }); 
        },
        function(callback){
            if(respObj.cptData){
                async.forEach(respObj.cptData, function(item, callback){                   
                    var costData = JSON.parse(item.cpt);
                    var isFraud = false;
                     async.forEach(costData, function(subItem, callback){
                         var diffAmt = 0;
                         var claim = JSON.parse(subItem.claim);
                         var code = JSON.parse(subItem.code);
                        var jsonObject = {};
                        var params = {};
                        jsonObject.queryType = 'SQL';
                        jsonObject.query = "select Cost from mongo.master.`cpt` where CPT = '" + code + "'";
                        params.body = jsonObject;                                
                        drillAPI.requestDrillAPI(params, function(result){
                            if(result){
                                if(result.data.rows.length > 0){ 
                                    var cost = parseFloat(result.data.rows[0].Cost);                                  
                                    diffAmt = (0.40)*cost + cost;                                   
                                    if((claim - diffAmt) >= 0)
                                        isFraud = true;
                                    callback();                                                                        
                                }                                    
                            }else
                                callback("Error occured in connecting to API");
                        });                      
                     }, function(err){
                            if(err)
                                callback(err);
                            else{
                                if(isFraud)
                                    fraudCount++;
                                callback();
                            }                                
                     });                   
                }, function(err){
                    if(err)
                        callback(err);
                    else{
                        respObj.fraudCount = fraudCount;
                        callback();
                    }                        
                });              
            }
        }
    ],function(err){
        if(err)
            callback(err, null);
        else
            callback(null, fraudCount);
    });
    
};