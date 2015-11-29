var	ejs = require("ejs");
var request = require("request");
var async = require("async");
var drillAPI = require('../models/dataHandler');
var client = require("./redis-client.js");

exports.getEmployeeList = function(req, res, next){
	var jsonObject = {};
    var params = {};
    var respObject = {};
    
    jsonObject.queryType = 'SQL';
    jsonObject.query = "select e.FirstName, e.LastName, b.cpt, b.billno, b.billdate from mongo.master.`employee` as e" 
    	+ " join mongo.master.`employee_claim` as b on e.employeeId = b.employeeId and e.Company = '" 
    	+ req.session.company + "'";
    params.body = jsonObject;
    drillAPI.requestDrillAPI(params, function(result){
        if(result){
        	var empList = result.data.rows;
        	async.forEach(empList, function(employee, callback) {
        		var isFraud = false;
        		var cptJSON = {};
        		respObject.firstname = employee.FirstName;
        		respObject.lastname = employee.LastName;
        		respObject.billno = employee.billno;
        		respObject.billdate = employee.billdate;
        		
        		async.forEach(JSON.parse(employee.cpt), function(cptInfo, callback){
        			
        			var cptCode = cptInfo.code;
        			var cptData = [];
        			client.hgetall(String(cptCode),function(err, res){
        				console.log(res);
        				
        		     });
        			var actualCPTCost = parseFloat(cptData[4]);                                  
                    var diffAmt = (0.40) * actualCPTCost + actualCPTCost;
                    
                    cptJSON.code = cptInfo.code;
                    cptJSON.claim = cptInfo.claim;
                    cptJSON.actualCost = actualCPTCost;
                    if((cptInfo.claim - diffAmt) >= 0) {
                    	isFraud = true;
                    }
        		}, function(err){
                    if(err) {
                        console.log(err);
                        next();
                    }
                    else{
                    	next();
                    }                                
            	});
        		respObject.cptData = cptJSON;
        		respObject.fraud = isFraud;
        		ejs.renderFile('views/viewEmployee.ejs', 
        			       {session : req.session, data: respObject},
        			       function(err, result) {
        			       if (!err) {
        			           res.send(result);
        			       }else {
        			           res.send('An error occurred');
        			           console.log(err);
        			       }
        		});
        		callback();
        	}, function(err){
                if(err) {
                    console.log(err);
                    next();
                }
                else{
                	next();
                }                                
        	});          
        } else {
        	console.log("Get employee details query failed.");
        }
    });
};