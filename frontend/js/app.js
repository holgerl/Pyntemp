(function(Simple, Mustache) {

  var Pyntemp = window.Pyntemp = {};

  Pyntemp.start = function() {
    var sensors = new Pyntemp.Sensors();
    var el = $("#sensors");
    var view = new Pyntemp.Sensors.SensorsView({sensors: sensors, el: el});
    sensors.fetch();
    var devices = new Pyntemp.Devices();
    var el = $("#devices");
    var view = new Pyntemp.Devices.DevicesView({devices: devices, el: el});
    devices.fetch();
  }

  Pyntemp.Sensors = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "http://localhost:1337/sensors";
    }
  })

  Pyntemp.Sensors.SensorsView = Simple.View.extend({
    template: '<ul>' + 
      '{{#sensors}}' +
      '<li> {{name}} : {{temperature}} grader Celcius, {{humidity}} % luftfuktighet  </li>' +
      '{{/sensors}}' +
      '</ul>',
    initialize: function(options) {
      this.sensors = options.sensors;
      this.sensors.on("fetch:finished", this.render, this);
      this.el = options.el;
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
    template: '<ul> ' + 
      '{{#devices}}' +
      '<li id="{{id}}"> {{name}}' + 
      '<input type="button" id="{{id}}" class="startDeviceButton" value="Start"></input>' +
      '<input type="button" id="{{id}}" class="stopDeviceButton" value="Stopp"></input>' +
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




})(Simple, Mustache);