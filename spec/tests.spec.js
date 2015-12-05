var request = require('request');

describe('test all REST APIs', function(){
    
    describe('GET /dashboard', function(){
        it('Should return status code as 200', function(done){
            request.get("http://localhost:3000/dashboard", function(error, response, body){
              expect(response.statusCode).toEqual(200);
              done();      
           });
        });       
    });
    
    describe('GET /searchCPT', function(){
        it('Should return status code as 200', function(done){
            request.get("http://localhost:3000/searchCPT", function(error, response, body){
              expect(response.statusCode).toEqual(200);
              done();      
           });
        });       
    });
    
    describe('GET /download', function(){
        it('Should return status code as 200', function(done){
            request.get("http://localhost:3000/download", function(error, response, body){
              expect(response.statusCode).toEqual(200);
              done();      
           });
        }); 
        it('Should return file with the expected data', function(done){
            request.get("http://localhost:3000/download", function(error, response, body){
              expect(body).toMatch("CPT","Description","Cost");
              done();      
           });
        }); 
    });
    
    describe('GET /downloadClaims', function(){
        it('Should return status code as 200', function(done){
            request.get("http://localhost:3000/downloadClaims", function(error, response, body){
              expect(response.statusCode).toEqual(200);
              done();      
           });
        }); 
        it('Should return file with the expected data', function(done){
            request.get("http://localhost:3000/downloadClaims", function(error, response, body){
              expect(body).toMatch("data","isFraud");
              done();      
           });
        }); 
    });
    
     describe('GET /viewClaims', function(){
        it('Should return status code as 200', function(done){
            request.get("http://localhost:3000/viewClaims", function(error, response, body){
              expect(response.statusCode).toEqual(200);
              done();      
           });
        });       
    });
    
     describe('GET /cptUpload', function(){
        it('Should return status code as 200', function(done){
            request.get("http://localhost:3000/cptUpload", function(error, response, body){
              expect(response.statusCode).toEqual(200);
              done();      
           });
        });       
    });
    
    describe('GET /searchCPTAdmin', function(){
        it('Should return status code as 200', function(done){
            request.get("http://localhost:3000/searchCPTAdmin", function(error, response, body){
              expect(response.statusCode).toEqual(200);
              done();      
           });
        });       
    });
    
     /*describe('GET /viewClaims', function(){
        it('Should return status code as 200', function(done){
            request({headers: {},
                    uri: '',
                    method: 'GET'}, function(error, response, body){
              expect(response.statusCode).toEqual(200);
              done();      
           });
        });       
    });*/
    
});