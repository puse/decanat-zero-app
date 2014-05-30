// metas.js
// --------

var _ = {
		reduce = require('lodash.reduce')
	};

function mixin(app, proto) {
	var metas = document.head.querySelectorAll('meta[name]');

	_.reduce(metas, function(locals, el){
		var key 	= el.getAttribute('name'),
			content = el.getAttribute('content');

		locals[key] = content || true;
		return locals;
	}, app.locals);
};

module.exports = function(){
    return { __decanat: mixin};
};