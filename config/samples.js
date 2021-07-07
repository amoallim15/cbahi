var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Facility = mongoose.model('Facility'),
	utils = require('./utils'),
	$q = require('q')

//
module.exports = function(config){

	//
	importUserSamples() //.then(importFacilitySamples, importFacilitySamples)

}


function importUserSamples(){
	var dfd = $q.defer(),
		dfd1 = $q.defer(),
		dfd2 = $q.defer(),
		dfd3 = $q.defer()

	User.find({}).exec(function(err, collection){
		if(err)
			throw err

		if(collection.length !== 0){
			dfd1.reject()
			dfd2.reject()
			dfd3.reject()
			return
		}

		User.create({
			firstName: 			'Mohammad',
			lastName: 			'Moallim',
			phoneNo: 			'966508003447',
			roles: 				['admin'],
			local: {
				email: 			'm_059@hotmail.com',
				pwd: 			utils.hashPwd('a123123123')
			},
			isActivated: true
		}, function(){
			console.log('sample user 1 created..')
			dfd1.resolve()
		})
		User.create({
			firstName: 			'Ali',
			lastName: 			'Moallim',
			phoneNo: 			'966553719954',
			roles: 				['admin'],
			local: {
				email: 			'axj.159@gmail.com',
				pwd: 			utils.hashPwd('a159159159')
			},
			isActivated: true
		}, function(){
			console.log('sample user 2 created..')
			dfd2.resolve()
		})
		User.create({
			firstName: 			'Awad',
			lastName: 			'Alotaibi',
			roles: 				['admin'],
			local: {
				email: 			'awadlaheq@hotmail.com',
				pwd: 			utils.hashPwd('a123123123')
			},
			isActivated: true
		}, function(){
			console.log('sample user 3 created..')
			dfd3.resolve()
		})
	})

	$q.all([dfd1.promise, dfd2.promise, dfd3.promise]).then(function(){
		console.log('all sample users created..')
		dfd.resolve()
	}, function(){
		dfd.reject()
	})
	return dfd.promise
}

function importFacilitySamples(){
	var dfd = $q.defer(),
		dfd1 = $q.defer(),
		dfd2 = $q.defer(),
		dfd3 = $q.defer()

	User.find({}).exec(function(err, user_collection){
		Facility.find({}).exec(function(err, collection){
			if(err)
				throw err

			if(collection.length !== 0){
				dfd1.reject()
				dfd2.reject()
				dfd3.reject()
				return
			}
//
			Facility.create({
				name: 					"King Saud Hospital",
				name_ar: 				"مستشفى الملك سعود",
				type: 					"HOSPITAL",
				category: 				"GOVERNMENTAL",
				speciality: 			"GENERAL",
				address: {
					street: 			"King Saud St.",
					district: 			"Prince Abdulilah Ibn Abdulaziz, As Salihiyyah",
					POBox: 				"00001",
					zipCode: 			"56437",
					region: 			"Qassim",
					nearestAirport: 	"Gassim",
					city: 				"Unayzah",
					telephone: 			"+(966) 16 364 5000",
					extensionNo: 		"04",
					fax: 				"123456789",
					offecialEmail: 		"axj.159@gmail.com",
					offecialWebsite: 	"moh.gov.sa",
					map: {
						lat: 			26.1044506,
						lng: 			43.9895542
					}
				}, 
				accreditation: {
					status: 'PENDING',
					percentage: 0
				},
				contributors: [user_collection[0]._id]
			}, function(){
				dfd1.resolve()
				console.log('sample facility 1 created..')
			})

			Facility.create({
				name: 					"Qassem National Hospital",
				name_ar: 				"مستشفى القصيم الوطني",
				type: 					"HOSPITAL",
				category: 				"PRIVATE",
				speciality: 			"GENERAL",
				address: {
					street: 			"Ali bin AbiTalib St.",
					district: 			"Al Eskan",
					POBox: 				"00001",
					zipCode: 			"52384",
					region: 			"Qassim",
					nearestAirport: 	"Gassim",
					city: 				"Buraydah",
					telephone: 			"+(966) 16 383 6100",
					extensionNo: 		"33",
					fax: 				"123456789",
					offecialEmail: 		"axj.159@gmail.com",
					offecialWebsite: 	"qnhospital.com",
					map: {
						lat: 			26.374629,
						lng: 			43.940416
					}
				}, 
				accreditation: {
					status: 'PENDING',
					percentage: 32
				},
				contributors: [user_collection[2]._id, user_collection[1]._id]
			}, function(){
				dfd2.resolve()
				console.log('sample facility 2 created..')
			})

			Facility.create({
				name: 					"Dr. Sulaiman Al-Habib Hospital",
				name_ar: 				"مستشفى د. سليمان الحبيب الطبي",
				type: 					"HOSPITAL",
				category: 				"PRIVATE",
				speciality: 			"GENERAL",
				address: {
					street: 			"King Abdulaziz St.",
					district: 			"As Saffrah",
					POBox: 				"00001",
					zipCode: 			"51431",
					region: 			"Qassim",
					nearestAirport: 	"Gassim",
					city: 				"Buraydah",
					telephone: 			"+(966) 16 316 6666",
					extensionNo: 		"00",
					fax: 				"123456789",
					offecialEmail: 		"axj.159@gmail.com",
					offecialWebsite: 	"drsulaimanalhabib.com",
					map: {
						lat: 			26.3615162,
						lng: 			43.9465178
					}
				}, 
				accreditation: {
					status: 			'APPROVED',
					percentage: 		84
				},
				contributors: [user_collection[2]._id, user_collection[0]._id, user_collection[1]._id]
			}, function(){
				dfd3.resolve()
				console.log('sample facility 3 created..')
			})
//
		})
	})

	$q.all([dfd1.promise, dfd2.promise, dfd3.promise]).then(function(){
		console.log('all sample facilities created..')
		dfd.resolve()
	}, function(){
		dfd.reject()
	})
	return dfd.promise
}




















