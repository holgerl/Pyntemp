var Pyntemp = {};

var http = require('http');
var fs = require('fs');
var url = require("url");
var util = require('util');

Pyntemp.Telldus = require('./telldus.js');

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


