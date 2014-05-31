var $       = require('zepto'),
	_       = require('lodash');

var Premiss = require('premiss');


var scene = {};

scene.initialize = function(options, app){
    this.delegate();
    return this;
};

scene.delegate = function() { };

scene.undelegate = function() {
    this._undelegate();

    return this;
};

scene._appendElement = function(parent){
	if (!parent) parent = this.app && this.app.container()



	if (parent) parent.appendChild(el);

	return this;
};

scene._undelegate = function() {
    this.$el.off();

    return this;
};

module.exports = Premiss.View.extend(scene);

function getElement(el) {
    var $el = el instanceof $ ? el : $(el);
    return $el[0];
}