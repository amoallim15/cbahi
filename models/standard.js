var mongoose = require('mongoose')

//
var ObjectId = mongoose.Schema.ObjectId,
	tags = ['ESR']

var standardSchema = mongoose.Schema({
	serial: 		{type: Number, 	required: true, required: true},
	header: 		{type: String, trim: true, required: true},
	tags: 			[{type: String, trim: true, enum: tags}],

	details: [{
		serial: 	{type: Number, required: true},
		header: 	{type: String, trim: true, required: true},
		details: 	[{
			serial: {type: Number},
			header: {type: String, trim: true}
		}],
	}],

	chapter: {type: ObjectId, ref: 'Chapter'},

	updatedAt: 	{type: Date, required: true}
})

standardSchema.methods = {
	fresh: function(){
		return {
			_id: 			this._id,
			serial: 		this.serial,
			header: 		this.header,
			tags: 			this.tags,
			details: 		this.details,
			updatedAt: 		this.updatedAt
		}
	},
	short: function(){
		return {
			_id: 			this._id,
			serial: 		this.serial,
			header: 		this.header,
			tags: 			this.tags
		}
	}
}

var Standard = mongoose.model('Standard', standardSchema)

