var fs = require('fs');

var rulesFile = process.cwd() + "/backend/data/rules.txt";
var sessionsFile = process.cwd() + "/backend/data/sessions.txt";

fs.openSync(rulesFile, "a");
fs.openSync(sessionsFile, "a");

var Rule = function(userId, deviceId, sensorId, deviceName, sensorName, onThreshold, offThreshold) {
	this.userId = userId;
	this.deviceId = deviceId;
	this.sensorId = sensorId;
	this.deviceName = deviceName;
	this.sensorName = sensorName;
	this.onThreshold = onThreshold;
	this.offThreshold = offThreshold;
}

var writeFile = function(filePath, data, callback) {
	fs.writeFile(filePath, JSON.stringify(data), function(err) {
		console.log(JSON.stringify(data));
		if(err) {
			callback({result: "failed"});
			throw err;
		}
		callback({result: "success"});
	});
}

var writeRules = function(rules, callback) {
	writeFile(rulesFile, rules, callback);
}

var writeSessions = function(sessions, callback) {
	writeFile(sessionsFile, sessions, function(data) {
		console.log(data);
		callback(data);
	});
}

var readFile = function(filePath, callback) {
	fs.readFile(filePath, function (err, data) {
		if (err) {
			callback({result: "failed"});
			throw err;
		}
		if ((data + "").trim().length > 0) 
			var data = JSON.parse(data + "");
		else
			var data = null;
		
		callback(data);
	});
}

var readRules = function(callback) {
	readFile(rulesFile, function(rules) {
		if(rules == null) rules = [];
		callback(rules);
	});
}

var readSessions = function(callback) {
	readFile(sessionsFile, function(sessions) {
		if(sessions == null) sessions = {};
		callback(sessions);
	});
}

var logMembers = function(object) {
	var string = "{";
	for (var member in object) {
		string += "\n" + member + ": " + object[member] + "\n";
	}
	if (string.length > 1) string += "\n"
	string += "}";
	console.log(string);
	return string;
}

var addRule = function(rule, callback) {
	readRules(function(rules) {
		rules.push(rule);
		writeRules(rules, callback);
	});
}

var removeRule = function(index, callback) {
	readRules(function(rules) {
		rules.splice(index, 1);
		writeRules(rules, callback);
	});
}

var getRules = function(callback) {
	readRules(function(rules) {
		callback({rules: rules});
	}); 
}

var updateSession = function(session, Telldus, callback) {
	readSessions(function(sessions) {
		Telldus.getUserProfile(session, function(data) {
			sessions[data.email] = session.data;
			writeSessions(sessions, callback);
		});
	});
}

var evaluateRules = function(session, sensorList, deviceList, Telldus) {
	var sensorMap = mapify(sensorList, function(sensor) {return sensor.id});
	var deviceMap = mapify(deviceList, function(device) {return device.id});

	readRules(function(rules) {
		for (var index in rules) {
			var rule = rules[index];
			var sensor = sensorMap[rule.sensorId];
			var device = deviceMap[rule.deviceId];
			var temperature = parseInt(sensor.temperature);
			var verboseText = " (" + sensor.name + " was " + temperature + " °C)";
			console.log("EVALUATING RULE " + JSON.stringify(rule));
			
			if (temperature <= rule.onThreshold) {
				console.log("-> TURNING ON " + device.name + verboseText);
				Telldus.startDevice(session, true, device.id, function() {});
			} else if (temperature >= rule.offThreshold) {
				console.log("-> TURNING OFF " + device.name + verboseText);
				Telldus.startDevice(session, false, device.id, function() {});
			} else {
				console.log("-> DID NOTHING " + device.name + verboseText);
			}
		}
	});
}

var mapify = function(list, keyFunction) {
	var map = {};
	for (var index in list) {
		var item = list[index];
		map[keyFunction(item)] = item;
	}
	return map;
}

module.exports.Rule = Rule;
module.exports.getRules = getRules;
module.exports.addRule = addRule;
module.exports.removeRule = removeRule;
module.exports.evaluateRules = evaluateRules;
module.exports.updateSession = updateSession;
module.exports.readSessions = readSessions;