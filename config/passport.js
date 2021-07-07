var passport = require('passport'),
	mongoose = require('mongoose'),
	User = mongoose.model('User')

//
module.exports = function(){

	passport.serializeUser(function(user, callback){
		if(user)
			callback(null, user._id)
	})

	passport.deserializeUser(function(id, callback){
		User.findOne({ _id: id }).exec(function(err, user){
			if(err || !user)
				return callback(err || null, false)

			return callback(null, user)
		})
	})

}
