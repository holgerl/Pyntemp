var Pyntemp = {};

var http = require('http');
var fs = require('fs');

http.createServer(function (request, response) {
	console.log(request.url);
	if (request.url == "/sensors") {
		response.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
		response.end(Pyntemp.init(), 'utf-8');
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

Pyntemp.init = function() {
	var sensors = new Pyntemp.Sensors();
	sensors.push(new Pyntemp.Sensor({title: "Outside", temperature: "-2"}));
	sensors.push(new Pyntemp.Sensor({title: "Kitchen", temperature: "5"}));
	sensors.push(new Pyntemp.Sensor({title: "Livingroom", temperature: "8"}));
	sensors.push(new Pyntemp.Sensor({title: "Bedroom", temperature: "6"}));
	return JSON.stringify(sensors);
}

Pyntemp.Sensor = function (sensor) {
	this.title = sensor.title;
	this.temperature = sensor.temperature;
}

Pyntemp.Sensors = function () {
}

Pyntemp.Sensors.prototype = Array.prototype;