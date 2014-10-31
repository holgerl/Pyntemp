window.Pyntemp = window.Pyntemp || {};

Pyntemp.gui = {};

$("")
Pyntemp.gui.toggleAccordian = function () {
	var target = $(event.target);
  	target.siblings().toggle();
}

Pyntemp.gui.toggleButton = function(event){
	var self= $(this);
	event.preventDefault();
    self.siblings("li").removeClass("on");
    $(this).addClass("on"); 
};
