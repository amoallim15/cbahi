var mongoose = require('./config/mongoose')

//
var ObjectId = mongoose.Schema.ObjectId,
	accStatus = ['PENDING', 'APPROVED', 'REJECTED'],

var reqeustSchema = mongoose.Schema({
	previous_accreditation: 	{type: Boolean, required: true},
	other_accreditation: 		{type: Boolean, require: true},

	status: 					{type: String, trim: true, enum: accStatus, default: accStatus[0]},
	percentage: 				{type: Number},

	facilityId: 				{type: ObejctId},
	contributerId: 				{type: ObjectId},

	activationDate: 			{type: Date},
	expireDate: 				{type: Date},

	submitedAt: 				{type: Date},
	updatedAt: 					{type: Date}
})

requestSchema.pre('save', function(next){
	var now = new Date()
	if(!this.submitedAt){
		this.submitedAt = now
	}
	this.updatedAt = now
	next()
})

var Request = mongoose.model('Request', requestSchema)

