var mongoose = require('mongoose')

//
var userSchema = mongoose.Schema({
	firstName: 			{type: String, trim: true},
	lastName: 			{type: String, trim: true},
	phoneNo: 			{type: String, trim: true},
	roles: 				[{type: String, trim: true, lowercase: true}],

	local: {
		email: 			{type: String, trim: true, lowercase: true, required: true, unique: true},
		pwd: 			{type: String, required: true},
		previousPwd: 	{type: String}
	},
	twitter: {
		id: 			{type: String},
		token: 			{type: String},
		username: 		{type: String}
	},

	isDeleted: 			{type: Boolean, default: false},
	isActivated: 		{type: Boolean, default: false},

	updatedAt: 			{type: Date},
	createdAt: 			{type: Date}
})

userSchema.pre('save', function(next){
	var now = new Date()
	if(!this.createdAt){
		this.createdAt = now
	}
	this.updatedAt = now
	next()
})

userSchema.methods = {
	fresh: function(){
		return {
			_id: 			this._id,
			name: 			[this.firstName, this.lastName].join(' '),
			email: 			this.local.email,
			phoneNo: 		this.phoneNo,
			isActived: 		this.isActivated,
			updatedAt: 		this.updatedAt,
			roles: 			this.roles
		}
	}
}

var User = mongoose.model('User', userSchema)




