var Emitter = require('emitter-component');

var _ 		= require('lodash');

var proto	= require('./application.js');

function createApplication() {
	function app() {
		
		return this;
	}

	Emitter.mixin(app);

	_.extend(app, proto);
	
	return app;
};


module.exports = createApplication;