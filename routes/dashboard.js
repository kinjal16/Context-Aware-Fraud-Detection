var ejs = require('ejs');
var async = require('async');
var request = require("request");
var drillAPI = require('../models/dataHandler');
var json2csv = require('json2csv');
var fs = require('fs');

module.exports.getDashboard = function(req, res){
    var respObj = {};
    var tempObj = {};
    var company = req.session.company;

    if(company !== undefined || company !== null || company != '' || company != 'admin'){

        console.log(company);
        async.series([
            function(callback){
                
                        var jsonObject = {};
                        var params = {};
                        jsonObject.queryType = 'SQL';
                        jsonObject.query = "select count(*) as TotCount from mongo.master.`employee` where Company = '" + company + "'";
                        params.body = jsonObject;
                        drillAPI.requestDrillAPI(params, function(result){
                            if(result){
                                if(result.data.rows){
                                    if(result.data.rows.length > 0 && result.data.rows[0].TotCount){
                                        respObj.totalEmployees = result.data.rows[0].TotCount;
                                        callback();                        
                                    }else{
                                        console.log("hello");
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
                jsonObject.query = "select count(*) as TotCount from mongo.master.`employee_claim` where company = '" + company + "'";
                params.body = jsonObject;
                drillAPI.requestDrillAPI(params, function(result){
                    if(result){
                          if(result.data.rows){
                           if(result.data.rows.length > 0 && result.data.rows[0].TotCount){
                                respObj.totalClaims = result.data.rows[0].TotCount;
                                callback();
                            }else{
                                respObj.totalClaims = 0;
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
                        exports.getFraudCount(company, function(err,result){
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
                                         if(result.data.rows){
                                           if(result.data.rows.length > 0){
                                                fraudCPTData.push({cpt : result.data.rows, count : item});
                                                callback();
                                            }else{
                                              callback();
                                            }
                                         }else{
                                            callback("No Data found");
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
                                jsonObject.query = "select * from mongo.master.`employee` where Company= '" + company + "' and employeeId in ('" + item.key + "')";           
                                params.body = jsonObject;
                                drillAPI.requestDrillAPI(params, function(result){
                                    if(result){    
                                         if(result.data.rows){
                                           if(result.data.rows.length > 0){
                                                fraudEmpData.push({emp : result.data.rows, count : item});
                                                callback();
                                            }else{
                                              callback();
                                            }
                                         }else{
                                            callback("No Data found");
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
     }else{
                callback("Company information not found");
            }
};

exports.getFraudCount = function(company, callback){
    var respObj = {};
    var fraudCount = 0;
    var fraudCPTList = [];
    var currMonthFraud = [];
    var cptJson = {};
    var claimData = [];
   
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
                                    "where c.company = '" + company + "' and c.company = e.Company and c.employeeId = e.employeeId";
                params.body = jsonObject;
                drillAPI.requestDrillAPI(params, function(result){
                    if(result){       
                         if(result.data.rows){
                               if(result.data.rows.length > 0){
                                    respObj.cptData = result.data.rows;
                                    callback();
                                }else{
                                    respObj.cptData = null;
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
                if(respObj.cptData){   

                    async.forEach(respObj.cptData, function(item, callback){ 
                         var claimDetails = {};
                        var isCurrMonth = false;
                        var costData = "";
                        try{
                            costData = JSON.parse(item.cpt);
                        }catch(e){}
                        
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
                                            if((claim - diffAmt) >= 50){
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
                                        
                                       // claimDetails.data = item;
                                        //claimDetails.isFraud = true;
                                        claimData.push({data : item, isFraud : true});
                                                                                
                                        if(isCurrMonth)
                                            currMonthFraud.push(item);
                                    }else{
                                       // claimDetails.data = item;
                                        //claimDetails.isFraud = false;
                                        claimData.push({data : item, isFraud : false});
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
                            respObj.claimData = claimData;
                          
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

exports.getFraudClaims = function(req,res){
    var respObj={};
    var fields = ['data', 'isFraud'];
    
    exports.getFraudCount(req.session.company,function(err,result){
            if(err)
               res.send(err);
            else{          
                respObj.claimData = result.claimData;
                
                 json2csv({ data: result.claimData, fields: fields }, function(err, csv) {
                  if (err) console.log(err);
                
                  var file = __dirname + '/claimsDataFile.csv';

                   fs.writeFile(file, csv, function(err) {
                    if (err) throw err;
                    console.log('file saved');   
                        ejs.renderFile('views/viewFraudClaims.ejs', 
                        {data : respObj, session: req.session},
                        function(err, result) {
                            if (!err) {
                                res.send(result);
                            }else {
                                res.send('An error occurred');
                                console.log(err);
                            }
                    });
                  });
                }); 
               
            }                    
        });
};

exports.getClaimsByDate = function(req, res){
     var respObj={};
    respObj.claimData = [];
    var fields = ['data', 'isFraud'];
    var fdate = new Date(req.query.fdate);
    var tdate = new Date(req.query.tdate);
     exports.getFraudCount(req.session.company,function(err,result){
            if(err)
               res.send(err);
            else{          
                async.forEach(result.claimData, function(item, callback){
                    var billdate = new Date(item.data.billdate);
                    if(fdate <= billdate && tdate >= billdate){
                        respObj.claimData.push(item);
                        callback();
                    }else
                        callback();
                }, function(err){
                    if(err)
                        res.send(err);
                    else{
                            json2csv({ data: respObj.claimData, fields: fields }, function(err, csv) {
                              if (err) console.log(err);

                              var file = __dirname + '/claimsDataFile.csv';

                               fs.writeFile(file, csv, function(err) {
                                if (err) throw err;
                                console.log('file saved');                       
                                    ejs.renderFile('views/viewFraudClaims.ejs', 
                                    {data : respObj, session: req.session},
                                    function(err, result) {
                                        if (!err) {
                                            res.send(result);
                                        }else {
                                            res.send('An error occurred');
                                            console.log(err);
                                        }
                                    });
                               });
                        });
                    }
                        
                });       
                
            }                    

        });
};


exports.downloadClaims = function(req, res){
     var file = __dirname + '/claimsDataFile.csv';

  res.download(file);
};
