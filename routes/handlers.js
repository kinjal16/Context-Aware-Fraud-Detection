var	ejs = require("ejs");
var drillAPI = require('../models/dataHandler');
var monk = require('monk');
var db = monk(CONFIG_FILE.monk.path);
var request = require("request");

exports.getEmployeeDetailsPage = function(req, res){
     ejs.renderFile('views/uploadEmployeeData.ejs', 
        {code : null, isNewSearch : true, session: req.session},
        function(err, result) {
        if (!err) {
            res.send(result);
        }else {
            res.send('An error occurred');
            console.log(err);
        }
    });	    
};

exports.getEmployeeBillDetailsPage = function(req, res){
     ejs.renderFile('views/uploadEmployeeBillInfo.ejs', 
        {code : null, isNewSearch : true, session: req.session},
        function(err, result) {
        if (!err) {
            res.send(result);
        }else {
            res.send('An error occurred');
            console.log(err);
        }
    });	    
};

exports.uploadEmployeeDataHandler = function(req, res){
    var collection = db.get('employee');
	var info ={};
	info["Company"]=req.body.company;
	info["employeeId"]=req.body.employeeID;
	info["FirstName"] = req.body.firstName;
	info["LastName"] = req.body.lastName;
	info["Email"] = req.body.email;
	info["phone"]=req.body.phone;
	info["department"]=req.body.departmentName;
	info["address"] = req.body.address;
	info["city"] = req.body.city;
	info["state"] = req.body.state;
	info["country"] = req.body.country;
	info["postal"] = req.body.postal;
    collection.insert(info);
    exports.getEmployeeDetailsPage(req, res);
};

exports.uploadEmployeeBillInfoHandler = function(req, res){
    var collection = db.get('employee_claim');
	//var employee_claims = [];
	var info ={};
	info["billno"]=req.body.company;
	info["employeeId"]=req.body.employeeId;
	var cpt = [];
	var item = {};
	for (var i=1; i<10; i++) {
		var codeName = 'row-' + i + '-code';
		var claimName = 'row-' + i + '-claim';
		if (req.body[codeName] && req.body[claimName]) {
			item["code"] = req.body[codeName];
			item["claim"] = req.body[claimName];
			cpt.push(item);
		}
	}
	info["cpt"] = cpt;
	info["billdate"] = req.body.date;
	info["company"] = req.body.companyId;
	//employee_claims.push(info);
	collection.insert(info);
    exports.getEmployeeBillDetailsPage(req, res);
};

var fs = require('fs');
var async = require('async');
exports.uploadEmployeeBillJson = function(req,res){
	var collection = db.get('employee_claim');
	console.log("uploadEmployeeBillJson called");
	console.log(req);
	var serverPath = '/uploadedFiles/' + req.files.uploadEmployeeBillJson.name;
	console.log("server path");
    //console.log(__dirname+serverPath);
    var pathName=__dirname+serverPath;
    console.log(pathName);
//    async.series([
//                  function(callback){
//                	  require('fs').rename(req.files.uploadEmployeeBillJson.path,pathName,
//          			        function(error) {
//          			            //res.contentType('text/plain');
//          			
//          			            if(error) {
//          			                callback('Ah! Something bad happened');
//          			                
//          			            }
//          			            else{	
//          			            	fs.readFile(__dirname+serverPath,'utf8', function (err, data) {
//          			            		if (err) 
//          			            			callback(err);
//          			            		console.log(data);
//          			            		try{
//          			            	var json = JSON.parse(data);
//          			            	//collection.insert(json);
//          			            		}catch(e){
//          			            			console.log("inside catch");
//          			            		}
//          			            		console.log(json);
//          			            		callback();
//          			            	});
//          			          }
//  			        });
//
//                  }
//                  
//                  ],function(err){
//    				if(!err){
//    					exports.getEmployeeBillDetailsPage(req, res);
//    				}else
//    					console.log(err);
//    				
//    					
//    	
//    });
    require('fs').rename(req.files.uploadEmployeeBillJson.path,pathName,
			        function(error) {
			
			            if(error) {
			                res.send(JSON.stringify({
			                    error: 'Ah! Something bad happened'
			                }));
			                return;
			            }
			            else{	
			            	fs.readFile(__dirname+serverPath,'utf8', function (err, data) {
			            		if (err) throw err;
			            		console.log(data);
			            		try{
			            	var json = JSON.parse(data);
			            	//collection.insert(json);
			            		}catch(e){
			            			console.log("inside catch");
			            		}
			            		console.log(json);
			            	});
			            	 //res.send({msg:"hello"});
			            	exports.getEmployeeBillDetailsPage(req, res); 
			            }
			        });
	        
};

exports.uploadEmployeeDataJson = function(req,res){
	var collection = db.get('employee');
	console.log("uploadEmployeeBillJson called");
	console.log(req);
	var serverPath = '/uploadedFiles/' + req.files.uploadEmployeeDataJson.name;
	console.log("server path");
    //console.log(__dirname+serverPath);
    var pathName=__dirname+serverPath;
    console.log(pathName);
    require('fs').rename(req.files.uploadEmployeeBillJson.path,pathName,
	        function(error) {
	
	            if(error) {
	                res.send(JSON.stringify({
	                    error: 'Ah! Something bad happened'
	                }));
	                return;
	            }
	            else{	
	            	fs.readFile(__dirname+serverPath,'utf8', function (err, data) {
	            		if (err) throw err;
	            		console.log(data);
	            		try{
	            	var json = JSON.parse(data);
	            	//collection.insert(json);
	            		}catch(e){
	            			console.log("inside catch");
	            		}
	            		console.log(json);
	            	});
	            	 //res.send({msg:"hello"});
	            	exports.getEmployeeDetailsPage(req, res);
	            }
	        });
    
	        
};
