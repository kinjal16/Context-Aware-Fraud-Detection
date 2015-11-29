var ejs = require('ejs');
var async = require('async');
var request = require("request");
var drillAPI = require('../models/dataHandler');

module.exports.getDashboard = function(req, res){
    var respObj = {};
    var tempObj = {};
    async.series([
        function(callback){
            var jsonObject = {};
            var params = {};
            jsonObject.queryType = 'SQL';
            jsonObject.query = "select count(*) as TotCount from mongo.master.`employee` where Company = 'abc'";
            params.body = jsonObject;
            drillAPI.requestDrillAPI(params, function(result){
                if(result){
                    if(result.data.rows){
                        if(result.data.rows.length > 0){
                            respObj.totalEmployees = result.data.rows[0].TotCount;
                            callback();                        
                        }else{
                            respObj.totalEmployees = 0;
                            callback();
                        }
                    }else{
                        callback("No Data found");
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
            async.series([
                function(callback){
                    exports.getFraudCount(function(err,result){
                        if(err)
                            callback(err);
                        else{
                            respObj.totalFraud = result.fraudCount;
                            tempObj.cptList = result.fraudCPTList;
                            tempObj.cptJson = result.fraudCPTJson;
                            tempObj.employeeFraudClaim = result.employeeFraudClaim;
                            respObj.currMonthFraud = result.currMonthFraud;
                            respObj.monthlyClaim = result.monthlyClaim;
                            respObj.monthlyFraud = result.monthlyFraud; 
                            callback();
                        }                    
                    });
                },
                function(callback){
                        var fraudCPT = "";
                        var cptJSON = JSON.stringify(tempObj.cptJson);                    
                        var sortedData = exports.sortData(JSON.parse(cptJSON));
                        var fraudCPTData = [];                           
                        async.forEach(sortedData, function(item, callback){ 
                        if(sortedData.length <= 5){
                            var jsonObject = {};
                            var params = {};
                            jsonObject.queryType = 'SQL';
                            jsonObject.query = "select * from mongo.master.`cpt` where CPT in ('" + item.key + "')";                            
                            params.body = jsonObject;
                            drillAPI.requestDrillAPI(params, function(result){
                                if(result){                        
                                   if(result.data.rows.length > 0){
                                        fraudCPTData.push({cpt : result.data.rows, count : item});
                                        callback();
                                    }else{
                                      callback();
                                    }
                                }else
                                    callback("Error occured in connecting to API");
                            }); 
                        }                     
                    },function(err){
                        if(err)
                            callback(err);
                        else{                      
                            respObj.fraudCPTData = fraudCPTData;
                            callback();
                        }                            
                    });                  
                },
                function(callback){
                        var fraudEmp = "";
                        var fraudEmpList = JSON.stringify(tempObj.employeeFraudClaim);                    
                        var sortedData = exports.sortData(JSON.parse(fraudEmpList));
                        var fraudEmpData = [];                           
                        async.forEach(sortedData, function(item, callback){ 
                        if(sortedData.length <= 5){
                            var jsonObject = {};
                            var params = {};
                            jsonObject.queryType = 'SQL';
                            jsonObject.query = "select * from mongo.master.`employee` where employeeId in ('" + item.key + "')";           
                            params.body = jsonObject;
                            drillAPI.requestDrillAPI(params, function(result){
                                if(result){                        
                                   if(result.data.rows.length > 0){
                                        fraudEmpData.push({emp : result.data.rows, count : item});
                                        callback();
                                    }else{
                                      callback();
                                    }
                                }else
                                    callback("Error occured in connecting to API");
                            }); 
                        }                     
                    },function(err){
                        if(err)
                            callback(err);
                        else{                      
                            respObj.fraudEmpData = fraudEmpData;                           
                            callback();
                        }                            
                    });                  
                }
            ], function(err){
                    if(err)
                        callback(err);
                    else
                        callback();
            });
        }
    ],function(err){
        if(err)
            res.send(err);
        else{
            ejs.renderFile('views/dashboard.ejs', 
                {data : respObj, session: req.session},
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
    var fraudCPTList = [];
    var currMonthFraud = [];
    var cptJson = {};
    var employeeFraudClaim = {};
    var monthlyFraud = [0,0,0,0,0,0,0,0,0,0,0,0];
    var monthlyClaim = [0,0,0,0,0,0,0,0,0,0,0,0];
    async.series([
        function(callback){
            var jsonObject = {};
            var params = {};
            jsonObject.queryType = 'SQL';
            jsonObject.query = "select c.billno, c.employeeId,c.cpt,c.billdate, e.FirstName, e.LastName " + 
                                "from mongo.master.`employee_claim` as c, mongo.master.`employee` as e " +
                                "where c.company = 'abc' and c.company = e.Company and c.employeeId = e.employeeId";
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
                    var isCurrMonth = false;
                    var costData = JSON.parse(item.cpt);
                    var isFraud = false;
                    var billdate = new Date(item.billdate);
                   // billdate = billdate.toUTCString();
                    //billdate = new Date(billdate);
                   var billMonth = billdate.getMonth() + 1;
                   var currDate = new Date();
                   var currMonth = currDate.getMonth() + 1;
                   monthlyClaim[billMonth -1] = monthlyClaim[billMonth -1] + 1;
                    
                    if(billMonth === currMonth)
                        isCurrMonth = true;
                   
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
                                if(result.data.rows){
                                    if(result.data.rows.length > 0){ 
                                        var cost = parseFloat(result.data.rows[0].Cost);                                  
                                        diffAmt = (0.40)*cost + cost;                                   
                                        if((claim - diffAmt) >= 0){
                                             isFraud = true;
                                            if(cptJson[code])
                                               cptJson[code] = cptJson[code] + 1;
                                            else
                                                cptJson[code] = 1;
                                            fraudCPTList.push(code);
                                        }                                       
                                        callback();                                                                        
                                    } 
                                }else{
                                    callback("No data found");
                                }
                            }else
                                callback("Error occured in connecting to API");
                        });                      
                     }, function(err){
                            if(err)
                                callback(err);
                            else{
                                if(isFraud){
                                    fraudCount++;
                                    monthlyFraud[billMonth -1] =  monthlyFraud[billMonth -1] + 1;
                                    
                                    if(employeeFraudClaim[item.employeeId])
                                        employeeFraudClaim[item.employeeId] = employeeFraudClaim[item.employeeId] + 1;
                                    else
                                        employeeFraudClaim[item.employeeId] = 1;
                                    
                                    if(isCurrMonth)
                                        currMonthFraud.push(item);
                                }
                                   
                                callback();
                            }                                
                     });                   
                }, function(err){
                    if(err)
                        callback(err);
                    else{
                        respObj.fraudCount = fraudCount;
                        respObj.fraudCPTList = fraudCPTList;
                        respObj.fraudCPTJson = cptJson;
                        respObj.currMonthFraud = currMonthFraud;
                        respObj.monthlyClaim = monthlyClaim;
                        respObj.monthlyFraud = monthlyFraud; 
                        respObj.employeeFraudClaim = employeeFraudClaim;
                        callback();
                    }                        
                });              
            }
        }
    ],function(err){
        if(err)
            callback(err, null);
        else
            callback(null, respObj);
    });
    
};

exports.sortData = function(data) {
    var sorted = [];
    Object.keys(data).sort(function(a,b){
        return data[b] - data[a] 
    }).forEach(function(key){
        //sorted[key] = data[key];       
        sorted.push({key : key, value : data[key]});
    });
    return sorted;
};

