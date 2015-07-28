var Pyntemp = {};
Pyntemp.Telldus = {};

var sessions = require('./lib/session.js');

Pyntemp.Telldus.getSensorList = function(session, callback) {
	console.log("called getSensorList on MOCK");
	callback({"sensors":[
		{"id":"244836","name":"Temp Pynten gang inne (m)","temperature":"21.2","humidity":"61"},
		{"id":"204198","name":"Temp Pynten gang ute (m)","temperature":"15.1","humidity":"84"}
	],"length":2});
}

Pyntemp.Telldus.getDevices = function(session, callback) {
	console.log("called getDevices on MOCK");
	callback({"devices":[{"id":"165525","name":"Pynten fyr (m)","state":0,"statevalue":"0","methods":0,"type":"device","client":"42791","clientName":"Pynten","online":"1","editable":1},{"id":"294750","name":"Pynten lys kjøkkenbenk (m)","state":0,"statevalue":"0","methods":0,"type":"device","client":"42791","clientName":"Pynten","online":"1","editable":1},{"id":"298157","name":"Hestehagen 01 lys stue (m)","state":0,"statevalue":"0","methods":0,"type":"group","client":"75634","clientName":"Hestehagen","online":"1","editable":1,"devices":"298154,298155"},{"id":"298131","name":"Hestehagen 02 lampetter kjellerstue (m)","state":0,"statevalue":"0","methods":0,"type":"group","client":"75634","clientName":"Hestehagen","online":"1","editable":1,"devices":"298129,298130"},{"id":"298156","name":"Hestehagen kjøkken (m)","state":0,"statevalue":"0","methods":0,"type":"device","client":"75634","clientName":"Hestehagen","online":"1","editable":1},{"id":"298154","name":"Hestehagen lampe stue (m)","state":0,"statevalue":"0","methods":0,"type":"device","client":"75634","clientName":"Hestehagen","online":"1","editable":1},{"id":"298129","name":"Hestehagen lampett høyre kjellerstue (m)","state":0,"statevalue":"0","methods":0,"type":"device","client":"75634","clientName":"Hestehagen","online":"1","editable":1},{"id":"298130","name":"Hestehagen lampett venstre kjellerstue (m)","state":0,"statevalue":"0","methods":0,"type":"device","client":"75634","clientName":"Hestehagen","online":"1","editable":1},{"id":"298155","name":"Hestehagen leselampe stue (m)","state":0,"statevalue":"0","methods":0,"type":"device","client":"75634","clientName":"Hestehagen","online":"1","editable":1}]});
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

Pyntemp.Telldus.getUserProfile = function(session, callback) {
	callback({"firstname":"Ola","lastname":"Nordmann","email":"ola@nordmann.no","credits":0,"pro":-1});
}

exports.getSensorList = Pyntemp.Telldus.getSensorList;
exports.getDevices = Pyntemp.Telldus.getDevices;
exports.startDevice = Pyntemp.Telldus.startDevice;
exports.doAuthorizationRedirect = Pyntemp.Telldus.doAuthorizationRedirect;
exports.loginCallback = Pyntemp.Telldus.loginCallback;
exports.getUserProfile = Pyntemp.Telldus.getUserProfile;