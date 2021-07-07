var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	generic = require('./generic'),
	utils = require('../config/utils')

//
exports.getUsers = function(req, res, next){
	User.find({}).exec(function(err, users){
		if(err)
			return generic.sendError(res, '004', 400)

		var userList = []
		for(var i = 0; i < users.length; i++){
			userList.push(users[i].fresh())
		}
		return generic.sendData(res, { users: userList })
	})
}

exports.getUser = function(req, res, next){
	if(req.params.id == null)
		return generic.sendError(res, '037', 400)
	User.findOne({ _id: req.params.id }).exec(function(err, user){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!user)
			return generic.sendError(res, '008', 400)

		return generic.sendData({ user: user.fresh() })
	})
}

exports.createUser = function(req, res, next){
	var body = req.body
	if(!utils.matchName(body.firstName, body.lastName))
		return generic.sendError(res, '009', 400)
	if(!utils.matchEmail(body.email))
		return generic.sendError(res, '012', 400)
	if(!utils.matchPwd(body.password))
		return generic.sendError(res, '006', 400)
	if(body.password != body.confirmPwd)
		return generic.sendError(res, '013', 400)

	User.findOne({ 'local.email': body.email }).exec(function(err, user){
		if(err)
			return generic.sendError(res, '004', 500)
		if(user)
			return generic.sendError(res, '005', 400)

		var newUser = new User({
			firstName: body.firstName,
			lastName: body.lastName,
			local: {
				email: body.email,
				pwd: utils.hashPwd(body.pwd)
			}
		})

		newUser.save(function(err){
			if(err)
				return generic.sendError(res, '004', 500)

			req.logIn(newUser, function(err){
				if(err)
					return generic.sendError(res, '007', 500)

				return generic.sendData({ user: newUser.fresh() })
			})
		})
	})
}

exports.updateUser = function(req, res, next){
	var body = req.body
	if(req.params.id == null)
		return generic.sendError(res, '037', 400)
	if(!utils.matchName(body.firstName, body.lastName))
		return generic.sendError(res, '009', 400)
	// TODO: validate phone No
	// if(!utils.matchPhoneNo(body.phoneNo))
	// 	generic.sendError(res, '015', 400)

	User.findOne({ _id: req.params.id }).exec(function(err, user){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!user)
			return generic.sendError(res, '008', 400)

		if(body.newPwd && body.confirmNewPwd){
			if(body.newPwd != body.confirmNewPwd)
				return generic.sendError(res, '013', 400)

			if(utils.checkPwd(body.newPwd, user.local.pwd))
				return generic.sendError(res, '010', 400)

			if(utils.checkPwd(body.newPwd, user.local.previousPwd))
				return generic.sendError(res, '011', 400)

			user.local.previousPwd = user.local.password
			user.local.pwd = utils.hashPwd(body.password)
		}

		// TODO: updating e-mail
		// if(body.email){
		// 	if(!utils.matchEmail(body.email))
		// 		generic.sendError(res, '012', 400)
		// 	User.findOne({ 'local.email': body.email }).exec(function(err, different_user){
		// 		if(err)
		// 			generic.sendError(res, '004', 500)
		// 		if(different_user && !different_user._id.equal(user._id))
		// 			generic.sendError(res, '014', 400)

		// 		user.local.email = body.email
		// 	})
		// }

		user.firstName = body.firstName
		user.lastName = body.lastName
		user.phoneNo = body.phoneNo

		user.save(function(err){
			if(err)
				return generic.sendError(res, '004', 500)

			return generic.sendData({ user: user.fresh() })
		})
	})
}

exports.deleteUser = function(req, res, next){
	if(req.params.id == null)
		return generic.sendError(res, '037', 400)
	User.findOne({ _id: req.params.id }).exec(function(err, user){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!user)
			return generic.sendError(res, '008', 400)

		user.remove()

		if(req.user._id.equal(req.params.id)){
			req.logout()
			return generic.sendData({ user: null })
		}
		return generic.sendData({ user: req.user.fresh() })
	})
}



