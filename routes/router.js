var	ejs = require("ejs");
var cpt = require('./cptInfo');
var login = require('./loginInfo');
var emp = require('./employeeInfo');
var client = require("./redis-client.js");
var dashboard = require('./dashboard');
var express = require('express');
var path = require('path');
var handler = require('./handlers');
var validate = require('./validate');
var admin = require('./admin');
var cptAdmin = require('./cptAdmin');
var router = express.Router();
var ocr = require('./ocr');

//module.exports = function(app){

	router.get('/', login.getCPTCache, function (req, res) {
        ejs.renderFile('views/landing.ejs',
                function(err, result) {
                // render on success
                if (!err) {
                    res.end(result);
                }
                // render or error
                else {
                    res.end('An error occurred');
                    console.log(err);
                }
        });		
    });
    
    router.get('/dashboard', validate.validateSession, dashboard.getDashboard);
    
    router.get('/searchCPT', cpt.getCPTSearchPage);
    
    router.get('/searchCPTByCode', cpt.getCPTDetails);
    
    router.get('/login', login.getLoginPage);
    
    router.post('/validateUser', login.getLoginDetails);

    router.get('/download', cpt.getCPTData);

    router.get('/downloadClaims', dashboard.downloadClaims);
    
    router.get('/viewEmployees', validate.validateSession, emp.getEmployees);

    router.get('/employeeDetails', validate.validateSession, handler.getEmployeeDetailsPage);

    router.get('/employeeBillDetails', validate.validateSession, handler.getEmployeeBillDetailsPage);

    router.post('/uploadEmployeeData', validate.validateSession, handler.uploadEmployeeDataHandler);

	router.post('/uploadEmployeeBillInfo', validate.validateSession, handler.uploadEmployeeBillInfoHandler);

    router.get('/viewClaims', validate.validateSession, dashboard.getFraudClaims );

    router.get('/claimsByDateRange',  validate.validateSession, dashboard.getClaimsByDate);
    
    router.get('/cptUpload',admin.getCPTUpload);

    router.post('/cptUpload', admin.uploadCPTData);

    router.get('/searchCPTAdmin', cptAdmin.getCPTSearchPage);

    router.get('/searchCPTByCodeAdmin', cptAdmin.getCPTDetails);

    router.post('/deleteCPT', cptAdmin.deleteCPT);

    router.post('/uploadCPTJson',admin.uploadCPTJson);
    
    router.post('/uploadBillJson',handler.uploadEmployeeBillJson);

    router.post('/uploadEmployeelDatajson',handler.uploadEmployeeDataJson);
    
    router.post('/detectFraud', ocr.getOCRFraudDetails);
    
    router.get('/uploadImage',ocr.imageUploadPage);
    
    router.get('/logout', login.logout);
    
    router.post('/signup', login.signup);
    
    router.get('/employeeByDate', emp.getEmployeesByDate);
    
module.exports = router;