var Pyntemp = {};
Pyntemp.Telldus = {};

var OAuth = require('oauth').OAuth;
var url = require("url");
var sessions = require('./lib/session.js');

Pyntemp.Sensor = function(sensor) {
	this.id = sensor.id;
	this.name = sensor.name;
	this.temperature = sensor.temp;
	this.humidity = sensor.humidity;
}

Pyntemp.Sensors = function() {
	this.sensors = new Array();
	this.length = 0;
	this.push = function(sensor) {
		this.sensors.push(sensor);
		this.length += 1;
	} 
}

Pyntemp.Devices = function() {
	this.devices = new Array();
	this.length = 0;
	this.push = function(device) {
		this.devices.push(device);
		this.length += 1;
	} 
}

Pyntemp.Telldus.getSensorList = function(session, callback) {
	var path = "sensors/list";
	var sensors = new Pyntemp.Sensors();
	Pyntemp.Telldus.getProtectedResource(session, path, function(data) {
		var listLength = data.sensor.length;
		if (data.sensor.length == 0) {
			callback(sensors);
		}
		for (var index in data.sensor) {
			Pyntemp.Telldus.getProtectedResource(session, "sensor/info?id=" + data.sensor[index].id, function (data) {
				sensors.push(new Pyntemp.Sensor({id: data.id, name:data.name, temp: data.data[0].value, humidity: data.data[1].value }));
				if (sensors.length == listLength) {
					callback(sensors);	
				}
			});
		}
	});
}

Pyntemp.Telldus.getDevices = function(session, callback) {
	var path = "devices/list";
	var devices = new Pyntemp.Devices();
	Pyntemp.Telldus.getProtectedResource(session, path, function(data) {
		data.devices = data.device;
		data.device = undefined;	
		callback(data);
	});
}

Pyntemp.Telldus.startDevice = function (session, turnOn, deviceid, callback) {
	var path = "device/turnOff?id=" + deviceid;
	if (turnOn) {
		path = "device/turnOn?id=" + deviceid;
	}
	console.log("TURNING ON/OFF REAL DEVICE");
	Pyntemp.Telldus.getProtectedResource(session, path, function(data) {
		callback(data);	
	});
}

Pyntemp.Telldus.doAuthorizationRedirect = function(request, response) {
	var oa = new OAuth("http://api.telldus.com/oauth/requestToken",
	                  "http://api.telldus.com/oauth/accessToken",
	                  "FEHUVEW84RAFR5SP22RABURUPHAFRUNU", // OAuth consumer token
	                  "ZUXEVEGA9USTAZEWRETHAQUBUR69U6EF", // OAuth consumer secret
	                  "1.0",
	                  "http://127.0.0.1:1337/loginCallback",
	                  "HMAC-SHA1");
					  
	var session = sessions.lookupOrCreate(request);

	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
		if(error) {
			console.log(error);
			response.writeHead(500);
			response.end();
		} else {			
			session.data.oa = oa;
			session.data.oauth_token = oauth_token;
			session.data.oauth_token_secret = oauth_token_secret;
		
			response.writeHead(302, {'Location': "http://api.telldus.com/oauth/authorize/?oauth_token="+oauth_token});
			response.end();
		}
	})	
}

Pyntemp.Telldus.loginCallback = function(request, response) {
	var parsedUrl = url.parse(request.url, true);
	
	var session = sessions.lookupOrCreate(request);
	
	var oa = new OAuth(session.data.oa._requestUrl,
	                  session.data.oa._accessUrl,
	                  session.data.oa._consumerKey,
	                  session.data.oa._consumerSecret,
	                  session.data.oa._version,
	                  session.data.oa._authorize_callback,
	                  session.data.oa._signatureMethod);
	
	oa.getOAuthAccessToken(
		session.data.oauth_token, 
		session.data.oauth_token_secret, 
		parsedUrl.query.oauth_verifier, 
		function(error, oauth_access_token, oauth_access_token_secret, results2) {
			if (error) {
				console.log(error);
				response.writeHead(500);
				response.end();
	 		} else {
				session.data.oauth_access_token = oauth_access_token;
				session.data.oauth_access_token_secret = oauth_access_token_secret;
				
				response.writeHead(302, {'Location': 'http://127.0.0.1:1337/index.html'});
				response.end();
	 		}
		}
	);
}

Pyntemp.Telldus.getProtectedResource = function(session, path, callback) {
	var oa = new OAuth(session.data.oa._requestUrl,
	                  session.data.oa._accessUrl,
	                  session.data.oa._consumerKey,
	                  session.data.oa._consumerSecret,
	                  session.data.oa._version,
	                  session.data.oa._authorize_callback,
	                  session.data.oa._signatureMethod);
	
	var devices = new Pyntemp.Devices();
	
	oa.getProtectedResource("http://api.telldus.com/json/" + path, "GET", 
		session.data.oauth_access_token, 
		session.data.oauth_access_token_secret,
		function(error, data) {
			callback(JSON.parse(data));	
  		}
	);
}

exports.getSensorList = Pyntemp.Telldus.getSensorList;
exports.getDevices = Pyntemp.Telldus.getDevices;
exports.startDevice = Pyntemp.Telldus.startDevice;
exports.doAuthorizationRedirect = Pyntemp.Telldus.doAuthorizationRedirect;
exports.loginCallback = Pyntemp.Telldus.loginCallback;