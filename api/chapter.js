var mongoose = require('mongoose'),
	utils = require('../config/utils'),
	generic = require('./generic'),
	Standard = mongoose.model('Standard'),
	Chapter = mongoose.model('Chapter')

//
exports.getChapters = function(req, res, next){
	Chapter.find({}).sort({ serial: 1 }).exec(function(err, chapters){
		if(err)
			return generic.sendError(res, '004', 500)
		Standard.find({}).sort({ code: 1, serial: 1 }).exec(function(err, standards){
			if(err)
				return generic.sendError(res, '004', 500)

			var chList = []
			for(var i = 0; i < chapters.length; i++){
				var ch = chapters[i],
					count = 0
				standards.forEach(function(stn){
					if(ch._id.equals(stn.chapter))
						count++
				})
				chList.push(utils.extend(ch.header(), { standards: count }))
			}
			return generic.sendData(res, { chapters: chList })
		})
	})
}

exports.getChapter = function(req, res, next){
	if(req.params.id == null)
		return generic.sendError(res, '037', 400)
	var args = [{code: req.params.id }]
	if(!isNaN(req.params.id))
		args.push( {serial: req.params.id })

	Chapter.findOne({ $or: args }).exec(function(err, chapter){
		if(err)
			return generic.sendError(res, '004', 500)
		if(!chapter)
			return generic.sendError(res, '018', 400)

		Standard.find({ chapter: chapter._id }).sort({ serial: 1 }).exec(function(err, standards){
			if(err)
				return generic.sendError(res, '004', 500)

			var stns = []
			standards.forEach(function(stn){
				stns.push(utils.extend(stn.fresh(), { code: chapter.code }))
			})

			return generic.sendData(res, { chapter: utils.extend(chapter.fresh(), { standards: stns }) })
		})
	})
}