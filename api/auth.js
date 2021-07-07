var utils = require('../config/utils'),
	generic = require('./generic'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Token = mongoose.model('Token'),
	moment = require('moment')

//
exports.getAuthenticated = function(req, res, next){
	return generic.sendData(res, { user: req.user? req.user.fresh() : null, isAuthenticated: req.isAuthenticated() })
}

exports.loginUser = function(req, res, next){
	var body = req.body
	if(!utils.matchEmail(body.email))
		return generic.sendError(res, '012', 400)
	if(!utils.matchPwd(body.password))
		return generic.sendError(res, '006', 400)

	User.findOne({ 'local.email': body.email.toLowerCase() }).exec(function(err, user){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!user || !utils.checkPwd(body.password, user.local.pwd))
			return generic.sendError(res, '015', 400)

		req.logIn(user, function(err){
			if(err)
				return generic.sendError(res, '007', 500)

			return generic.sendData(res, { user: user.fresh() })
		})
	})
}

exports.logoutUser = function(req, res, next){
	req.logout()
	return generic.sendData(res, { user: null })
}

exports.forgotUser = function(req, res, next){
	var body = req.body
	if(!utils.matchEmail(body.email))
		return generic.sendError(res, '012', 400)
	User.findOne({ 'local.email': body.email }).exec(function(err, user){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!user)
			return generic.sendError(res, '008', 400)

		var newToken = new Token({
			expireDate: moment().add(1, 'Days')
		})

		user.is_activated = false
		user.save(function(err){
			if(err)
				return generic.sendError(res, '004', 500)

			newToken.save(function(err){
				if(err)
					return generic.sendError(res, '004', 500)

				// TODO: send an e-mail with the token id
				return generic.sendData(res, req.isAuthenticated? { user: req.user.fresh() }: undefined)
			})
		})
	})
}

exports.recoverUser = function(req, res, next){
	Token.findOne({ _id: req.params.id }).exec(function(err, token){
		if(err)
			return generic.sendError(res, '004', 500)
		var yest = moment().subtract(1, 'days')
		if(!token || token.expireDate < yest)
			return generic.sendError(res, '016', 400)

		User.findOne({ _id: token.userId }).exec(function(err, user){
			if(err || !user)
				return generic.sendError(res, '004', 500)

			user.is_activated = true

			user.save(function(err){
				if(err)
					return generic.sendError(res, '004', 500)

				req.logIn(user, function(err){
					if(err)
						return generic.sendError(res, '007', 500)

					return generic.sendData(res, { user: user.fresh() })
				})
			})
		})
	})
	// TODO: remove all exipred tokens
}

exports.activateUser = function(req, res, next){
	User.findOne({ _id: req.params.id }).exec(function(err, user){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!user)
			return generic.sendError(res, '008', 400)

		user.is_activated = true

		user.save(function(err){
			if(err)
				return generic.sendError(res, '004', 500)

			return generic.sendData(res, { user: user.fresh() })
		})
	})
}



