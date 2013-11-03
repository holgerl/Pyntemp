var Pyntemp = {};
Pyntemp.Telldus = {};

var sessions = require('./lib/session.js');

Pyntemp.Telldus.getSensorList = function(session, callback) {
	console.log("called getSensorList on MOCK");
	callback({"sensors":[
		{"id":"244836","name":"[MOCK] Temp Pynten gang inne","temperature":"21.2","humidity":"61"},
		{"id":"204198","name":"[MOCK] Temp Pynten gang ute","temperature":"15.1","humidity":"84"}
	],"length":2});
}

Pyntemp.Telldus.getDevices = function(session, callback) {
	console.log("called getDevices on MOCK");
	callback({"devices":[{"id":"165525","name":"[MOCK] Pynten fyr","state":0,"statevalue":"0","methods":0,"type":"device","client":"42791","clientName":"Pynten","online":"1","editable":1},{"id":"294750","name":"[MOCK] Pynten lys kjøkkenbenk","state":0,"statevalue":"0","methods":0,"type":"device","client":"42791","clientName":"Pynten","online":"1","editable":1},{"id":"298157","name":"[MOCK] Hestehagen 01 lys stue","state":0,"statevalue":"0","methods":0,"type":"group","client":"75634","clientName":"Hestehagen","online":"1","editable":1,"devices":"298154,298155"},{"id":"298131","name":"[MOCK] Hestehagen 02 lampetter kjellerstue","state":0,"statevalue":"0","methods":0,"type":"group","client":"75634","clientName":"Hestehagen","online":"1","editable":1,"devices":"298129,298130"},{"id":"298156","name":"[MOCK] Hestehagen kjøkken","state":0,"statevalue":"0","methods":0,"type":"device","client":"75634","clientName":"Hestehagen","online":"1","editable":1},{"id":"298154","name":"[MOCK] Hestehagen lampe stue","state":0,"statevalue":"0","methods":0,"type":"device","client":"75634","clientName":"Hestehagen","online":"1","editable":1},{"id":"298129","name":"[MOCK] Hestehagen lampett høyre kjellerstue","state":0,"statevalue":"0","methods":0,"type":"device","client":"75634","clientName":"Hestehagen","online":"1","editable":1},{"id":"298130","name":"[MOCK] Hestehagen lampett venstre kjellerstue","state":0,"statevalue":"0","methods":0,"type":"device","client":"75634","clientName":"Hestehagen","online":"1","editable":1},{"id":"298155","name":"[MOCK] Hestehagen leselampe stue","state":0,"statevalue":"0","methods":0,"type":"device","client":"75634","clientName":"Hestehagen","online":"1","editable":1}]});
}

Pyntemp.Telldus.startDevice = function(session, turnOn, deviceid, callback) {
	console.log("called startDevice(" + turnOn + ", " + deviceid + ") on MOCK");
	callback({"status":"success"});
}

Pyntemp.Telldus.doAuthorizationRedirect = function(request, response) {
	var session = sessions.lookupOrCreate(request);
	session.data.oa = {};
	response.writeHead(302, {'Location': 'http://127.0.0.1:1337/index.html'});
	response.end();
}

Pyntemp.Telldus.loginCallback = function(request, response) {
	response.writeHead(302, {'Location': 'http://127.0.0.1:1337/index.html'});
	response.end();
}

exports.getSensorList = Pyntemp.Telldus.getSensorList;
exports.getDevices = Pyntemp.Telldus.getDevices;
exports.startDevice = Pyntemp.Telldus.startDevice;
exports.doAuthorizationRedirect = Pyntemp.Telldus.doAuthorizationRedirect;
exports.loginCallback = Pyntemp.Telldus.loginCallback;