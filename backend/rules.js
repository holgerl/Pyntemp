var fs = require('fs');

process = process || {};
process.cwd = process.cwd || function() {return "../"};

var rulesFile = process.cwd() + "/backend/data/rules.txt";

var Rule = function(deviceId, sensorId, deviceName, sensorName, onThreshold, offThreshold) {
	this.deviceId = deviceId;
	this.sensorId = sensorId;
	this.deviceName = deviceName;
	this.sensorName = sensorName;
	this.onThreshold = onThreshold;
	this.offThreshold = offThreshold;
}

var writeRules = function(rules, callback) {
	fs.writeFile(rulesFile, JSON.stringify(rules), function(err) {
		if(err) {
			callback({result: "failed"});
			throw err;
		}
		callback({result: "success"});
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

var readRules = function(callback) {
	fs.readFile(rulesFile, function (err, data) {
		if (err) {
			callback({result: "failed"});
			throw err;
		}
		if ((data + "").trim().length > 0) 
			var rules = JSON.parse(data + "");
		else
			var rules = [];
		
		callback(rules);
	});
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

var evaluateRules = function(sensorList, deviceList, Telldus) {
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
				Telldus.startDevice(true, device.id, function() {});
			} else if (temperature >= rule.offThreshold) {
				console.log("-> TURNING OFF " + device.name + verboseText);
				Telldus.startDevice(false, device.id, function() {});
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