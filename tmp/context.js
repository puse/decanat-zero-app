
/**
 * Initialize a new "request" `Context`
 * with the given `path` and optional initial `state`.
 *
 * @param {String} path
 * @param {Object} state
 * @api public
 */

function Context(path, state) {
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
 * Expose `Context`.
 */

module.exports = Context;

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
