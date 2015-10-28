var http = require('http');
var async = require('async');

var httpCallback = function(res, callback){
	var httpResponse = '';
	var statusCode = res.statusCode;
	res.on('data',function (chunk){
			httpResponse += chunk;
	});
	res.on('end', function(data) {      		
		try{
      		var responseObject = JSON.parse(httpResponse);
		}catch(e){}
		
		var httpResult = {
			data: responseObject,
			error: 0,
			status: statusCode
		}
		
		if(statusCode === 200)
			httpResult.msg = "Success";
		else{
			httpResult.error = 1;
			httpResult.msg = httpResponse;
		}
		
		if(typeof httpResponse.error !== 'undefined' && typeof httpResponse.error !== '' && typeof httpResponse.error !== null){
			httpResult.data = null;
			httpResult.error = 1;
			httpResult.msg = httpResponse.error;
		}			
		callback(httpResult);
    });
	res.on('error', function(err){
		callback({
			data: err,
			error: 1,
			status: statusCode,
			msg: err.message
		});
	});
	res.on('socket', function(){
		socket.setTimeout(5000);
		socket.on('timeout', function(){
			callback({
				data: null,
				error: 1,
				status: statusCode,
				msg: "Socket Time Out"
			});
		req.abort();
		});
	});
};

module.exports.requestDrillAPI = function(param, callback){
	var results = {};	
    var header = {};
    var body = param.body || null;

    if(body){
        body = JSON.stringify(body);
        header = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(body)
        };									
    }				

    var options = {
            host : CONFIG_FILE.drillAPI.host,
            port : CONFIG_FILE.drillAPI.port,
            path : CONFIG_FILE.drillAPI.path,
            headers : header || null,
            method : 'POST'
    };
   
    var req = http.request(options, function(res){
        httpCallback(res, function(result){
            if(result){								
                 callback(result);								
            }						      
        });
    });

    if(body)
        req.write(body);

    req.on('error',function(e){						
        callback({
            data: null,
            error: 1,
            status: req.statusCode,
            msg: "Connection to query service refused"
        });						
    });	
    req.end();				
};