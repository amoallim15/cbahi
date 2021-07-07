var mongoose = require('../config/mongoose')

//
var ObjectId = mongoose.Schema.ObjectId
var facilityReviewSchema = mongoose.Schema({
	viewCount: 		{type: Number},
	likes: [{
		id: 		{type: ObjectId},
		date: 		{type: Date}
	}],
	disLikes: [{
		id: 		{type: ObjectId},
		date: 		{type: Date}
	}]
	facilityId: 	{type: ObjectId}
})

var FacilityReview = mongoose.model('FacilityReview', facilityReviewSchema)