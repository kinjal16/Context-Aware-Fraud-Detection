var	ejs = require("ejs");
var cpt = require('./cptInfo');
var login = require('./loginInfo');
var client = require("../redis-client.js");

module.exports = function(app){

	app.get('/', function (req, res) {
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
    
    app.get('/searchCPT', cpt.getCPTSearchPage);
    
    app.get('/searchCPTByCode', cpt.getCPTDetails);
    
    app.get('/login', login.getLoginPage);
    
    app.post('/validateUser', login.getLoginDetails);
}