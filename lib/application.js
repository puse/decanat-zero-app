var _		= require('lodash');

var Context = require('./primitives/context.js'),
    Route   = require('./primitives/route.js'),
    Scene   = require('./primitives/scene.js'),
    View	= require('./primitives/view.js');

var app = {};

app.init = function(){
	this.cache = {};
	this.settings = {};
	this.defaultConfiguration();
};

app.defaultConfiguration = function(){
	// setup locals
	this.locals = Object.create(null);

	// default locals
	this.locals.settings = this.settings;
};

// * * * 

// 

var routeCallbacks = []; 

/**
 * Perform initial dispatch.
 */

var dispatch = true;

/**
 * Running flag.
 */

var running;

/**
 * [base description]
 * @type {String}
 */
var base = '';

/**
 * [all description]
 * @param  {[type]}   path [description]
 * @param  {Function} fn   [description]
 * @return {[type]}        [description]
 */

app.all = function(path, fn){
    var args = _.rest(arguments);

    if ('function' === typeof path) {
		args.unshift(path);
        path = '*';
    }

    var route = new Route(path);

    if (args.length === 1) return register(fn);

    _.forEach(args, register);

    function register(fn) {
    	routeCallbacks.push(route.middleware(fn));
    }
};


/**
 * Get or set basepath to `path`.
 *
 * @param {String} path
 * @api public
 */

app.base = function(path){
    if (0 == arguments.length) return base;
    base = path;
};

/**
 * Bind with the given `options`.
 *
 * Options:
 *
 *    - `click` bind to click events [true]
 *    - `popstate` bind to popstate [true]
 *    - `dispatch` perform initial dispatch [true]
 *
 * @param {Object} options
 * @api public
 */

app.listen = function(options){
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    
    delegate(options.popstate, options.click);

    if (!dispatch) return;
    var url = location.pathname + location.search + location.hash;
    this.replace(url, null, true, dispatch);
};

/**
 * Unbind click and popstate event handlers.
 *
 * @api public
 */

app.stopListening = function(){
    running = false;
    undelegate();
};

/**
 * Show `path` with optional `state` object.
 *
 * @param {String} path
 * @param {Object} state
 * @param {Boolean} dispatch
 * @return {Context}
 * @api public
 */

app.show = function(path, state, dispatch){
    var ctx = new Context(path, state),
        scn = new Scene(null, this);

    if (false !== dispatch) this.dispatch(ctx, scn);
    if (!ctx.unhandled) ctx.pushState();

    return ctx;
};

/**
 * Replace `path` with optional `state` object.
 *
 * @param {String} path
 * @param {Object} state
 * @return {Context}
 * @api public
 */

app.replace = function(path, state, init, dispatch){
    var ctx = new Context(path, state),
        scn = new Scene(null, this);

    ctx.init = init;

    if (null == dispatch) dispatch = true;
    if (dispatch) this.dispatch(ctx, scn);
    
    ctx.save();
    
    return ctx;
};

/**
 * Dispatch the given `ctx`.
 *
 * @param {Object} ctx
 * @api private
 */

app.dispatch = function(ctx, scn){
    var i = 0;

    function next(err) {
        var fn = routeCallbacks[i++];
        if (!fn) return unhandled(ctx, scn);
        fn(ctx, scn, next);
    }

    next();
};


/**
 * [location description]
 * @param  {[type]} path [description]
 * @param  {[type]} stop [description]
 * @return {[type]}      [description]
 */

app.location = function(path, stop) {
    if (!stop) return this.show(path);

    this.stopListening();
    window.location = path;
};


// * * *

var viewsCollection = {};

app.engine = function(alias, fn){
	var Viewport = getView(proto);

	viewsCollection[alias] = new Viewport();

	function getView(proto) {
		if (_.isFunction(proto)) {
			return proto.call(this, View);
		} 

		proto = proto || {};
		return View.extend(proto);
	}

	return viewsCollection[alias];
};


app.render = function(alias, data, fn) {
	var view = viewsCollection[alias] || this.engine(alias);

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



/**
 * Unhandled `ctx`. When it's not the initial
 * popstate then redirect. If you wish to handle
 * 404s on your own use `page('*', callback)`.
 *
 * @param {Context} ctx
 * @api private
 */

function unhandled(ctx, scn) {
    var current = window.location.pathname + window.location.search;
    if (current == ctx.canonicalPath) return;
    app.stopListening();
    ctx.unhandled = true;
    window.location = ctx.canonicalPath;
}


/**
 * [delegate description]
 * @return {[type]} [description]
 */

function delegate(popstate, click) {
	var addEventListener = _.partialRight(window.addEventListener, false);

    if (popstate) addEventListener('popstate', onpopstate);
    if (click) addEventListener('click', onclick);
};

/**
 * [undelegate description]
 * @return {[type]} [description]
 */

function undelegate() {
	var removeEventListener = _.partialRight(window.removeEventListener, false);

    removeEventListener('popstate', onpopstate);
    removeEventListener('click', onclick);
};

/**
 * Handle "populate" events.
 */

function onpopstate(e) {
    if (e.state) {
        var path = e.state.path;
        app.replace(path, e.state);
    }
}

/**
 * Handle "click" events.
 */

function onclick(e) {
    if (1 != which(e)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;

    // ensure link
    var el = e.target;
    while (el && 'A' != el.nodeName) el = el.parentNode;
    if (!el || 'A' != el.nodeName) return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (el.pathname == location.pathname && (el.hash || '#' == link)) return;

    // Check for mailto: in the href
    if (link.indexOf("mailto:") > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;

    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // same page
    var orig = path + el.hash;

    path = path.replace(base, '');
    if (base && orig == path) return;

    e.preventDefault();
    app.show(orig);
}

/**
 * Event button.
 */

function which(e) {
    e = e || window.event;
    return null == e.which
        ? e.button
        : e.which;
}

/**
 * Check if `href` is the same origin.
 */

function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return 0 == href.indexOf(origin);
}
