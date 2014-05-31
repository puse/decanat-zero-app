var Emitter = require('emitter-component');

var _ 		= require('lodash');

var Proto	= require('./application.js');

module.exports = function(){	
	function app(){
		return this;
	};

	Emitter(app);
	Proto(app);

	app.init();

	return app;
};