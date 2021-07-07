var mongoose = require('mongoose')

//
var ObjectId = mongoose.Schema.ObjectId

var chapterSchema = mongoose.Schema({
	serial: 		{type: Number, unique: true, required: true},
	color: 			{type: String, trim: true, lowercase: true, required: true},
	title: 			{type: String, trim: true, required: true, required: true},
	code: 			{type: String, trim: true, required: true, unique: true, required: true},
	introduction: 	{type: String, trim: true, required: true},
	concerns: [{
		serial: {type: Number, required: true},
		header: {type: String, trim: true, required: true}
	}],

	updatedAt: 	{type: Date, required: true}
})

chapterSchema.methods = {
	fresh: function(){
		return {
			color: 			this.color,
			serial: 		this.serial,
			title: 			this.title,
			code: 			this.code,
			updatedAt: 		this.updatedAt,
			introduction: 	this.introduction,
			concerns: 		this.concerns
		}
	},
	header: function(){
		return {
			color: 			this.color,
			serial: 		this.serial,
			title: 			this.title,
			code: 			this.code,
			updatedAt: 		this.updatedAt,
		}
	}
}
var Chapter = mongoose.model('Chapter', chapterSchema)