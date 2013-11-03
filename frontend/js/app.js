(function(Simple, Mustache) {

  window.Pyntemp = window.Pyntemp || {};

  Pyntemp.start = function() {
    var sensors = new Pyntemp.Sensors();
    var el = $("#sensors");
    var view = new Pyntemp.Sensors.SensorsView({sensors: sensors, el: el});
    
	var devices = new Pyntemp.Devices();
    var el = $("#devices");
    var view = new Pyntemp.Devices.DevicesView({devices: devices, el: el});
	
    var rules = new Pyntemp.Rules();
    var el = $("#rules");
    var view = new Pyntemp.Rules.RulesView({rules: rules, el: el});
  
    var el = $("#newrule");
    var view = new Pyntemp.Rules.NewRuleView({devices: devices, sensors: sensors, el: el});
  
    
	  rules.fetch();
    devices.fetch();
    sensors.fetch();
  }

  Pyntemp.Sensors = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "http://localhost:1337/sensors";
    }
  })

  Pyntemp.Sensors.SensorsView = Simple.View.extend({
    template: '<h3 class="accordianTrigger">Sensorer</h3><ul>' + 
      '{{#sensors}}' +
      '<li> {{name}} : {{temperature}} grader Celcius, {{humidity}} % luftfuktighet  </li>' +
      '{{/sensors}}' +
      '</ul>',
    initialize: function(options) {
      this.sensors = options.sensors;
      this.sensors.on("fetch:finished", this.render, this);
      this.el = options.el;
      this.el.on("click", ".accordianTrigger", Pyntemp.gui.toggleAccordian);

    },
    render: function() {
      var html = Mustache.to_html(this.template, this.sensors.attrs());
      this.el.html(html);
    }
  });
 
  Pyntemp.Devices = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "http://localhost:1337/devices";
    }
  })

  Pyntemp.Devices.DevicesView = Simple.View.extend({
    template: '<h3 class="accordianTrigger">Enheter</h3><ul class="list"> ' + 
      '{{#devices}}' +
      '<li id="{{id}}">' + 
      '<ul class="toggleButton">' + 
        '<li><a id="{{id}}" class="stopDeviceButton" href="#">OFF</a></li>' + 
        '<li class="on"><a id="{{id}}" class="startDeviceButton" href="#">ON</a></li>' +
      '</ul>' +
      '<span>{{name}}</span>' + 
      '</li>' +
      '{{/devices}}' +
      '</ul>',
    initialize: function(options) {
      this.devices = options.devices;
      this.devices.on("fetch:finished", this.render, this);
      this.el = options.el;
      var deviceAction = new Pyntemp.Devices.DeviceAction();
      this.el.on("click", ".startDeviceButton", function(event) {
        deviceAction.startDevice(event.currentTarget.id);
      });
      this.el.on("click", ".stopDeviceButton", function(event) {
        deviceAction.stopDevice(event.currentTarget.id);
      });
      this.el.on("click", ".accordianTrigger", Pyntemp.gui.toggleAccordian);
      this.el.on("click", "ul.toggleButton li", Pyntemp.gui.toggleButton);
    },
    render: function() {
      var html = Mustache.to_html(this.template, this.devices.attrs());
      this.el.html(html);
    }
  });

  Pyntemp.Devices.DeviceAction = Simple.Model.extend({
    dataType: "json",
    deviceId: "",
    initialize: function() {
    },
    startDevice: function(deviceid) {
        this.url = "http://localhost:1337/startDevice?id=" + deviceid;  
        this.fetch();
    },
    stopDevice: function(deviceid) {
        this.url = "http://localhost:1337/stopDevice?id=" + deviceid; 
        this.fetch(); 
    }
  });

  Pyntemp.UserInput = Simple.Model.extend({
    template: '',
    initialize: function() {
    }
  });
  
  Pyntemp.Rules = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "http://localhost:1337/rules";
    }
  })

  Pyntemp.Rules.NewRuleView = Simple.View.extend({
    template: '<h3 class="accordianTrigger">Lag ny regel</h3><div>' +
		'Turn on ' + 
		'<select id="selectDevice">' +
		  '{{#devices}}' +
		  '<option value="{{id}}">{{name}}</option>' +
          '{{/devices}}' +
		'</select>' +
		' if ' +
		'<select id="selectSensor">' +
          '{{#sensors}}' +
		  '<option value="{{id}}">{{name}}</option>' +
          '{{/sensors}}' +
		'</select>' +
		' is lower than ' +
		'<input id="onThreshold" size="2" type="text" value="0"/> &deg;C, ' +
		'then turn it off when it reaches ' +
		'<input id="offThreshold" size="2" type="text" value="0"/> &deg;C' +
		' <input id="saveRule" type="submit" value="save"/></div>',
    initialize: function(options) {
      this.sensors = options.sensors;
      this.sensors.on("fetch:finished", this.render, this);
      this.devices = options.devices;
      this.devices.on("fetch:finished", this.render, this);
      this.el = options.el;
      this.el.on("click", ".accordianTrigger", Pyntemp.gui.toggleAccordian);

	  
	  var ruleAction = new Pyntemp.Rules.RuleAction();  
	  this.el.on("click", "#saveRule", function(event) {
		var deviceId = $('#selectDevice').find(":selected").attr("value");
		var deviceName = $('#selectDevice').find(":selected").text();
		var sensorId = $('#selectSensor').find(":selected").attr("value");
		var sensorName = $('#selectSensor').find(":selected").text();
		var onThreshold = $('#onThreshold').val();
		var offThreshold = $('#offThreshold').val();
        ruleAction.saveRule(deviceId, sensorId, deviceName, sensorName, onThreshold, offThreshold);
		
		ruleAction.on("fetch:finished", function() {window.location.reload()}, this);
      });
    },
    render: function() {
      var html = Mustache.to_html(this.template, {sensors: this.sensors.attrs().sensors, devices: this.devices.attrs().devices});
      this.el.html(html);
    }
  });
  
  Pyntemp.Rules.RuleAction = Simple.Model.extend({
    dataType: "json",
    initialize: function() {},
    saveRule: function(deviceid, sensorId, deviceName, sensorName, onThreshold, offThreshold) {
        this.url = "http://localhost:1337/addRule?deviceId=" + deviceid + "&sensorId=" + sensorId + "&deviceName=" + deviceName + "&sensorName=" + sensorName + "&onThreshold=" + onThreshold + "&offThreshold=" + offThreshold;  
        this.fetch();
    },
    deleteRule: function(index) {
        this.url = "http://localhost:1337/removeRule?index=" + index; 
        this.fetch(); 
    }
  });
  
  Pyntemp.Rules.RulesView = Simple.View.extend({
    template: '<h3 class="accordianTrigger">Regler</h3>' +
		'<ul>' +
			'{{#rules}}' +
			'<li>' +
				'Turn on <strong>{{deviceName}}</strong> if <strong>{{sensorName}}</strong> is lower than <strong>{{onThreshold}}</strong> &deg;C then turn it off when it reaches <strong>{{offThreshold}}</strong> &deg;C <input type="submit" value="delete"/>' +
			'</li>' +
			'{{/rules}}' +
		'</ul>',
    initialize: function(options) {
      this.rules = options.rules;
      this.rules.on("fetch:finished", this.render, this);
      this.el = options.el;
      this.el.on("click", ".accordianTrigger", Pyntemp.gui.toggleAccordian);
    },
    render: function() {
      var html = Mustache.to_html(this.template, this.rules.attrs());
      this.el.html(html);
    }
  });
  
})(Simple, Mustache);