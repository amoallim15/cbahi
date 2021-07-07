var mongoose = require('mongoose')

//
var models = [
	require('../models/user'),
	require('../models/chapter'),
	require('../models/standard'),
	require('../models/facility'),
	require('../models/token')
]

module.exports = function(config){

	mongoose.connect(config.db)
	var db = mongoose.connection;

	// logs..
	db.on('error', console.error.bind(console, 'connection error..'))
	db.once('open', function(){
		console.log('* cbahi db opened')
	})

}