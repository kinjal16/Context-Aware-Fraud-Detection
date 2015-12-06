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
    var empData = [];
    
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
                          async.forEach(respObj.cptData, function(item, callback){ 
                        	  var empObj = {};
                              var isCurrMonth = false;
                              var costData = JSON.parse(item.cpt);
                              var empCPT = [];
                              var isFraud = false;
                              
                              empObj.firstname = item.FirstName;
                              empObj.lastname = item.LastName;
                              empObj.billno = item.billno;
                              empObj.billdate = item.billdate;
                              
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
	                                      diffAmt = (0.40)*cost + cost;                                   
	                                      
	                                      if((claim - diffAmt) >= 50){
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
};

exports.getEmployeesByDate = function(req, res){
    var respObj=[];
   var fdate = new Date(req.query.fdate);
   var tdate = new Date(req.query.tdate);
    exports.getEmployeeList(req.session.company,function(err,result){
           if(err)
              res.send(err);
           else{          
               async.forEach(result, function(item, callback){
                   var billdate = new Date(item.billdate);
                   if(fdate <= billdate && tdate >= billdate){
                       respObj.push(item);
                       callback();
                   }else
                       callback();
               }, function(err){
                   if(err)
                       res.send(err);
                   else{
                	   ejs.renderFile('views/viewEmployee.ejs', 
            			       {session : req.session, data: respObj},
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
               
           }                    

       });
};
