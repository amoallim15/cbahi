var mongoose = require('mongoose'),
	file = require('fs'),
	Chapter = mongoose.model('Chapter'),
	Standard = mongoose.model('Standard'),
	utils = require('./utils'),
	$q = require('q')

//
module.exports = function(config){

	//
	importChapters(config).then(is, is)
	//
	function is(){
		importStandards(config) //.then(importRandomly.bind(this, config), importRandomly.bind(this, config))
	}
}


function importChapters(config){
	var midPath = '/PDF/chapters/',
		promises = [],
		dfd = $q.defer()

	Chapter.find({}).exec(function(err, collection){
		if(err)
			throw err
		if(collection.length !== 0){
			dfd.reject()
			return
		}

		file.readdir(config.rootPath + midPath, function(err, filenames){
			if(err)
				throw err

			filenames.forEach(function(name, index){
				var json = require(config.rootPath + midPath + name),
					dfdx = $q.defer()
				promises.push(dfdx.promise)
				Chapter.create({
					updatedAt: new Date(),
					color: utils.colors[index],
					serial: json.serial,
					title: json.title,
					code: json.code,
					introduction: json.introduction,
					concerns: json.concerns.map(function(item, index){
						return { serial: index + 1, header: item}
					})
				}, function(err){
					if(err)
						throw err
					dfdx.resolve()
				})
			})
			$q.all(promises).then(function(){
				console.log('all PDF chapters created..')
				dfd.resolve()
			})
		})
	})
	return dfd.promise
}

function importStandards(config){
	var midPath = '/PDF/standards/',
		promises = [],
		dfd = $q.defer()
	Standard.find({}).exec(function(err, collection){
		if(err)
			throw err
		if(collection.length !== 0){
			dfd.reject()
			return
		}

		file.readdir(config.rootPath + midPath, function(err, filenames){
			if(err)
				throw err

			Chapter.find({}).exec(function(err, collection){
				if(err)
					throw err

				filenames.forEach(function(name, index){
					var json = require(config.rootPath + midPath + name),
						chapter
					collection.forEach(function(ch, index){
						if(ch.code == json.code)
							chapter = ch
					})
					if(chapter == undefined)
						throw new Error('chapter doesn\'t exist')
					json.standards.forEach(function(stn){
						var dfdx = $q.defer()
						Standard.create({
							updatedAt: new Date(),
							serial: stn.serial,
							header: stn.header,
							tags: stn.tags,
							details: stn.details.map(function(el, index1){
								return {
									serial: index1 + 1,
									header: el.header,
									details: (el.details || []).map(function(el, index2){
										return {
											serial: index2 + 1,
											header: el
										}
									})
								}
							}),
							chapter: chapter._id
						}, function(err){
							if(err){
								console.log(err)
								throw err
							}
							dfdx.resolve()
						})
					})
				})

				$q.all(promises).then(function(){
					console.log('all chapters\' standards created..')
					dfd.resolve()
				})
			})
		})
	})
	return dfd.promise
}


// function importRandomly(config){
// 	var promises = [],
// 		dfd = $q.defer()

// 	Chapter.find({}).sort({ serial: 1 }).exec(function(err, chapters){
// 		if(err)
// 			throw err

// 		Standard.find({}).exec(function(err, standards){
// 			if(err)
// 				throw err

// 			var check_list = {}
// 			for(var i = 0; i < standards.length; i++){
// 				var stn = standards[i]
// 				check_list[stn.chapter.toString()] = true
// 			}

// 			var check_break = Object.keys(check_list).length
// 			if(check_break >= 31){
// 				dfd.reject()
// 				return
// 			}

// 			var ttl = standards.length,
// 				start_index = 11,
// 				min = 8,
// 				max = 45,
// 				fake_list = []

// 			for(var i = start_index; i < chapters.length; i++){
// 				var ch = chapters[i],
// 					rnd_length = Math.floor(Math.random() * (max - min) + min)

// 				for(var j = 0; j < rnd_length; j++){
// 					var rnd = Math.floor(Math.random() * (ttl - 0) + 0)

// 					var stn = standards[rnd]
// 					stn.serial = j + 1
// 					stn.chapter = ch._id.toString()
// 					fake_list.push(new Standard({
// 						updatedAt: new Date(),
// 						serial: stn.serial,
// 						header: stn.header,
// 						tags: stn.tags,
// 						details: stn.details,
// 						chapter: stn.chapter
// 					}).toObject())
// 				}
// 			}
// 			Standard.collection.insert(fake_list, function(err){
// 				if(err)
// 					throw err
// 				console.log('all fake standards created..')
// 				dfd.resolve()
// 			})
// 		})
// 	})
// 	return dfd.promise
// }


