// csrf.js
// -------

var _ = {
		result: require('lodash.result')
	};

var csrf = window._csrf;

function mixin(app, proto) {
	app.fn.csrfToken = function(token){
		if (token) hash = _.result(token);
		return hash;
	};
};


module.exports = function(token){
	if (token) csrf = token;

    return { __decanat: mixin};
};