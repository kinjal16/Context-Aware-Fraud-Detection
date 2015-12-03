var	ejs = require("ejs");
var request = require("request");
var async = require("async");
var drillAPI = require('../models/dataHandler');
var client = require("./redis-client.js");

exports.getEmployees = function(req, res){
	var resObject = [];
	exports.getEmployeeList(req.session.company, function(err,result){
	    if(err)
	        callback(err);
	    else{
	    	resObject = result; 
	    	
	    	ejs.renderFile('views/viewEmployee.ejs', 
    			       {session : req.session, data: resObject},
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



exports.getEmployeeList = function(company, callback){
	var jsonObject = {};
    var params = {};
    var respObj = {};
    //var empObj = {};
    //var isFraud = false;
    //var empCPT = [];
    var empData = [];
    //var cptJSON = {};
    
    async.series([
                  function(callback){
                      var jsonObject = {};
                      var params = {};
                      jsonObject.queryType = 'SQL';
                      jsonObject.query = "select e.FirstName, e.LastName, b.cpt, b.billno, b.billdate from mongo.master.`employee` as e" 
                      	+ " join mongo.master.`employee_claim` as b on e.employeeId = b.employeeId and e.Company = b.company and e.Company = '" 
                    	+ company + "'";
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
                    	  var firstname = "";
                          var lastname = "";
                          var billno = "";
                          var billdate = "";
                          async.forEach(respObj.cptData, function(item, callback){ 
                        	  var empObj = {};
                              var isCurrMonth = false;
                              var costData = JSON.parse(item.cpt);
                              firstname = item.FirstName;
                              lastname = item.LastName;
                              billno = item.billno;
                              billdate = item.billdate;
                              empObj.firstname = firstname;
                              empObj.lastname = lastname;
                              empObj.billno = billno;
                              empObj.billdate = billdate;
                              var empCPT = [];
                              var isFraud = false;
                               async.forEach(costData, function(subItem, callback){
                            	   var cptJSON = {};
                                   var diffAmt = 0;
                                   var claim = JSON.parse(subItem.claim);
                                   var code = JSON.parse(subItem.code);
                                  
                                  
                                   client.hgetall(code, function (err, obj) {
                                	   if(err)
                                		   callback(err);
                                	   if(obj != null) {
                                		  
	                                	  var cost = parseFloat(obj.cost); 
	                                      cptJSON.code = code;
	                                      cptJSON.claim = claim;
	                                      cptJSON.actualCost = cost;
	                                      cptJSON.descr = obj.description;
	                                      empCPT.push(cptJSON);
	                                      console.log(item.billno + "======== " + empCPT);
	                                     // cptJSON = {};
	                                      diffAmt = (0.40)*cost + cost;                                   
	                                      if((claim - diffAmt) >= 0){
	                                           isFraud = true;
	                                           callback();

	                                      }else{
	                                    	  callback();
	                                      }  
	                                    } else {
                                		   callback();
                                	   }
                                	});
                                   
                               }, function(err){
                                      if(err)
                                          callback(err);
                                      else{
                                    	  empObj.cptData = empCPT;
                                    	  empObj.fraud = isFraud;
                                  		
                                    	  empData.push(empObj);
                                    	  callback();
                                      }                                
                               });                   
                          }, function(err){
                              if(err)
                                  callback(err);
                              else{
                            	  
                            	 
                            	 // empObj = {};
                            	//	empCPT = [];
                          		callback();
                              }                        
                          });              
                      } else {
                    	  callback();
                      }
                  }
              ],function(err){
			        if(err)
			            callback(err, null);
			        else
			            callback(null, empData);
			    });
    
    
    
    
    
    
    
    
//    jsonObject.queryType = 'SQL';
//    jsonObject.query = "select e.FirstName, e.LastName, b.cpt, b.billno, b.billdate from mongo.master.`employee` as e" 
//    	+ " join mongo.master.`employee_claim` as b on e.employeeId = b.employeeId and e.Company = '" 
//    	+ req.session.company + "'";
//    params.body = jsonObject;
//    drillAPI.requestDrillAPI(params, function(result){
//        if(result){
//        	var empList = result.data.rows;
//        	async.forEach(empList, function(employee, callback) {
//        		var isFraud = false;
//        		var cptJSON = {};
//        		respObject.firstname = employee.FirstName;
//        		respObject.lastname = employee.LastName;
//        		respObject.billno = employee.billno;
//        		respObject.billdate = employee.billdate;
//        		
//        		async.forEach(JSON.parse(employee.cpt), function(cptInfo, callback){
//        			
//        			var cptCode = cptInfo.code;
//        			var cptData = [];
////        			client.hgetall(String(cptCode),function(err, res){
////        				console.log(res);
////        				
////        		     });
//        			
//        			jsonObject.queryType = 'SQL';
//                    jsonObject.query = "select * from mongo.master.`cpt` where CPT = '" + cptCode + "'";
//                    params.body = jsonObject;                                
//                    drillAPI.requestDrillAPI(params, function(result){
//                        if(result){
//                            if(result.data.rows){
//                                if(result.data.rows.length > 0){ 
//                                	var actualCPTCost = parseFloat(cptData[4]);                                  
//                                    var diffAmt = (0.40) * actualCPTCost + actualCPTCost;
//                                    
//                                    cptJSON.code = cptInfo.code;
//                                    cptJSON.claim = cptInfo.claim;
//                                    cptJSON.actualCost = actualCPTCost;
//                                    if((cptInfo.claim - diffAmt) >= 0) {
//                                    	isFraud = true;
//                                    }                                      
//                                    callback();                                                                        
//                                } 
//                            }else{
//                                callback("No data found");
//                            }
//                        }else
//                            callback("Error occured in connecting to API");
//                    });
//        		}, function(err){
//                    if(err)
//                        callback(err);
//                    else{
//                        callback();
//                    }                                                                
//            	});
//        	}, function(err){
//                if(err) {
//                    console.log(err);
//                    callback(err);
//                }
//                else{
//                	respObject.cptData = cptJSON;
//            		respObject.fraud = isFraud;
//            		empData.push(respObject);
//            		ejs.renderFile('views/viewEmployee.ejs', 
//          			       {session : req.session, data: empData},
//          			       function(err, result) {
//          			       if (!err) {
//          			           res.send(result);
//          			       }else {
//          			           res.send('An error occurred');
//          			           console.log(err);
//          			       }
//          			});
//                }                                
//        	});
//        } else {
//        	console.log("Get employee details query failed.");
//        }
//    });
};
