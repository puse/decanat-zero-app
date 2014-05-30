var Emitter = require('emitter-component');

function createApplication() {
	function app() {

	}
	
	return this;
};


/**
 * Expose `createApplication()`.
 */

exports = module.exports = createApplication;

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */

function Decanat() {
  function app(req, res, next) {
	app.handle(req, res, next);
  };

  mixin(app, proto);
  mixin(app, EventEmitter.prototype);

  app.request = { __proto__: req, app: app };
  app.response = { __proto__: res, app: app };
  app.init();
  return app;
}

 /**
  * Prototype object of application
  * @type {Object}
  */

var app = {};

Emitter.mixin(app);

app.locals	= {};
app.cache	= {};

/**
 * Set
 * @param {String} key   
 * @param {Mixed} value 
 */
app.set = function(key, value){
	var prev = this.locals[]
};

/**
 * Get
 * @param  {String}	key 
 * @return {Mixed}     
 */
app.get = function(key){
	return this.locals[key];
};



/** ------------------------------------------------- */

var router = require('./router.js'),
	engine = require('./engine.js');

app.plug = function(o) {
	var fn = o.__decanat;

	if (_.isFunction(fn)) fn(this); 
};

app.plug(engine('container'));

app.plug(router({ scene: app.scene() }))

function plug()