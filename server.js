var express = require('express'),
	utils = require('./config/utils')

//
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
	app = express(),
	commonConfig = {
		secret: 			utils.randomToken(32),
		rootPath: 			__dirname,
		port: 				process.env.PORT || 4040
	},
	config = {
		development: utils.extend({}, commonConfig, {
			db: 			'mongodb://localhost/cbahi'
		}),
		production: utils.extend({}, commonConfig, {
			db: 			'mongodb://localhost/cbahi'
		})
	}

require('./config/mongoose')(config[env])

require('./config/express')(app, config[env])

require('./config/pdf')(config[env])

require('./config/samples')(config[env])

// require('./config/jwt')(app, config[env])
require('./config/passport')()

//

require('./config/routes')(app, config[env])

app.listen(config[env].port)

console.log('CBAHI: listening on port ' + config[env].port + '..')