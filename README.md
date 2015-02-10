#loopback-promisify

loopback-promisify adds promises to your loopback models. if something is missing, you can extend it in easy way.

##Installation

Install module

	npm install --save loopback-promisify

and next in `server/server.js`, after `boot` add one line:

	require('loopback-promisify')(app)

##Configuration

In json files with model definitions:

	...
	"options": {
		"promisify": true
	}
	...

Promisify adds promises to default CRUD methods, if you want to add it to your
custom method, you can do it in this way:

	Model.myCustomMethod = function(next) {
		next();
	}
	Model.myCustomMethod.promisify = true;


##Custom methods

From version 0.1.5 promises can be add to custom methods, not only for models.

    var promisify = require('loopback-promisify');

    function customMethod(param, param2, callback) {
        //...
    }

    promisify.fn(customMethod);

