var mongoose = require('mongoose')

//
var ObjectId = mongoose.Schema.ObjectId

var userTokenSchema = mongoose.Schema({
	expireDate: 	{type: Date, required: true},
	userId: 		{type: ObjectId, ref: 'User', required: true},
})

var Token = mongoose.model('Token', userTokenSchema)

