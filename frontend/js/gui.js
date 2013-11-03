window.Pyntemp = window.Pyntemp || {};

Pyntemp.gui = {};

$("")
Pyntemp.gui.toggleAccordian = function () {
	var target = $(event.target);
  	target.siblings().toggle();
}

Pyntemp.gui.toggleButton = function(){
	var self= $(this);
    self.siblings("li").removeClass("on");
    $(this).addClass("on"); 
};
