var redis = require("redis"),
	client = redis.createClient(6379, '52.33.120.205');
client.auth("mypassword");
module.exports = client;
