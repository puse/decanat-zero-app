var _       = require('lodash'),
    $       = require('zepto');

var Emitter = require('emitter-component');

function View (options) {
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    return this;
}

// List of view options to be merged as properties.
var viewOptions = [
        'model', 'collection', 'el', 'id', 
        'attributes', 'className', 'tagName', 
        'parent', 'template', 'alias'
    ];

// Set up all inheritable **Backbone.View** properties and methods.
_.extend(View.prototype, Emitter.prototype, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    //
    template: '',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
        return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function() {
        this.delegate();
    },

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
        return this;
    },

    //
    //
    delegate: function(){
        return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
        this._removeElement();
        return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function() {
        this._undelegate();
        this.$el.remove();
    },

    //

    _undelegate: function() {
        this.$el.off();
        return this;
    },
    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.

    // Creates the `this.el` and `this.$el` references for this view using the
    // given `el` and a hash of `attributes`. `el` can be a CSS selector or an
    // HTML string, a jQuery context or an element. Subclasses can override
    // this to utilize an alternative DOM manipulation API and are only required
    // to set the `this.el` property.
    setElement: function(el) {
        this.$el = el instanceof $ ? el : $(el);
        this.el = this.$el[0];
        return this;
    },

    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
    _createElement: function() {
        var el = document.createElement(this.tagName),
            attrs = _.extend({}, this.attributes);

        this._setAttributes(attrs);

        if (this.id) el.id = this.id;

        el.className = this.className || '';

        this.setElement(el);
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
        if (this.el) return this.setElement(this.el);

        if (!this.el) return this._createElement();

        return this.setElement(el, false);
    },

    // Set attributes from a hash on this view's element.  Exposed for
    // subclasses using an alternative DOM manipulation API.
    _setAttributes: function(attributes) {
        var el = this.el;

       _.each(attributes, function(value, name) {
            this.el.setAttribute(name, value);
        });
    }

});


module.exports = View;

module.exports.extend = require('../utils/extend.js');