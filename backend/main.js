var Pyntemp = {};
Pyntemp.Telldus = {};

var http = require('http');
var fs = require('fs');

http.createServer(function (request, response) {
	if (request.url == "/sensors") {
		Pyntemp.Telldus.getSensorList(function (sensors){
			response.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
			response.end(JSON.stringify(sensors), 'utf-8');			
		});
	} else {
		fs.readFile('../frontend' + request.url, function(error, content) {
	        if (error) {
	            response.writeHead(500);
	            response.end();
	        }
	        else {
	            response.writeHead(200, { 'Content-Type': 'text/html' });
	            response.end(content, 'utf-8');
	        }
	    });		
	}
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

Pyntemp.Sensor = function (sensor) {
	this.name = sensor.name;
	this.temperature = sensor.temp;
	this.humidity = sensor.humidity;
	console.log(this.name + " " + this.temperature + " " + this.humidity);
}

Pyntemp.Sensors = function () {
	this.sensors = new Array();
	this.length = 0;
	this.push = function(sensor) {
		this.sensors.push(sensor);
		this.length += 1;
	} 
}

Pyntemp.Telldus.getSensorList = function (callback) {
	var util = require('util');
	var path = "sensors/list";
	var sensors = new Pyntemp.Sensors();
	Pyntemp.Telldus.getAuthorization(function (){
		Pyntemp.Telldus.getResource(path, function (data) {
			console.log(data.sensor);
			var listLength = data.sensor.length;
			for (var sensor in data.sensor) {
				console.log(data.sensor[sensor]);
				Pyntemp.Telldus.getResource("sensor/info?id=" + data.sensor[sensor].id, function (data) {
					console.log(data);
					sensors.push(new Pyntemp.Sensor({name:data.name, temp: data.data[0].value, humidity: data.data[1].value }));
					console.log(sensors.length + " " + listLength);
					if (sensors.length == listLength) {
						callback(sensors);	
					}
				});
			}
 		});
	});
}



Pyntemp.Telldus.getResource = function(path, callback){
	var util = require('util');
	Pyntemp.Telldus.oa.getProtectedResource("http://api.telldus.com/json/" + path, "GET", 
		'token', //TODO: replace with oauth_access_token
		'token secret',  //TODO: replace with oauth_access_token_secret
		function (error, data, response) {
			util.puts(data);
			callback(JSON.parse(data));
  		}
	);	
}

Pyntemp.Telldus.getAuthorization = function(callback) {
	var util = require('util');
	var OAuth = require('oauth').OAuth;
	
	var oa = new OAuth("http://api.telldus.com/oauth/requestToken",
	                  "http://api.telldus.com/oauth/accessToken",
	                  "public key",
	                  "private key",
	                  "1.0",
	                  null,
	                  "HMAC-SHA1")

	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
	  if(error) {
	  	console.log(error)
	  }
	  else {
	    oa.getOAuthAccessToken(oauth_token, oauth_token_secret, function(error, oauth_access_token, oauth_access_token_secret, results2) {
	      Pyntemp.Telldus.oa = oa;
	      callback();
	    });
	  }
	})	
}