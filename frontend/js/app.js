(function(Simple, Mustache) {

  var Pyntemp = window.Pyntemp = {};

  Pyntemp.start = function() {
    var sensors = new Pyntemp.Sensors();
    var el = $("#sensors");
    var view = new Pyntemp.SensorsView({sensors: sensors, el: el});
    sensors.fetch();
  }

  Pyntemp.Sensors = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "http://localhost:1337/sensors";
    }
  })

  Pyntemp.SensorsView = Simple.View.extend({
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
      console.log(this.sensors.attrs());
      var html = Mustache.to_html(this.template, this.sensors.attrs());
      this.el.html(html);
    }
  });

})(Simple, Mustache);