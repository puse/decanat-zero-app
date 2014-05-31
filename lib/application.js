var _		= require('lodash');

var Route   = require('./primitives/route.js');

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

    //
    app.on('mounted', function(path){
        this.base(path);
        this.stopListening();
    });
};

var vp = '20';

// * * * 

// Routing
// =======

// Collection to store callbacks for each route handler

var routeCallbacks = []; 

// Perform initial dispatch.

var dispatch = true;

// `running` flag.
// Falsy by default, gets `true` when started, 
// and `false` when mounted, 
// so inspection will take place only on root instance of application


var running;

// Mount path. Defaults to `''` on the root application

var mountpath = '';

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


// Get or set `mountpath` to `path`.

app.base = function(path){

    if (0 == arguments.length) {
        var root = this.master 
                ? this.master.base() 
                : '';
        return root + mountpath;
    }

    mountpath = path;
};

// Bind with the given `options`.
//
// Options:
//
// - `click` bind to click events [true]
// - `popstate` bind to popstate [true]
// - `dispatch` perform initial dispatch [true]

app.listen = function(options){
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    
    if (options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (options.click) window.addEventListener('click', onclick, false);

    if (!dispatch) return;
    var url = location.pathname + location.search + location.hash;
    this.replace(url, null, true, dispatch);
};

// Unbind click and popstate event handlers.

app.stopListening = function(){
    running = false;

    window.removeEventListener('popstate', onpopstate);
    window.removeEventListener('click', onclick);
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
        scn = vp;

    if (false !== dispatch) this.dispatch(ctx, scn);
    if (!ctx.unhandled) ctx.pushState();

    return ctx;
};



// Helper for redirections

app.location = function(path, stop) {
    if (!stop) return this.show(path);

    this.stopListening();
    window.location = path;
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
        scn = vp;

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

// 

var mounted = [];

app.use = function(path, fn) {
    var slave;

    if (fn.dispatch) slave = fn;

    if (!slave) app.all(path, fn);

    slave.master = this;
    slave.emit('mounted', path);

    mounted.push(slave);
};


// Context
// -------


// Initialize a new "request" `Context`
// with the given `path` and optional initial `state`
// 
// Given `path` is "canonical" path,
// which internally transforms based on mounted path


function Context(path, state) {
    var base = this.base();

    if ('/' == path[0] && 0 != path.indexOf(base)) path = base + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? path.slice(i + 1) : '';
    this.pathname = ~i ? path.slice(0, i) : path;
    this.params = [];

    // fragment
    this.hash = '';
    if (!~this.path.indexOf('#')) return;
    var parts = this.path.split('#');
    this.path = parts[0];
    this.hash = parts[1] || '';
    this.querystring = this.querystring.split('#')[0];
}


/**
 * Push state.
 *
 * @api private
 */

Context.prototype.pushState = function(){
    history.pushState(this.state, this.title, this.canonicalPath);
};

/**
 * Save the context state.
 *
 * @api public
 */

Context.prototype.save = function(){
    history.replaceState(this.state, this.title, this.canonicalPath);
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

// Event delegation
// ----------------

// Handle "populate" events.

function onpopstate(e) {
    if (e.state) {
        var path = e.state.path;
        app.replace(path, e.state);
    }
}

// Handle "click" events.

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

    // path = path.replace(base, '');
    // if (base && orig == path) return;

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

