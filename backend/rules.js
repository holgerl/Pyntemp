var fs = require('fs');

try {
	var databaseUrl = process.env.MONGOLAB_URI || "localhost:27017/pyntemp";
	var collections = ["rules", "sessions", "log"];
	var db = require("mongojs").connect(databaseUrl, collections);
} catch (err) {
	console.log("FAILED TO CONNECT TO DATABASE: " + err);
}
	
saveUpdateCallback = function(err, saved) {
	if (err) throw err;
	
	if (!saved) {
		console.log("No data saved/updated");
	} else { 
		console.log("Data saved/updated");
	}
}
	
var saveData = function(type, id, data, callback) {
	data.id = id;
	console.log("saving data: " + data);
	db[type].find({id: id}, function(err, foundData) {
		if (err) throw err;
		
		if (foundData.length == 0) {
			db[type].save(data, saveUpdateCallback);
		} else {
			db[type].update({id: id}, data, saveUpdateCallback);
		}
		callback({result: "success"});
	});
}

var loadData = function(type, id, callback) {
	if (callback == undefined) {
		console.log("ERROR: No callback defined");
		return;
	}

	db[type].find({id: id}, function(err, data) {
		if (err) throw err;
		
		if (data.length == 0) {
			console.log("No data found");
			callback(null)
		} else {
			console.log("Found data: " + data[0]);
			callback(data[0])
		}
	});
}

var Rule = function(userId, deviceId, sensorId, deviceName, sensorName, onThreshold, offThreshold) {
	this.userId = userId;
	this.deviceId = deviceId;
	this.sensorId = sensorId;
	this.deviceName = deviceName;
	this.sensorName = sensorName;
	this.onThreshold = onThreshold;
	this.offThreshold = offThreshold;
}

var writeRules = function(rules, callback) {
	saveData("rules", 0, rules, callback);
}

var writeSessions = function(sessions, callback) {
	saveData("sessions", 0, sessions, function(data) {
		console.log(data);
		callback(data);
	});
}

var readRules = function(callback) {
	loadData("rules", 0, function(rules) {
		if(rules == null || rules == undefined) rules = {rules:[]};
		callback(rules);
	});
}

var readSessions = function(callback) {
	loadData("sessions", 0, function(sessions) {
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
		rules.rules.push(rule);
		writeRules(rules, callback);
	});
}

var removeRule = function(index, callback) {
	readRules(function(rules) {
		rules.rules.splice(index, 1);
		writeRules(rules, callback);
	});
}

var getRules = function(callback) {
	readRules(function(rules) {
		callback(rules);
	}); 
}

var updateSession = function(session, Telldus, callback) {
	readSessions(function(sessions) {
		Telldus.getUserProfile(session, function(data) {
			sessions["0"] = session.data;
			writeSessions(sessions, callback);
		});
	});
}

var saveLog = function(msg) {
    db.log.save({time: new Date(), msg: msg}, function(err, saved) {
        if (err) throw err;
        if (!saved) throw new Error("No data saved/updated");
    });
    console.log(msg);
}

var readLogs = function(limit, callback) {
    return db.log.find({}, {'_id': false}).limit(limit).sort({time: -1}).toArray(function(err, data) {
        if (err) throw err;
		callback(data);
    });
}

var evaluateRules = function(session, sensorList, deviceList, Telldus) {
	var sensorMap = mapify(sensorList, function(sensor) {return sensor.id});
	var deviceMap = mapify(deviceList, function(device) {return device.id});
    
	readRules(function(rules) {
		for (var index in rules.rules) {
			var rule = rules.rules[index];
            saveLog("EVALUATING RULE " + index + ": " + JSON.stringify(rule));
			var sensor = sensorMap[rule.sensorId];
			var device = deviceMap[rule.deviceId];
			var temperature = parseInt(sensor.temperature);
			var verboseText = " (" + sensor.name + " was " + temperature + " °C)";
			if (temperature <= rule.onThreshold) {
				saveLog("-> TURNING ON " + device.name + verboseText);
				Telldus.startDevice(session, true, device.id, function() {});
			} else if (temperature >= rule.offThreshold) {
				saveLog("-> TURNING OFF " + device.name + verboseText);
				Telldus.startDevice(session, false, device.id, function() {});
			} else {
				saveLog("-> DID NOTHING " + device.name + verboseText);
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
module.exports.readLogs = readLogs;
module.exports.removeRule = removeRule;
module.exports.evaluateRules = evaluateRules;
module.exports.updateSession = updateSession;
module.exports.readSessions = readSessions;