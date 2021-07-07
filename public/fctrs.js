
//
angular.module('app')

.factory('FacilityFctry', function($http, $q){
	return {
		options: null,
		current: null,
		pageSize: 9,
		search: {
			page: NaN,
			records: NaN
		},
		profile: {
			page: NaN,
			records: NaN
		},
		facilities: [],
		managedFacilities: [],
		facility: function(id){
			var dfd = $q.defer()
			$http.get('/api/facility/' + id).then(function(res){
				this.current = res.data.facility
				dfd.resolve(res.data.facility)
			}.bind(this), function(res){
				dfd.reject(res.data)
			})
			return dfd.promise
		},
		query: function(page){
			var dfd = $q.defer()
			$http.get('/api/facility', { params: { page: parseInt(page), count: this.pageSize } }).then(function(res){
				this.search = {
					page: res.data.page || 1,
					records: res.data.records
				}
				this.facilities = res.data.facilities
				dfd.resolve(res.data)
			}.bind(this), function(res){
				dfd.reject(res.data)
			})
			return dfd.promise
		},
		manageable: function(page){
			var dfd = $q.defer()
			$http.get('/api/facility/manageable', { params: { page: parseInt(page), count: this.pageSize }}).then(function(res){
				this.profile = {
					page: res.data.page || 1,
					records: res.data.records
				}
				this.managedFacilities = res.data.facilities
				dfd.resolve(res.data)
			}.bind(this), function(res){
				dfd.reject(res.data)
			})
			return dfd.promise
		},
		requestDelete: function(id, state){
			var dfd = $q.defer()
			$http.put('/api/facility/' + id + '/requestdelete', { state: !!state }).then(function(res){
				dfd.resolve(res.data)
			}, function(res){
				dfd.reject(res.data)
			})
			return dfd.promise
		},
		addFacility: function(body){
			var dfd = $q.defer()
			$http.post('/api/facility', body).then(function(res){
				this.current = res.data.facility
				dfd.resolve(res.data)
			}.bind(this), function(res){
				dfd.reject(res.data)
			})
			return dfd.promise
		},
		editFacility: function(id, body){
			var dfd = $q.defer()
			$http.put('/api/facility/' + id, body).then(function(res){
				this.current = res.data.facility
				dfd.resolve(res.data)
			}.bind(this), function(res){
				dfd.reject(res.data)
			})

			return dfd.promise
		},
		accreditFacility: function(id, status, body){
			var dfd = $q.defer()
			$http.put('/api/facility/' + id + '/accredit', { status: status, chapters: body }).then(function(res){
				this.current = res.data.facility
				dfd.resolve(res.data)
			}.bind(this), function(res){
				dfd.reject(res.data)
			})
			return dfd.promise
		},
		facilityOptions: function(){
			var dfd = $q.defer()
			if(this.options != null) {
				dfd.resolve(this.options)
			} else {
				$http.get('/api/facility/options').then(function(res){
					this.options = res.data.options
					dfd.resolve(res.data)
				}.bind(this), function(res){
					dfd.reject(res.data)
				})
			}
			return dfd.promise
		}
	}
})

.factory('StandardFctry', function($http, $q){
	return {
		current: null,
		chapters: null,
		standards: null,
		search: {
			tags: '',
			page: NaN
		},
		pageSize: 10,
		chapter: function(id){
			var dfd = $q.defer()
			if(this.current != null && (this.current.serial == id || this.current.code == id)){
				dfd.resolve(this.current)
			} else {
				$http.get('/api/chapter/' + id).then(function(res){
					this.current = res.data.chapter
					dfd.resolve(res.data.chapter)
				}.bind(this), function(res){
					dfd.reject(res.data)
				})
			}
			return dfd.promise
		},
		queryStandards: function(){
			var dfd = $q.defer()
			if(this.standards != null){
				dfd.resolve({ standards: this.standards })
			} else {
				$http.get('/api/standard').then(function(res){
					this.standards = res.data.standards
					dfd.resolve(res.data)
				}.bind(this), function(res){
					dfd.reject(res.data)
				})
			}
			return dfd.promise
		},
		searchStandards: function(tags, page){
			var dfd = $q.defer()
			$http.get('/api/standard/search', { params: { page: page, tags: tags, count: this.pageSize } }).then(function(res){
				this.search = {
					tags: tags,
					page: res.data.page,
					records: res.data.records
				}
				this.searchedStandards = res.data.standards
				dfd.resolve(res.data)
			}.bind(this), function(res){
				dfd.reject(res.data)
			})
			return dfd.promise
		},
		query: function(){
			var dfd = $q.defer()
			if(this.chapters != null){
				dfd.resolve({ chapters: this.chapters })
			} else {
				$http.get('/api/chapter').then(function(res){
					this.chapters = res.data.chapters
					dfd.resolve(res.data.chapters)
				}.bind(this), function(res){
					dfd.reject(res.data)
				})
			}
			return dfd.promise
		}
	}
})

.factory('AuthFctry', function($http, $q){
	return {
		current: null,
		login: function(data){
			var dfd = $q.defer()
			$http.post('/api/login', data).then(function(res){
				this.current = res.data.user
				dfd.resolve(res.data)
			}.bind(this), function(res){
				dfd.reject(res.data)
			})
			return dfd.promise
		},
		logout: function(){
			var dfd = $q.defer()
			$http.get('/api/logout').then(function(res){
				this.current = null
				dfd.resolve(res.data)
			}.bind(this), function(res){
				dfd.reject(res.data)
			})
			return dfd.promise
		},
		authenticate: function(){
			var dfd = $q.defer()
			if(this.current == null){
				$http.get('/api/authenticate').then(function(res){
					if(res.data.isAuthenticated){
						this.current = res.data.user
						dfd.resolve(res.data)
					} else {
						dfd.reject(res.data)
					}
				}.bind(this), function(res){
					dfd.reject(res.data)
				})
			} else {
				dfd.resolve({ user: this.current })
			}
			return dfd.promise
		}
	}
})







