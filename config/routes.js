var express = require('express'),
	utils = require('./utils')

//
var api = utils.extend({}, 
	require('../api/generic'), 
	require('../api/auth'),
	require('../api/user'),
	require('../api/facility'),
	require('../api/chapter'),
	require('../api/standard'))

module.exports = function(app, config){

	var resources = express.Router()

	resources.route('/facility/options')
		.get(api.getFacilityOptions)									// done
	resources.route('/facility/manageable')
		.get(api.requireAuth, api.getManageableFacilities)				// done

	resources.route('/facility')
		.get(api.getFacilities)											// done
		.post(api.requireAdmin, api.createFacility)						// done

	resources.route('/facility/:id')
		.get(api.getFacility)											// done
		.put(api.requireContributorOrAdmin, api.updateFacility)			// done
		.delete(api.requireAdmin, api.deleteFacility)					// X beta

	resources.route('/facility/:id/requestdelete')
		.put(api.requireContributorOrAdmin, api.requestToggleDelete)	// done

	resources.route('/facility/:id/accredit')
		.put(api.requireAdmin, api.updateAccStatus)						// done

	resources.route('facility/:id/contributor')
		.put(api.requireAdmin, api.updateContributor)					// X beta

	resources.route('/standard')
		.get(api.getStandards)											// done

	resources.route('/standard/search')
		.get(api.searchChapters)										//

	resources.route('/standard/:code')
		.get(api.getStandardsByCode)									// X beta

	resources.route('/chapter')
		.get(api.getChapters)											// done

	resources.route('/chapter/:id')
		.get(api.getChapter)											// done

	resources.route('/authenticate')
		.get(api.getAuthenticated)										// done

	resources.route('/user')
		.get(api.requireAdmin, api.getUsers)							// X beta
		.post(api.createUser)											// X beta

	resources.route('/user/:id')
		.get(api.requireSelfOrAdmin, api.getUser)						// X beta
		.put(api.requireSelfOrAdmin, api.updateUser)					// X beta
		.delete(api.requireAdmin, api.deleteUser)						// X beta

	resources.route('/login')
		.post(api.requireAnony, api.loginUser)							// done

	resources.route('/logout')
		.all(api.requireAuth, api.logoutUser)							// done

	resources.route('/forgot')
		.post(api.forgotUser)											// X beta

	resources.route('/recover/:id')
		.get(api.requireAnony, api.recoverUser)							// X beta

	resources.route('/activate/:id')
		.get(api.requireAdmin, api.activateUser)						// X beta


	//

	// var User = require('mongoose').model('User')
	// app.use('/api/', function(req, res, next){
	// 	User.find({}).exec(function(err, user){
	// 		req.logIn(user[0], function(){
	// 			next()
	// 		})
	// 	})
	// })

	app.use('/api', resources)
	app.use('/api/*', api.notFound)

	//
	app.get('/test', function(req, res, next){
		res.send('hello world..')
	})

	app.get('/*', function(req, res, next){
		res.sendFile(config.rootPath + '/public/index.html')
	})

}





