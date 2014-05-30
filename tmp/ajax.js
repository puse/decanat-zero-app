// ajax.js
// -------

var Request = require('decanat.request');

function mixin(app) {
	View = window._csrf;
	proto.getToken = function(){
		return hash;
	};

	proto.setToken = function(token){
		hash = result(token);
		return hash;
	};
};

module.exports = function(token){
	if (token) csrf = token;

    return { __decanat: mixin};
};