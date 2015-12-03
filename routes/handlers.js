var	ejs = require("ejs");
var drillAPI = require('../models/dataHandler');
var monk = require('monk');
var db = monk('52.33.120.205:27017/master');
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