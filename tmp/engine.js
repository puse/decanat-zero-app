// ajax.js
// -------

var $ = require('zepto'),
	_ = {
		extend: require('lodash.extend'),
		result: require('lodash.result'),
		template: require('lodash.template'),
		isFunction: require('lodash.isfunction'),
		isString: require('lodash.isstring')
	};

var View	= require('./view.js'),
	Scene	= require('./scene.js');

var container = document.body;

var Archeview = View.extend({
		template: '',
		initialize: function(){
			if (this.el) this.data = this.$el.data();

			return this;
		},
		parent: function(){
			return container,
		},
		render: function(data){
			if (_.isString(this.template)) this.template = _.template(this.template);

			this.template(data);

			return this; 
		},
		create: function(){
			if (!this.el) this._ensureElement();

			var parent = _.result(this, 'parent');

			this._appendElement(parent);

			return this;
		}
	});

var cache = {};

function mixin(app) {

	Scene.prototype.render = function(alias, data, done){
		_.extend(data.locals, this.locals);
		app.render(alias, data, done);
	};

	app.register =  function(alias, proto){
		var Viewport = getView(proto);

		cache[alias] = new Viewport();

		function getView(proto) {
			if (_.isFunction(proto)) {
				return proto.call(this, View);
			} 

			proto = proto || {};
			return View.extend(proto);
		}

		return cache[alias];
	};

	app.render = function(alias, data, fn) {
		var view = cache[alias] || this.register(alias);

		// support callback function as second arg
		if (_.isFunction(data)) {
			fn = data, data = {};
		}

		data && data.locals = _.extend({}, this.locals, data.locals);

		try {
			view.render(data, fn);
		} catch (err) { }

		return this;
	};

	app.scene = function() {
		return Scene;
	};

};

module.exports = function(el){
	if (el) init(el);

    return { __decanat: mixin };
};

function init(el) {
	var $el = el instanceOf $ ? el : $(el);

	container = $el[0] || document.createElement('div');

	return this;	
}
