function Scene() {
	this.locals = {};
	return this;
};

Scene.prototype.title = function(title){
	document.title = title;
	return this;
};

Scene.prototype.render = function(){};

Scene.prototype.save = function(){};

module.exports = Scene;