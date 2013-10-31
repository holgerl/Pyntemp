var Pyntemp = {};

var http = require('http');
var fs = require('fs');
var url = require("url");
var util = require('util');

//Pyntemp.Telldus = require('./telldus.js');
Pyntemp.Telldus = require('./mock-telldus.js');

Pyntemp.Rules = require('./rules.js');

http.createServer(function (request, response) {
	var parsedUrl = url.parse(request.url, true);
	
	if (parsedUrl.pathname == "/") {
		response.writeHead(302, {'Location': 'index.html'});
		response.end();
	}

	if (parsedUrl.pathname == "/sensors") {
		Pyntemp.Telldus.getSensorList(Pyntemp.writeJson(response));
	} else if (parsedUrl.pathname == "/devices") {
		Pyntemp.Telldus.getDevices(Pyntemp.writeJson(response));
	} else if (parsedUrl.pathname== "/startDevice") {
		var deviceid = parsedUrl.query.id;
		Pyntemp.Telldus.startDevice(true, deviceid, Pyntemp.writeJson(response));
	} else if (parsedUrl.pathname== "/stopDevice") {
		var deviceid = parsedUrl.query.id;
		Pyntemp.Telldus.startDevice(false, deviceid, Pyntemp.writeJson(response));
	} else if (parsedUrl.pathname== "/rules") {
		Pyntemp.Rules.getRules(Pyntemp.writeJson(response));
	} else if (parsedUrl.pathname== "/addRule") {
		var deviceId = parsedUrl.query.deviceId;
		var sensorId = parsedUrl.query.sensorId;
		var deviceName = parsedUrl.query.deviceName;
		var sensorName = parsedUrl.query.sensorName;
		var onThreshold = parseInt(parsedUrl.query.onThreshold);
		var offThreshold = parseInt(parsedUrl.query.offThreshold);
		Pyntemp.Rules.addRule(new Pyntemp.Rules.Rule(deviceId, sensorId, deviceName, sensorName, onThreshold, offThreshold), Pyntemp.writeJson(response));
	} else if (parsedUrl.pathname== "/removeRule") {
		var index = parsedUrl.query.index;
		Pyntemp.Rules.removeRule(index, Pyntemp.writeJson(response));
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

Pyntemp.writeJson = function(response) {
	return function(result) {
		response.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
		response.end(JSON.stringify(result), 'utf-8');			
	}
}

Pyntemp.getDateString = function() {
	var addZeroIfShort = function(number) {
		return number < 10 ? "0"+number : number;
	}
	var currentdate = new Date();
	var year = addZeroIfShort(currentdate.getFullYear());
	var month = addZeroIfShort((currentdate.getMonth()+1));
	var date = addZeroIfShort(currentdate.getDate());
	var hours = addZeroIfShort(currentdate.getHours());
	var minutes = addZeroIfShort(currentdate.getMinutes());
	var seconds = addZeroIfShort(currentdate.getSeconds());
	return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
}

Pyntemp.intervalFunction = function() {
	console.log("-- " + Pyntemp.getDateString() + " --");
	Pyntemp.Telldus.getSensorList(function(sensors) {
		Pyntemp.Telldus.getDevices(function(devices) {
			Pyntemp.Rules.evaluateRules(sensors.sensors, devices.devices, Pyntemp.Telldus);
		});
	});
}

Pyntemp.intervalFunction();
setInterval(Pyntemp.intervalFunction, 1000*5);

