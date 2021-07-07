var mongoose = require('mongoose'),
	utils = require('../config/utils')

//
var ObjectId = mongoose.Schema.ObjectId

var types = utils.facilityTypes,
	categories = utils.facilityCategories,
	speciality = utils.facilitySpeciality,
	labServices = utils.facilityLabServices,
	regions = utils.facilityRegions,
	airports = utils.facilityAirports,
	accStatus = utils.facilityAccStatus,
	stnStatus = utils.facilityStnStatus

var facilitySchema = mongoose.Schema({
	name: 					{type: String, trim: true},
	name_ar: 				{type: String, trim: true},
	type: 					{type: String, trim: true, enum: types, default: types[0]},
	category: 				{type: String, trim: true, enum: categories, default: categories[0]},
	speciality: 			{type: String, trim: true, enum: speciality, default: speciality[0]},

	contributors: 			[{type: ObjectId, ref: 'User'}],

	address: {
		street: 			{type: String, trim: true},
		district: 			{type: String, trim: true},
		POBox: 				{type: String, trim: true},
		zipCode: 			{type: String, trim: true},
		region: 			{type: String, trim: true, enum: regions},
		nearestAirport: 	{type: String, trim: true, enum: airports},
		city: 				{type: String, trim: true},
		telephone: 			{type: String, trim: true, lowercase: true},
		extensionNo: 		{type: String, trim: true, lowercase: true},
		fax: 				{type: String, trim: true, lowercase: true},
		offecialEmail: 		{type: String, trim: true, lowercase: true},
		offecialWebsite: 	{type: String, trim: true, lowercase: true},
		map: {
			lat: 			{type: Number},
			lng: 			{type: Number}
		}
	},

	accreditation: {
		status: 			{type: String, enum: accStatus, default: accStatus[0]},
		activatedDate: 		{type: Date},
		expireDate: 		{type: Date},
		percentage: 		{type: Number, default: 0},
		standards: [{
			_id: 			{type: ObjectId, ref: 'Standard'},
			status: 		{type: String, enum: stnStatus, default: stnStatus[0]}
		}]
	},

	isDeleted: 				{type: Boolean, default: false},
	deletedAt: 				{type: Date},

	InfoUpdatedAt: 			{type: Date},
	updatedAt: 				{type: Date},
	createdAt: 				{type: Date}
})

facilitySchema.pre('save', function(next){
	var now = new Date()
	if(!this.createdAt){
		this.createdAt = now
	}
	this.updatedAt = now
	next()
})

facilitySchema.methods = {
	fresh: function(){
		return {
			_id: 					this._id,
			name: 					this.name,
			name_ar: 				this.name_ar,
			type: 					this.type,
			category: 				this.category,
			speciality: 			this.speciality,
			updatedAt: 				this.updatedAt,
			InfoUpdatedAt: 			this.InfoUpdatedAt,
			//
			address: 				this.address,
			//
			status: 				this.accreditation.status,
			activatedDate: 			this.accreditation.activatedDate,
			expireDate: 			this.accreditation.expireDate,
			percentage: 			this.accreditation.percentage,

			contributors: 			this.contributors,
			isDeleted: 				this.isDeleted
		}
	},
	header: function(){
		return {
			_id: 					this._id,
			name: 					this.name,
			name_ar: 				this.name_ar,
			type: 					this.type,
			category: 				this.category,
			speciality: 			this.speciality,
			//
			status: 				this.accreditation.status,
			expireDate: 			this.accreditation.expireDate,
			percentage: 			this.accreditation.percentage,
			//
			region: 				this.address.region,
			city: 					this.address.city,
			nearestAirport: 		this.address.nearestAirport,
			isDeleted: 				this.isDeleted,
			deletedAt: 				this.deletedAt
		}
	}
}

var Facility = mongoose.model('Facility', facilitySchema)


