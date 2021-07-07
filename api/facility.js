var utils = require('../config/utils'),
	generic = require('./generic'),
	moment = require('moment')
	mongoose = require('mongoose'),
	Facility = mongoose.model('Facility'),
	Standard = mongoose.model('Standard'),
	Chapter = mongoose.model('Chapter'),
	User = mongoose.model('User'),
	$q = require('q')

//
exports.getFacilities = function(req, res, next){
	var count = parseInt(req.query.count) || 10,
		page = parseInt(req.query.page) || 1
	Facility.find({}).exec(function(err, facilities){
		if(err)
			return generic.sendError(res, '004', 500)

		var fcList = []
		for(var i = 0; i < facilities.length; i++){
			var fc = facilities[i]
			fcList.push(fc.header())
		}
		page = page < 1 || page > Math.ceil(fcList.length / count)? 1 : page

		return generic.sendData(res, { 
			facilities: fcList.slice(0).splice((page - 1) * count, count), 
			page: page, 
			records: fcList.length
		})
	})
}

// exports.getFacilities = function(req, res, next){
// 	var count = parseInt(req.query.count) || 10,
// 		page = parseInt(req.query.page) || 1,
// 		tags = String(req.query.tags).trim().toLowerCase()

// 	function check(fc, tags){
// 		return String(fc.name).toLowerCase().indexOf(tags) != -1 ||
// 			String(fc.name_ar).toLowerCase().indexOf(tags) != -1 ||
// 			String(fc.type).toLowerCase().indexOf(tags) != -1 ||
// 			String(fc.category).toLowerCase().indexOf(tags) != -1 ||
// 			String(fc.speciality).toLowerCase().indexOf(tags) != -1 ||
// 			String(fc.address.street).toLowerCase().indexOf(tags) != -1 ||
// 			String(fc.address.district).toLowerCase().indexOf(tags) != -1 ||
// 			String(fc.address.region).toLowerCase().indexOf(tags) != -1 ||
// 			String(fc.address.nearestAirport).toLowerCase().indexOf(tags) != -1 ||
// 			String(fc.address.city).toLowerCase().indexOf(tags) != -1 ||
// 			String(fc.address.officialEmail).toLowerCase().indexOf(tags) != -1 ||
// 			String(fc.address.officialWebsite).toLowerCase().indexOf(tags) != -1
// 	}

// 	Facility.find({}).exec(function(err, facilities){
// 		if(err)
// 			return generic.sendError(res, '004', 500)

// 		var fcList = []
// 		for(var i = 0; i < facilities.length; i++){
// 			var fc = facilities[i]
// 			if(check(fc, tags))
// 				fcList.push(fc.header())
// 		}
// 		page = page < 1 || page > Math.ceil(fcList.length / count)? 1 : page

// 		return generic.sendData(res, { 
// 			facilities: fcList.slice(0).splice((page - 1) * count, count), 
// 			page: page, 
// 			records: fcList.length
// 		})
// 	})
// }

function getFormatedFacility(facility){
	var dfd = $q.defer()
	Chapter.find({}).sort({serial: 1}).exec(function(err, chapters){
		if(err)
			dfd.reject('004')
		Standard.find({}).sort({ code: 1, serial: 1}).exec(function(err, standards){
			if(err)
				dfd.reject('004')
			var stnList = []
			chapters.forEach(function(ch){
				var related = []
				standards.forEach(function(stn){
					var short = null
					facility.accreditation.standards.forEach(function(fstn){
						if(stn._id.equals(fstn._id)){
							utils.extend((short = {}), stn.short(), { status: fstn.status })
						}
					})
					if(short == null){
						utils.extend((short = {}), stn.short(), { status: utils.facilityStnStatus[0] })
					}
					if(stn.chapter.equals(ch._id))
						related.push(short)
				})
				stnList.push(utils.extend(ch.header(), { standards: related }))
			})
			dfd.resolve({ facility: utils.extend(facility.fresh(), { chapters: stnList }) })
		})
	})
	return dfd.promise
}

exports.getFacility = function(req, res, next){
	Facility.findOne({ _id: req.params.id }).exec(function(err, facility){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!facility)
			return generic.sendError(res, '017', 400)

		getFormatedFacility(facility).then(function(data){
			return generic.sendData(res, data)
		}, function(){
			return generic.sendError(res, '004', 500)
		})
	})
}

exports.createFacility = function(req, res, next){
	var body = req.body
	if(req.user == null)
		return generic.sendError(res, '037', 400)
	if(!utils.matchFacilityName(body.name))
		return generic.sendError(res, '009', 400)
	if(!utils.matchFacilityArName(body.name_ar))
		return generic.sendError(res, '021', 400)
	if(utils.facilityTypes.indexOf(body.type) == -1)
		return generic.sendError(res, '022', 400)
	if(utils.facilityCategories.indexOf(body.category) == -1)
		return generic.sendError(res, '023', 400)
	if(utils.facilitySpeciality.indexOf(body.speciality) == -1)
		return generic.sendError(res, '024', 400)
	if(utils.facilityAirports.indexOf(body.nearestAirport) == -1)
		return generic.sendError(res, '026', 400)
	if(utils.facilityRegions.indexOf(body.region) == -1)
		return generic.sendError(res, '027', 400)
	if(!utils.matchEmail(body.offecialEmail))
		return generic.sendError(res, '028', 400)
	if(!utils.matchEmail(body.confirmOffecialEmail) || body.offecialEmail != body.confirmOffecialEmail)
		return generic.sendError(res, '035', 400)
	if(!utils.matchWebsite(body.offecialWebsite))
		return generic.sendError(res, '029', 400)
	if(isNaN(body.lat) || isNaN(body.lng))
		return generic.sendError(res, '033', 400)

	if(!body.street || !body.district || !body.POBox || !body.POBox || !body.region ||
		!body.zipCode || !body.nearestAirport || !body.city || !body.telephone ||
		!body.extensionNo || !body.fax)
		return generic.sendError(res, '036', 400)

	Facility.findOne({ $or: [{ name: body.name }, { name_ar: body.name_ar }] }).exec(function(err, facility){
		if(err)
			return generic.sendError(res, '004', 500)
		if(facility)
			return generic.sendError(res, '020', 400)

		var newFacility = new Facility({
			name: 				body.name,
			name_ar: 			body.name_ar,
			type: 				body.type,
			category: 			body.category,
			speciality: 		body.speciality,
			contributors: 		[req.user._id],
			address: {
				street: 			body.street,
				district: 			body.district,
				POBox: 				body.POBox,
				zipCode: 			body.zipCode,
				region: 			body.region,
				nearestAirport: 	body.nearestAirport,
				city: 				body.city,
				telephone: 			body.telephone,
				extensionNo: 		body.extensionNo,
				fax: 				body.fax,
				offecialEmail: 		body.offecialEmail,
				offecialWebsite: 	body.offecialWebsite,
				map: {
					lng: body.lng,
					lat: body.lat
				}
			}
		})

		newFacility.save(function(err, facility){
			if(err)
				return generic.sendError(res, '004', 500)

			return generic.sendData(res, { facility: utils.extend(facility.fresh()) })
		})
	})
}

exports.updateFacility = function(req, res, next){
	var body = req.body
	if(req.params.id == null)
		return generic.sendError(res, '037', 400)

	if(!utils.matchFacilityName(body.name))
		return generic.sendError(res, '009', 400)
	if(!utils.matchFacilityArName(body.name_ar))
		return generic.sendError(res, '021', 400)
	if(utils.facilityTypes.indexOf(body.type) == -1)
		return generic.sendError(res, '022', 400)
	if(utils.facilityCategories.indexOf(body.category) == -1)
		return generic.sendError(res, '023', 400)
	if(utils.facilitySpeciality.indexOf(body.speciality) == -1)
		return generic.sendError(res, '024', 400)
	if(utils.facilityAirports.indexOf(body.nearestAirport) == -1)
	return 	generic.sendError(res, '026', 400)
	if(utils.facilityRegions.indexOf(body.region) == -1)
		return generic.sendError(res, '027', 400)
	if(!utils.matchEmail(body.offecialEmail))
		return generic.sendError(res, '028', 400)
	if(!utils.matchWebsite(body.offecialWebsite))
		return generic.sendError(res, '029', 400)
	if(isNaN(body.lat) || isNaN(body.lng))
		return generic.sendError(res, '033', 400)

	if(!body.street || !body.district || !body.POBox || !body.POBox || !body.region ||
		!body.zipCode || !body.nearestAirport || !body.city || !body.telephone ||
		!body.extensionNo || !body.fax)
		return generic.sendError(res, '036', 400)

	Facility.findOne({ _id: req.params.id }).exec(function(err, facility){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!facility)
			return generic.sendError(res, '017', 400)

		Facility.findOne({ $or: [{ name: body.name }, { name_ar: body.name_ar }] }).exec(function(err, fc){
			if(err)
				return generic.sendError(res, '004', 500)
			console.log(fc._id)
			if(fc && !fc._id.equals(facility._id))
				return generic.sendError(res, '020', 400)

			facility.name =						body.name
			facility.name_ar = 					body.name_ar
			facility.type =						body.type
			facility.category =					body.category
			facility.speciality =				body.speciality

			facility.address.street =			body.street
			facility.address.district =			body.district
			facility.address.POBox =			body.POBox
			facility.address.zipCode =			body.zipCode
			facility.address.region =			body.region
			facility.address.nearestAirport =	body.nearestAirport
			facility.address.city =				body.city
			facility.address.telephone =		body.telephone
			facility.address.extensionNo =		body.extensionNo
			facility.address.fax =				body.fax
			facility.address.offecialEmail =	body.offecialEmail
			facility.address.offecialWebsite =	body.offecialWebsite
			facility.address.map.lat =			body.lat
			facility.address.map.lng =			body.lng

			facility.save(function(err){
				if(err)
					return generic.sendError(res, '004', 500)

				return generic.sendData(res, { facility: facility.fresh() })
			})
		})
	})
}

exports.deleteFacility = function(req, res, next){
	if(req.params.id == null)
		return generic.sendError(res, '037', 400)
	Facility.findOne({ _id: req.params.id }).exec(function(err, facility){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!facility)
			return generic.sendError(res, '017', 400)

		facility.remove()

		return generic.sendData(res, { facility: null })
	})
}

exports.updateAccStatus = function(req, res, next){
	var body = req.body
	if(req.params.id == null)
		return generic.sendError(res, '037', 400)
	if(utils.facilityAccStatus.indexOf(body.status) == -1 || body.chapters == null)
		generic.sendError(res, '030', 400)

	Facility.findOne({ _id: req.params.id }).exec(function(err, facility){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!facility)
			return generic.sendError(res, '017', 400)

		var standards = []
		body.chapters = body.chapters || []
		body.chapters.forEach(function(a){
			standards = standards.concat(a.standards)
		})
		Standard.find({}).exec(function(err, allStandards){
			if(err)
				return generic.sendError(res, '004', 500)
			if(allStandards.length != standards.length)
				return generic.sendError(res, '032', 400)

			var checkedStns = [],
				partial = 0,
				complete = 0
			for(var i = 0; i < allStandards.length; i++){
				var tstn = allStandards[i]
				standards.forEach(function(stn){
					if(tstn._id.equals(stn._id)){
						checkedStns.push({ _id: stn._id, status: stn.status })
						if(utils.facilityStnStatus.indexOf(stn.status) == 1)
							partial++
						else if(utils.facilityStnStatus.indexOf(stn.status) == 2)
							complete++
					}
				})
			}
			facility.accreditation.percentage = parseFloat((100 * (partial/2 + complete)/allStandards.length).toFixed(2)) || 0
			facility.accreditation.standards = checkedStns
			facility.accreditation.status = body.status

			if(body.status === utils.facilityAccStatus[1]){
				facility.activatedDate = moment()
				facility.expireDate = moment().add('1', 'Years')
			} else if(body.activate === utils.facilityAccStatus[2]){
				facility.activatedDate = null
				facility.expireDate = null
			}

			facility.save(function(err){
				if(err)
					return generic.sendError(res, '004', 500)

				getFormatedFacility(facility).then(function(data){
					return generic.sendData(res, data)
				}, function(){
					return generic.sendError(res, '004', 500)
				})
			})
		})
	})
}

exports.updateContributor = function(req, res, next){
	if(req.params.id == null)
		return generic.sendError(res, '037', 400)
	Facility.findOne({ _id: req.params.id }).exec(function(err, facility){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!facility)
			return generic.sendError(res, '017', 400)

		User.findOne({ _id: body.contributor }).exec(function(err, user){
			if(err)
				return generic.sendError(res, '004', 500)
			if(!facility)
				return generic.sendError(res, '008', 400)

			if(facility.contributor.indexOf(user._id) != -1)
				facility.contributor.push(user._id)

			facility.save(function(err){
				if(err)
					return generic.sendError(res, '004', 500)

				return generic.sendData(res, { facility: facility.fresh() })
			})
		})
	})
}

exports.getManageableFacilities = function(req, res, next){
	var count = parseInt(req.query.count) || 10,
		page = parseInt(req.query.page) || 1
	Facility.find({ contributors: { $in: [req.user._id] } }).exec(function(err, facilities){
		if(err)
			return generic.sendError(res, '004', 500)

		var fcList = []
		for(var i = 0; i < facilities.length; i++){
			var fc = facilities[i]
			fcList.push(fc.header())
		}
		page = page < 1 || page > Math.ceil(fcList.length / count)? 1 : page

		return generic.sendData(res, { 
			facilities: fcList.slice(0).splice((page - 1) * count, count), 
			page: page, 
			records: fcList.length
		})
	})
}

exports.requestToggleDelete = function(req, res, next){
	var body = req.body
	if(req.params.id == null)
		return generic.sendError(res, '037', 400)
	Facility.findOne({ _id: req.params.id }).exec(function(err, facility){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!facility)
			return generic.sendError(res, '017', 400)

		if(body.state == true && facility.deletedAt != null && facility.deletedAt > moment().subtract('1', 'Days'))
			return generic.sendError(res, '034', 400)

		if(body.state == true)
			facility.deletedAt = moment()

		facility.isDeleted = !!body.state

		facility.save(function(err){
			if(err)
				return generic.sendError(res, '004', 500)
			return generic.sendData(res, { facility: facility.header() })
		})

	})
}

exports.getFacilityOptions = function(req, res, next){
	return generic.sendData(res, {
		options: {
			type: 					utils.facilityTypes,
			category: 				utils.facilityCategories,
			speciality: 			utils.facilitySpeciality,
			region: 				utils.facilityRegions,
			airport: 				utils.facilityAirports,
			accreditation: 			utils.facilityAccStatus,
			standardsStatus: 		utils.facilityStnStatus
		}
	})
}



