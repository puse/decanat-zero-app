var $ = require('zepto'),
	_ = {
		extend: require('lodash.extend')
	};

function View(options) {
    options || (options = {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    return this;
};

var proto = {};

_.extend(proto, {
    tagName: 'div'
});

proto.initialize = function(){
    this.delegate();
    return this;
};

proto.delegate = function() { };

proto.undelegate = function() {
    this._undelegate();

    return this;
};

proto.render = function() {
    return this;
};

proto.setElement = function(el) {
    this.$el = el instanceof $ ? el : $(el);
    this.el = this.$el[0];

    return this; 
};


proto._createElement = function(){
    var el = document.createElement(this.tagName),
        attrs = _.extend({}, this.attributes);

    $(el).attr(attrs);

    if (this.id) el.id = this.id;

    el.className = this.className || '';

    this.setElement(el);

    return this;
};


proto._appendElement = function(parent){
	if (parent) parent.appendChild(el);

	return this;
};


proto._ensureElement = function() {
    if (this.el) this.setElement(this.el);

    if (!this.el) this.createElement();

    return this.setElement(el);
};


proto._removeElement = function(){
    this.$el.remove();

    return this;
};


proto._undelegate = function() {
    this.$el.off();

    return this;
};

View.prototype = proto;

module.exports.View = View;