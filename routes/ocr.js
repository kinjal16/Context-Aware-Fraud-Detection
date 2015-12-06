var	ejs = require("ejs");
var drillAPI = require('../models/dataHandler');
var monk = require('monk');
var db = monk('52.33.120.205:27017/master');
var tesseract = require('node-tesseract');
var options = {
	    l: 'eng',
	    psm: 6,
	    binary: '/usr/local/bin/tesseract'
	};
var isLoggedIn = false;
exports.imageUploadPage = function(req, res){
	
	var sessionState = null;
    if(req.session.company) {
        isLoggedIn = true;
        sessionState = req.session;
    }
    else {
        isLoggedIn = false;
        sessionState = null;
    }
    ejs.renderFile('views/ocr.ejs', 
       {code : null, isNewSearch : true,session: sessionState, fraudInfoData:null, isLoggedIn : isLoggedIn,errorMsg:null, isFraud:null},
       function(err, result) {
       if (!err) {
           res.send(result);
       }else {
           res.send('An error occurred');
           console.log(err);
       }
   });	    
};

exports.getOCRFraudDetails = function(req, res) {
	console.log(req);
	//console.log(isEmpty(req.files));
	//console.log(req.files.isEmpty());
    console.log("api photos called");
    var errorMsg;
    var collection = db.get('employee_claim');
    var cptCollection = db.get('cpt');
	var serverPath = '/images/' + req.files.userPhoto.name;
	var pathName=__dirname+serverPath;
	var fraudInfo={};
    console.log(serverPath);
    console.log(pathName);
    var isFraud = true;
    var sessionState = null;
    if(req.session.company) {
        isLoggedIn = true;
        sessionState = req.session;
    }
    else {
        isLoggedIn = false;
        sessionState = null;
    }
//    if(isEmpty(req.files)){
//    	errorMsg="Please upload a file";
//    	ejs.renderFile('views/ocr.ejs', 
// 			   {code : null, isNewSearch : true, fraudInfoData: null, session: req.session, isLoggedIn : isLoggedIn, errorMsg:errorMsg, isFraud:isFraud},
//	    		       function(err, result) {
//	    		       if (!err) {
//	    		           res.send(result);
//	    		       }else {
//	    		           res.send('An error occurred');
//	    		           console.log(err);
//	    		       }
// 		});	 
//    }
    require('fs').rename(
        req.files.userPhoto.path,pathName,
        function(error) {

            if(error) {
                res.send(JSON.stringify({
                    error: 'Ah! Something bad happened'
                }));
                return;
            }
            else{
            	tesseract.process(pathName,options,function(err, text) {
            		 if(err) {
	            	        console.error(err);
	            	    } else {
	            	    	var array = text.toString().split("\n");
	            	    	var employeeClaim = [];
	            	    	var fraudClaim = [];
	            	    	console.log("hellotesseract");
	            	    	console.log(array);
	            	    	var indexOfName = array[0].indexOf(" ");
	            	    	var patientsName = array[0].substring(indexOfName+1);
	
	
	            	    	var billIndex = array[2].indexOf(" ");
	            	    	var billNo=array[2].substring(billIndex+1);
	
	            	    	var date = array[10].indexOf(" ");
	            	    	var dateRes=array[10].substring(date+1);
	            	    	
	            	    	var arrayDate = dateRes.toString().split("~");
	            	    	var dateVal = arrayDate[2]+"-"+arrayDate[0]+"-"+arrayDate[1];
	            	    	console.log(dateVal);
//	            	    	
	            	    	
	            	        var index = array.indexOf("E");
	            	        
	            	        var indexOfSpace;
	            	        var indexOf$;
	            	        var code;
	            	        var description;
	            	        var costVal;
	            	        
	            	        var info ={};
	            	        
	            	        fraudInfo["billno"]=billNo;
	            	        fraudInfo["name"]=req.files.userPhoto.originalname;
	            	        info["billno"]=billNo;
	            	        info["employeeId"]=req.body.textbox_id;
	            	        var cpt=[];
	            	        var cptCodes=[];
	            	        for( var i=index+1; i<array.length;i++) {
	            	        	if(array[i]===''){
	            	        		break;
	            	        	}     
	            	        	indexOf$ = array[i].indexOf("$");
	            	        	indexOfSpace = array[i].indexOf(" ");
	            	        	code = array[i].substring(0,indexOfSpace);
	            	        	description = array[i].substring(indexOfSpace+1,indexOf$);
	            	        	costVal = array[i].substring(indexOf$+1);
	            	        	
	            	        	item = {}
	            	            item ["code"] = parseInt(code);
	            	            item ["claim"] = parseInt(costVal);
	            	            cptCodes.push(code);
	            	            cpt.push(item);  

		            	        var jsonObject = {};
		            	        var params = {};
		            	        jsonObject.queryType = 'SQL';
		            	        jsonObject.query = "select * from mongo.master.`cpt` where `CPT` like '%" + code + "%'";
		            	        params.body = jsonObject;
		            	        
		            	        drillAPI.requestDrillAPI(params, function(result){
		            	        	console.log("inside apache drill");
		            	        	if(result){
		                                if(result.data.rows){
		                                    if(result.data.rows.length > 0){ 
		                                        var cost = parseFloat(result.data.rows[0].Cost);                                  
		                                        diffAmt = (0.40)*cost + cost;                                   
		                                        if((costVal - diffAmt) >= 0){
		                                        	 if(!isFraud){
			                                             isFraud = true;								                                             
			                                             console.log("fraud");
			                                             fraudInfo["FraudInfo"]="true";
		                                        	 }
		                                        } 
		                                        else{
		                                        	if(!isFraud){
		                                        	fraudInfo["FraudInfo"]="false";
		                                        	}
		                                        	console.log("No fraud");
		                                        }
		                                
		                                                                                                              
		                                    } 
		                                }else{
		                                   
		                                }
		                            }
		                                
		                        });                      
		                     
		            	        // fraudClaim.push(fraudInfo);
	            	            
	            	        }// for loop ends here
	            	        
	            	        info["cpt"] = cpt;
	            	        info["billdate"] = dateVal;
	            	        info["company"] = req.session.company
							// if(isFraud){
							// fraudInfo["FraudInfo"]="true";
							// }
							// else{
							// fraudInfo["FraudInfo"]="false";
							// }
	            	        
	            	        fraudClaim.push(fraudInfo);
	            	         console.log("fraudclaim");
	            	        console.log(fraudClaim);
	            	        employeeClaim.push(info);
	            	        console.log("employee claim");
	            	        console.log(employeeClaim);
	            	        
	            	        console.log(req.body.textbox_id);
	            	        
	            	        console.log(req.session.firstname);
	            	        if(req.session.firstname != undefined)
	            	    	{	
	            	        	console.log("inside userid block");
	            	        	if(req.body.textbox_id != undefined){
	            	        		// collection.insert(info);
	            	        		console.log("inside success block");
	            	        	}
	            	        	else{
	            	        		console.log("inside error block");
	            	        		errorMsg="Please enter the employee Id";
	            	        		fraudInfoData = null;
	            	        	}
	            	        	
	            	    	}
	            	        console.log(errorMsg);
	            	    }//else ends here
	            	   ejs.renderFile('views/ocr.ejs', 
	            			   {code : null, isNewSearch : true, fraudInfoData: fraudInfo, session: sessionState, isLoggedIn : isLoggedIn, errorMsg:errorMsg, isFraud:isFraud},
				    		       function(err, result) {
				    		       if (!err) {
				    		           res.send(result);
				    		       }else {
				    		           res.send('An error occurred');
				    		           console.log(err);
				    		       }
	            		});	    
	            	    
	            	    }); //teserract ends here
	            	
		           
	 
            	
            }
        }
    );
}