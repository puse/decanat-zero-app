var _ = {
        forEach: require('lodash.foreach'),
        rest: require('lodash.rest')
    };


var Context = require('context'),
    Route   = require('route'),
    Scene   = require('scene');

/**
 * Perform initial dispatch.
 */

var dispatch = true;

/**
 * Base path.
 */

var base = '';

/**
 * Running flag.
 */

var running;

var router = {};

/**
 * Callback functions.
 */

router.callbacks = [];



/**
 * Get or set basepath to `path`.
 *
 * @param {String} path
 * @api public
 */

router.base = function(path){
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

router.start = function(options){
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) window.addEventListener('click', onclick, false);
    if (!dispatch) return;
    var url = location.pathname + location.search + location.hash;
    router.replace(url, null, true, dispatch);
};

/**
 * Unbind click and popstate event handlers.
 *
 * @api public
 */

router.stop = function(){
    running = false;
    removeEventListener('click', onclick, false);
    removeEventListener('popstate', onpopstate, false);
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

router.show = function(path, state, dispatch){
    var ctx = new Context(path, state),
        scn = new Scene();

    if (false !== dispatch) router.dispatch(ctx, scn);
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

router.replace = function(path, state, init, dispatch){
    var ctx = new Context(path, state),
        scn = new Scene();

    ctx.init = init;

    if (null == dispatch) dispatch = true;
    if (dispatch) router.dispatch(ctx, scn);
    
    ctx.save();
    
    return ctx;
};

/**
 * Dispatch the given `ctx`.
 *
 * @param {Object} ctx
 * @api private
 */

router.dispatch = function(ctx, scn){
    var i = 0;

    function next() {
        var fn = router.callbacks[i++];
        if (!fn) return unhandled(ctx, scn);
        fn(ctx, scn, next);
    }

    next();
};

function mixin(app) {
    app.page = function(path, fn){
        var fns = _.rest(arguments);

        if ('function' === typeof path) {
            fns.unshift(path);
            path = '*';
        }

        var route = new Route(path);

        _.forEach(fns, function(fn){
            router.callbacks.push(route.middleware(fn));
        });
    };

    app.location = function(path, stop) {
        if (!stop) return router.show(path);

        router.stop();
        window.location = path;
    };

    app.listen = function(options){
        router.start(options);
    };

    app.stopListening = function(){
        router.stopListening();
    };
}

module.exports = function(options) {
    if (options.Scene) Scene = options.Scene;

    if (options.base) router.base(options.base);

    return { __decanat: mixin };
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
    router.stop();
    ctx.unhandled = true;
    window.location = ctx.canonicalPath;
}

/**
 * Handle "populate" events.
 */

function onpopstate(e) {
    if (e.state) {
        var path = e.state.path;
        router.replace(path, e.state);
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
    router.show(orig);
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
