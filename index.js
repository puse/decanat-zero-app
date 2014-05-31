var Decanat = require('./lib/decanat.js');

window.Decanat = Decanat;

if (typeof module !== 'undefined') {
	module.exports = Decanat;
}