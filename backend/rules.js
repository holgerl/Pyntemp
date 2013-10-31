var fs = require('fs');

var Rule = function(deviceId, sensorId, deviceName, sensorName, onThreshold, offThreshold) {
	this.deviceId = deviceId;
	this.sensorId = sensorId;
	this.deviceName = deviceName;
	this.sensorName = sensorName;
	this.onThreshold = onThreshold;
	this.offThreshold = offThreshold;
}

var writeRules = function(rules, callback) {
	fs.writeFile("./data/rules.txt", JSON.stringify(rules), function(err) {
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
	fs.readFile("./data/rules.txt", function (err, data) {
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

var evaluateRules = function() {
	readRules(function(rules) {
		
	});
}

module.exports.Rule = Rule;
module.exports.getRules = getRules;
module.exports.addRule = addRule;
module.exports.removeRule = removeRule;
module.exports.evaluateRules = evaluateRules;