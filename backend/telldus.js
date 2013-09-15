var Pyntemp = {};
Pyntemp.Telldus = {};

Pyntemp.Sensor = function (sensor) {
	this.name = sensor.name;
	this.temperature = sensor.temp;
	this.humidity = sensor.humidity;

}

Pyntemp.Sensors = function () {
	this.sensors = new Array();
	this.length = 0;
	this.push = function(sensor) {
		this.sensors.push(sensor);
		this.length += 1;
	} 
}

Pyntemp.Devices = function () {
	this.devices = new Array();
	this.length = 0;
	this.push = function(device) {
		this.devices.push(device);
		this.length += 1;
	} 
}


Pyntemp.Telldus.getSensorList = function (callback) {
	var path = "sensors/list";
	var sensors = new Pyntemp.Sensors();
	Pyntemp.Telldus.getAuthorization(function (){
		Pyntemp.Telldus.getResource(path, function (data) {
			var listLength = data.sensor.length;
			for (var sensor in data.sensor) {
				Pyntemp.Telldus.getResource("sensor/info?id=" + data.sensor[sensor].id, function (data) {
					sensors.push(new Pyntemp.Sensor({name:data.name, temp: data.data[0].value, humidity: data.data[1].value }));
					if (sensors.length == listLength) {
						callback(sensors);	
					}
				});
			}
 		});
	});
}

Pyntemp.Telldus.getDevices = function (callback) {
	var path = "devices/list";
	var devices = new Pyntemp.Devices();
	Pyntemp.Telldus.getAuthorization(function (){
		Pyntemp.Telldus.getResource(path, function (data) {
			data.devices = data.device;
			data.device = undefined;	
			callback(data);	
 		});
	});

}

Pyntemp.Telldus.startDevice = function (turnOn, deviceid, callback) {
	var path = "device/turnOff?id=" + deviceid;
	if (turnOn) {
		path = "device/turnOn?id=" + deviceid;
	}
	Pyntemp.Telldus.getAuthorization(function (){
		Pyntemp.Telldus.getResource(path, function (data) {
			callback(data);	
 		});
	});

}


Pyntemp.Telldus.getResource = function(path, callback){
	Pyntemp.Telldus.oa.getProtectedResource("http://api.telldus.com/json/" + path, "GET", 
		'4f356623ba5c9c7fadbe6f771c6e58d5050a93289', //TODO: replace with oauth_access_token
		'92ffe551f0b154a4c4fe065141fc39b3',  //TODO: replace with oauth_access_token_secret
		function (error, data, response) {
			callback(JSON.parse(data));
  		}
	);	
}

Pyntemp.Telldus.getAuthorization = function(callback) {
	var OAuth = require('oauth').OAuth;
	
	var oa = new OAuth("http://api.telldus.com/oauth/requestToken",
	                  "http://api.telldus.com/oauth/accessToken",
	                  "FEHUVEW84RAFR5SP22RABURUPHAFRUNU",
	                  "ZUXEVEGA9USTAZEWRETHAQUBUR69U6EF",
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

exports.getSensorList = Pyntemp.Telldus.getSensorList;
exports.getDevices = Pyntemp.Telldus.getDevices;
exports.startDevice = Pyntemp.Telldus.startDevice;