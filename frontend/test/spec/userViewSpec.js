describe("The user view", function(){

    beforeEach(function () {
        this.server = sinon.fakeServer.create();
        var statusCode = 200;
        var headers = {"Content-Type" : "application-js"};
        var data = '{"id": 1, "name"  : "Anja Svartberg"}';
        this.server.respondWith([statusCode, headers, data]);
    });
    xit("should have a user when initialized", function(){
        var user = {};
     	var view = new BEKK.UserView({ user: user});
        expect(view.user).toBeDefined();
    });

    it("should show user info when rendered", function(){
        var user = new BEKK.User();
        user.dataType = "json";
        var el = $("<div></div>");
        var view = new BEKK.UserView({user: user, el: el});
        user.fetch();
        this.server.respond();
        expect(view.DOM("h2")).toHaveText("Anja Svartberg");
    });

    xit("should update view when monolog is added", function() {
    });

    afterEach(function () {
        this.server.restore();
    });

});
