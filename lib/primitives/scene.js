var _		= require('lodash'),
	$		= require('zepto');

var Premiss = require('premiss');

var View;

View = Premiss.View.extend({
	locals: {},
	title: function(title) {
		if (arguments.length === 0) return document.title;
		document.title = title;
	},
	initialize: function(options, app) {
		this.app = app;

		return this;
	},
	render: function(alias, data, fn) {
		if (_.isFunction(data)) {
			fn = data;
			data = {};
		}

		data && data.locals = _.extend({}, this.locals, data.locals);

		try {
			this.app.render(alias, data, fn);
		} catch(err) {}

		return this;
	}
});

module.exports = View;