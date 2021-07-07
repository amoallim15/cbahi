var bcrypt = require('bcrypt-nodejs')

//
exports.randomToken = function(length){
	var paste = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
		pasteLength = paste.length,
		buffer = [],
		length = length || 32

	for(var i = 0; i < length; i++){
		var random = Math.floor(Math.random() * (pasteLength + 1))
		buffer.push(paste[random])
	}
	return buffer.join('')
}

exports.extend = function(a){
	if(a !== undefined || arguments.length > 1){
		for(var i = 1; i < arguments.length; i++){
			var obj = arguments[i]
			for(var key in obj){
				if(Object.prototype.hasOwnProperty.call(obj, key)){
					a[key] = obj[key]
				}
			}
		}
	}
	return a
}

exports.hashPwd =  function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

exports.checkPwd = function(password, hashed){
	return bcrypt.compareSync(password, hashed)
}

exports.matchPwd = function(pwd){
	var constrains = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,}$/
	if(typeof pwd !== 'string' || pwd.match(constrains) == null)
		return false
	return true
}

exports.matchName = function(firstName, lastName){
	var constrains = /[a-zA-Z\'\-]{3,}$/
	if(typeof firstName !== 'string' && typeof lastName !== 'string' && 
		firstName.match(constrains) == null || lastName.match(constrains) == null)
		return false
	if(firstName.length > 32 || lastName.length > 32)
		return false 
	return true
}

exports.matchEmail = function(email){
	var constrains = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	if(typeof email !== 'string'|| email.match(constrains) == null)
		return false
	return true
}

exports.matchFacilityName = function(name){
	var constrains = /[a-zA-Z \'\-']{3,}$/
	if(typeof name !== 'string'|| name.match(constrains) == null)
		return false
	return true
}

exports.matchFacilityArName = function(name){
	var constrains = /[\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF \-]{3,}$/
	if(typeof name !== 'string' || name.match(constrains) == null)
		return false
	return true
}

exports.matchWebsite = function(website){
	var constrains = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|(?:www|[a-zA-Z]*)\.[^\s]+\.[^\s]{2,})/gi
	if(typeof website !== 'string' || website.match(constrains) == null)
		return false
	return true
}

exports.isInArray = function(arr, objId){
	return arr.some(function(id){
		if(objId.equals(id))
			return true
	})
}

exports.facilityTypes = [
	'HOSPITAL', 'LABORATORY', 'PRIMARIY HEALTHCARE CENTER', 'AMBULATORY CARE CENTER'
]
exports.facilityCategories = ['GOVERNMENTAL', 'PRIVATE'],
exports.facilitySpeciality = ['GENERAL', 'SPECIALIZED'],
exports.facilityLabServices = [
	'Histopathology', 'Chemistry', 'Hematology', 
	'Microbiology', 'Blood bank', 'Immunology/Serology',
	'Cytogenetics', 'Molecular Pathology', 'Toxicology'
]
exports.facilityRegions = [
	'Riyadh', 'Makkah', 'Madinah', 'Qassim', 'Eastern', 'Jazan', 'Najran',
	'Asir', 'Al-Baha', 'Tabuk', 'Hail', 'Jouf', 'Northern Border'
]
exports.facilityAirports = [
	'Abha', 'Al-Ahsa', 'Al-Baha', 'Arar', 'Bisha', 'Gassim', 'Dammam', 'Dawadmi', 'Gurayat',
	'Hafar Al-Baten', 'Ha\'il', 'Jizzan', 'Jeddah', 'Jouf', 'Maddina', 'Najran', 'Qaisumah',
	'Rafha', 'Riyadh', 'Sharura', 'Tabuk', 'Taif', 'Turaif', 'Wadi Ad Dawasir', 'Wedjh',
	'Yanbu'
]
exports.facilityAccStatus = ['PENDING', 'APPROVED', 'REJECTED'],
exports.facilityStnStatus = ['PENDING', 'PARTIAL', 'COMPLETE']

exports.colors = [
	'FF5E3A',
	'FF2A68',
	'FFDB4C',
	'87FC70',
	'52EDC7',
	'5AC8FB',
	'007AFF',
	'b8336a',
	'34AADC',
	'5856D6',
	'256D1B',
	'C7C7CC',
	'8E8E93',
	'D1EEFC',
	'FF3B30',
	'FF4981',
	'FFD3E0',
	'C644FC',
	'FFCAB1',
	'7C796F',
	'788AA3',
	'82A7A6',
	'EAD2AC',
	'C58882',
	'F79A87',
	'D1D808',
	'9C0D38',
	'222255',
	'FF8360',
	'2D2D2A',
	'3D423E',
	'2BA84A',
	'843E44'
]







