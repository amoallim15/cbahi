var mongoose = require('mongoose'),
	utils = require('../config/utils'),
	generic = require('./generic'),
	Standard = mongoose.model('Standard'),
	Chapter = mongoose.model('Chapter'),
	$q = require('q')

//
var codes = [
	"ICU",
	"AN",
	"BC",
	"CCU",
	"DN",
	"DT",
	"ER",
	"FMS",
	"HM",
	"HR",
	"IPC",
	"L&D",
	"LB",
	"LD",
	"MOI",
	"MR",
	"MS",
	"MM",
	"NICU",
	"NR"
]

exports.searchChapters = function(req, res, next){
	var count = parseInt(req.query.count) || 10,
		page = parseInt(req.query.page) || 1,
		tags = String(req.query.tags).trim().toLowerCase()

	function check(stn, tags, no_codes){
		var header = stn.header.toLowerCase().indexOf(tags) != -1

		var serial = String(tags.match(/\d+/)).indexOf(stn.serial) != -1

		var code = String(tags.match(/[a-zA-Z]+/)).indexOf(stn.chapter.code.toLowerCase()) != -1

		var ESR = tags.indexOf(String(stn.tags[0]).toLowerCase()) != -1 ||
			String(stn.tags[0]).toLowerCase().indexOf(tags) != -1

		var no_ESR = tags.indexOf('ESR'.toLowerCase()) == -1

		var no_serial = tags.match(/\d+/) == null

		return (header && no_codes) || (serial && code) || (ESR && code) || (no_ESR && no_serial && code)
	}

	Standard.find({}).sort({ serial: 1 }).populate('chapter').exec(function(err, standards){
		if(err)
			return generic.sendError(res, '004', 500)

		var no_codes = true
		for(var i = 0; i < codes.length; i++){
			if(String(tags.match(/[a-zA-Z]+/)).indexOf(codes[i].toLowerCase()) != -1){
				no_codes = false
				break 
			}
		}
		var stList = []
		for(var i = 0; i < standards.length; i++){
			var st = standards[i]
			var checkresult = check(st, tags, no_codes)
			if(checkresult){
				stList.push(utils.extend(st.fresh(), { 
					parent_serial: st.chapter.serial,
					code: st.chapter.code, 
					title: st.chapter.title
				}))
			}
		}

		page = page < 1 || page > Math.ceil(stList.length / count)? 1 : page

		return generic.sendData(res, { 
			standards: stList.slice(0).splice((page - 1) * count, count),
			page: page,
			records: stList.length
		})
	})

}

exports.getStandards = function(req, res, next){
	var list = parseInt(req.query.list)
	if(!isNaN(list)){
		Standard.find({}).sort({serial: 1}).populate('chapter').exec(function(err, standards){
			if(err)
				return generic.sendError(res, '004', 500)

			var stList = []
			for(var i = 0; i < standards.length; i++){
				var st = standards[i]
				stList.push(utils.extend({
					code: st.chapter.code,
					title: st.chapter.title
				}, st.fresh()))
			}
			return generic.sendData(res, { standards: stList })
		})
	} else {
		Chapter.find({}).sort({serial: 1}).exec(function(err, chapters){
			if(err)
				return generic.sendError(res, '004', 500)

			Standard.find({}).sort({ code: 1, serial: 1 }).exec(function(err, standards){
				if(err)
					return generic.sendError(res, '004', 500)

				var stList = []
				for(var i = 0; i < chapters.length; i++){
					var ch = chapters[i],
						related = []
					standards.forEach(function(stn, index){
						if(stn.chapter.equals(ch._id))
							related.push(stn.short())
					})
					stList.push({
						code: ch.code,
						title: ch.title,
						standards: related
					})
				}
				return generic.sendData(res, { standards: stList })
			})
		})
	}
}

exports.getStandardsByCode = function(req, res, next){
	if(req.params.code == null)
		return generic.sendError(res, '037', 400)
	Standard.find({ code: req.params.code }).populate('chapter').exec(function(err, standards){
		if(err)
			return generic.sendError(res, '004', 500)

		var stList = []
		for(var i = 0; i < standards.length; i++){
			var st = standards[i]
			stList.push({
				code: st.chapter.code,
				title: st.chapter.title
			}, st.fresh())
		}
		return generic.sendData(res, { standards: stList })
	})
}