





var callbacks = [];

app.get = function(path, fn) {
	callbacks.push(something(path, fn));
};

function something(fn) {

	return function(req, res, next) {
		if (req.isMatch(path)) return fn(req, res, next);
		next();
	}
}


function bind(req, res){
	var i = 0;

	function next() {
		var fn = callbacks[i++];
		if (!fn) return;
		fn(req, res, next); 
	}

	next();
}


app.get('/test/', function(req, res, next) {

	console.log(req.smth);
	next();
})

// isMatch