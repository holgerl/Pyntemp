var Pyntemp = {};

var http = require('http');
var fs = require('fs');
var url = require("url");
var util = require('util');

process.env = process.env || {};
var port = process.env.PORT || 1337;

var fileroot = process.cwd() + "/frontend";

var sessions = require(process.cwd() + '/backend/lib/session.js');

//Pyntemp.Telldus = require(process.cwd() + '/backend/telldus.js');
Pyntemp.Telldus = require(process.cwd() + '/backend/mock-telldus.js');

Pyntemp.Rules = require(process.cwd() + '/backend/rules.js');

http.createServer(function(request, response) {
	var session = sessions.lookupOrCreate(request);

	var parsedUrl = url.parse(request.url, true);
	
	if (session.data.oa === undefined && parsedUrl.pathname != "/login") {
		response.writeHead(302, {'Location': '/login', 'Set-Cookie': session.getSetCookieHeaderValue()});
		response.end();
		return;
	}
	
	if (parsedUrl.pathname == "/") {
		response.writeHead(302, {'Location': 'index.html'});
		response.end();
		return;
	}

	if (parsedUrl.pathname == "/sensors") {
		Pyntemp.Telldus.getSensorList(session, Pyntemp.writeJson(response));
	} else if (parsedUrl.pathname == "/devices") {
		Pyntemp.Telldus.getDevices(session, Pyntemp.writeJson(response));
	} else if (parsedUrl.pathname== "/startDevice") {
		var deviceid = parsedUrl.query.id;
		Pyntemp.Telldus.startDevice(session, true, deviceid, Pyntemp.writeJson(response));
	} else if (parsedUrl.pathname== "/stopDevice") {
		var deviceid = parsedUrl.query.id;
		Pyntemp.Telldus.startDevice(session, false, deviceid, Pyntemp.writeJson(response));
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
	} else if (parsedUrl.pathname== "/loginCallback") {
		Pyntemp.Telldus.loginCallback(request, response);
	} else if (parsedUrl.pathname== "/login") {
		Pyntemp.Telldus.doAuthorizationRedirect(request, response);
	} else {
		fs.readFile(fileroot + request.url, function(error, content) {
			if (error) {
				console.log('ERROR requesting ' + request.url);
				console.log(error);
				response.writeHead(500);
				response.end();
			} else {
				response.writeHead(200, {
					'Content-Type': 'text/html'
				});
				response.end(content, 'utf-8');
			}
		});		
	}
}).listen(port);
console.log('Server running at http://localhost:' + port);

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
	Pyntemp.Telldus.getSensorList(session, function(sensors) {
		Pyntemp.Telldus.getDevices(function(session, devices) {
			Pyntemp.Rules.evaluateRules(sensors.sensors, devices.devices, Pyntemp.Telldus);
		});
	});
}

Pyntemp.intervalFunction();
setInterval(Pyntemp.intervalFunction, 1000*60);

