(function(Simple, Mustache) {

  var Pyntemp = window.Pyntemp = {};

  Pyntemp.start = function() {
    var sensors = new Pyntemp.Sensors();
    var el = $("#sensors");
    var view = new Pyntemp.SensorsView({sensors: sensors, el: el});
    sensors.fetch();
  };

  Pyntemp.Sensors = Simple.Model.extend({
    dataType: "json",
    initialize: function() {
        this.url = "http://localhost:1337/sensors";
    }
  });

  Pyntemp.SensorsView = Simple.View.extend({
    template: 'heihei',
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

/*
  BEKK.User = Simple.Model.extend({
    dataType: "jsonp",
    initialize: function() {
        this.url = "https://api.twitter.com/1/users/show.json?screen_name=anjasvartberg";
    } 
  });

  BEKK.UserView = Simple.View.extend({
    template: '<h2>{{name}}</h2>' +
      '<img src="{{profile_image_url}}" alt="{{name}}">' +
      '<ul>' +
        '<li>Followers: <span class="followers">{{followers_count}}</span></li>' +
        '<li>Following: <span class="following">{{friends_count}}</span></li>' +
        '<li>Monologs: <span class="monologs">{{monologs}}</span></li>' +
      '</ul>',
	initialize: function(options) {
		this.user = options.user;
    this.user.on("fetch:finished", this.render, this);
    this.el = options.el;
	},
  render: function() {
    var html = Mustache.to_html(this.template, this.user.attrs());
    this.el.html(html);
  }
  });
*/
})(Simple, Mustache);