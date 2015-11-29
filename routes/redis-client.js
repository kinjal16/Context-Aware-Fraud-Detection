var redis = require("redis"),
	client = redis.createClient();
client.auth("mypassword");
module.exports = client;
