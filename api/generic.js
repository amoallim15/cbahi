var Err = require('./errorCodes'),
	utils = require('../config/utils'),
	Facility = require('mongoose').model('Facility')

//
var sendError = exports.sendError = function(res, code, status, extra){
	res.status(status || 400).json(utils.extend({ 
		status: false, 
		code: code, 
		error: Err[code]
	}, extra || {}))
}

var sendData = exports.sendData = function(res, data){
	var data = utils.extend({ status: true }, data || {})
	res.json(data)
}

exports.requireAuth = function(req, res, next){
	if(!req.isAuthenticated()){
		return sendError(res, '001', 403)
	}
	next()
}

exports.requireAdmin = function(req, res, next){
	if(!req.isAuthenticated()){
		return sendError(res, '001', 403)
	} else if(req.user.roles.indexOf('admin') == -1){
		return sendError(res, '002', 403)
	}
	next()
}

exports.requireAnony = function(req, res, next){
	if(req.isAuthenticated()){
		return sendError(res, '003', 400)
	}
	next()
}

exports.requireSelfOrAdmin = function(req, res, next){
	if(!req.isAuthenticated()){
		return sendError(res, '001', 403)
	} else if(req.user.roles.indexOf('admin') == -1 && req.user._id.equal(req.params.id)){
		return sendError(res, '002', 403)
	}
	next()
}

exports.requireContributorOrAdmin = function(req, res, next){
	if(!req.isAuthenticated())
		return sendError(res, '001', 403)
	Facility.findOne({ _id: req.params.id }).exec(function(err, facility){
		if(err)
			return sendError(res, '004', 500)
		if(!facility)
			return sendError(res, '017', 400)

		if(req.user.roles.indexOf('admin') == -1 && facility.contributors.indexOf(req.user._id) == -1)
			return sendError(res, '002', 400)

		next()
	})
}

exports.notFound = function(req, res, next){
	return sendError(res, '019', 404)
}








