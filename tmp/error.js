function Miscue(code, data) {
	this.status(code);

	this.data = data;

	return this;
}

var statusCodes = {
		404: 'not found',
		301: 'redirect'
	};

Miscue.prototype.status = function(code) {
	this.code = code;
	// native usage with `err instanceOf Error`
	if (code >= 400) this.prototype = new Error;	
};

module.exports = Miscue;

module.exports.redirect = function(url) {
	return new Miscue(301, { url: url });
};