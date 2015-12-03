var	ejs = require("ejs");
var request = require("request");

exports.validateSession = function(req, res, next){
    if(!req.session.company){
        ejs.renderFile('views/register.ejs', 
           {session : null},
           function(err, result) {
           if (!err) {
               res.send(result);
           }else {
               res.send('An error occurred');
               console.log(err);
           }
       });	
    }else{
        next();
    }
}