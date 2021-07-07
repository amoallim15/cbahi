
//
angular.module('app')

.controller('HomeCtrl', function($scope, $location, $http, $state, AuthFctry){
	var navUrl = /^(?:\/?)[a-zA-Z]*(?=\/?)/,
		navUrlTrim = /^\//

	$scope.auth = AuthFctry

	$scope.showAuth = function(fn){
		if(fn === 1 && $scope.auth.current == null)
			return true
		if(fn === 0 && $scope.auth.current != null)
			return true
		return false
	}
	$scope.nav = function(dir){
		var url = $location.path().match(navUrl)
		if(url != null && url[0].replace(navUrlTrim, '') == dir)
			return 'active'
		return ''
	}
})

.controller('LandingCtrl', function($scope, $state, FacilityFctry, Toastr){
	$scope.ln = { search: FacilityFctry.search.tags }

	$scope.search = function(){
		if($scope.ln.search == null || $scope.ln.search == ''){
			Toastr.warning('search field is empty')
			return
		}
		$state.transitionTo('home.search', { tags: $scope.ln.search })
	}
})

.controller('FacilitiesCtrl', function($scope, $location, FacilityFctry, utils, $state){
	$scope.sr = utils.extend({}, FacilityFctry.search)
	$scope.sr.facilities = FacilityFctry.facilities

	$scope.pagination = function(dir){
		var page = $scope.sr.page,
			pageSize = FacilityFctry.pageSize,
			records = $scope.sr.records

		if((page <= 1 && dir === -1) || (page >= Math.ceil( records / pageSize ) && dir === 1))
			return
		if(dir === -1)
			page--
		else if(dir === 1)
			page++

		$state.transitionTo('home.facilityPagination', { page: page })
	}

	$scope.statusClass = function(status){
		if(typeof status !== 'string')
			return 'tag-info'
		status = status.toLowerCase()
		if(status == 'rejected')
			return 'tag-danger'
		else if(status == 'pending')
			return 'tag-warning'
		else
			return 'tag-success'
	}

	$scope.dirClass = function(dir){
		var page = $scope.sr.page,
			pageSize = FacilityFctry.pageSize,
			records = $scope.sr.records
		if((page <= 1 && dir === -1) || (page >= Math.ceil( records / pageSize ) && dir === 1))
			return 'disabled'
		return ''
	}
})

.controller('StandardsCtrl', function($scope, $location, StandardFctry){
	var chapterUrl = /^\/?standards\/[\d]+/,
		chapterUrlTrim = /^\/?standards\//

	$scope.chapters = StandardFctry.chapters

	$scope.showTitle = function(){
		var url = $location.path().match(chapterUrl)
		if(url != null && !isNaN(url[0].replace(chapterUrlTrim, ''))){
			return false
		}
		return true
	}

	$scope.chClass = function(serial, code){
		var url = $location.path().match(chapterUrl)
		if(url != null && (url[0].replace(chapterUrlTrim, '') == serial || url[0].replace(chapterUrlTrim, '') == code))
			return 'active'
		return ''
	}
})

.controller('ChapterCtrl', function($scope, $state, StandardFctry){
	$scope.ch = StandardFctry.current

	if(StandardFctry.current != null){
		$scope.$parent.title = $scope.ch.title
		$scope.$parent.code = $scope.ch.code
	}
})

.controller('FacilityCtrl', function($scope, FacilityFctry){
	$scope.fc = FacilityFctry.current

	$scope.stnStatusClass = function(status){
		if(typeof status !== 'string')
			return 'tag-info'
		status = status.toLowerCase()
		if(status == 'partial')
			return 'tag-info'
		else if(status == 'complete')
			return 'tag-success'
		else
			return 'tag-warning'
	}

	$scope.statusClass = function(status){
		if(typeof status !== 'string')
			return 'tag-info'
		status = status.toLowerCase()
		if(status == 'rejected')
			return 'tag-danger'
		else if(status == 'pending')
			return 'tag-warning'
		else
			return 'tag-success'
	}
})

.controller('AuthCtrl', function($scope, AuthFctry, $state, Toastr){
	$scope.lg = { email: '', password: '', remember_me: true }

	$scope.statusClass = function(status){
		if(typeof status !== 'string')
			return 'tag-info'
		status = status.toLowerCase()
		if(status == 'rejected')
			return 'tag-danger'
		else if(status == 'pending')
			return 'tag-warning'
		else
			return 'tag-success'
	}

	$scope.login = function(){
		AuthFctry.login($scope.lg).then(function(data){
			$state.transitionTo('home.profile.info')
			Toastr.success('weclome back ' + data.user.name)
		}, function(data){
			Toastr.error(data.error)
		})
	}
})

.controller('ProfileCtrl', function($scope, $location, AuthFctry, $state, Toastr){
	var dirUrl = /^\/?profile\/?[a-zA-Z]*/,
		dirUrlTrim = /^\/?profile\/?/

	$scope.ur = AuthFctry.current

	$scope.admin = function(){
		if($scope.ur.roles.indexOf('admin') != -1)
			return true
		return false
	}

	$scope.dirClass = function(dir){
		var url = $location.path().match(dirUrl)
		if(url !== null){
			if(dir === 0 && url[0].replace(dirUrlTrim, '') == '')
				return 'active'
			if(dir === 1 && url[0].replace(dirUrlTrim, '') == 'facility')
				return 'active'
		}
		return ''
	}

	$scope.logout = function(){
		AuthFctry.logout().then(function(){
			$state.transitionTo('home.login')
		}, function(data){
			Toastr.error(data.error)
		})
	}
})

.controller('ManageFacilityCtrl', function($scope, FacilityFctry, AuthFctry, utils, $state, Toastr){
	$scope.ur = AuthFctry.current
	$scope.pr = utils.extend({}, FacilityFctry.profile)
	$scope.pr.facilities = FacilityFctry.managedFacilities

	$scope.isDeleted = function(index){
		return !!FacilityFctry.managedFacilities[index].isDeleted
	}

	$scope.requestDelete = function(index){
		var fc = FacilityFctry.managedFacilities[index]
		FacilityFctry.requestDelete(fc._id, !fc.isDeleted).then(function(data){
			FacilityFctry.managedFacilities[index] = data.facility
			Toastr.success('The operation has been completed successfully')
		}, function(data){
			Toastr.error(data.error)
		})
	}

	$scope.statusClass = function(status){
		if(typeof status !== 'string')
			return 'tag-info'
		status = status.toLowerCase()
		if(status == 'rejected')
			return 'tag-danger'
		else if(status == 'pending')
			return 'tag-warning'
		else
			return 'tag-success'
	}

	$scope.dirClass = function(dir){
		var page = $scope.pr.page,
			pageSize = FacilityFctry.pageSize,
			records = $scope.pr.records
		if((page <= 1 && dir === -1) || (page >= Math.ceil( records / pageSize ) && dir === 1))
			return 'disabled'
		return ''
	}

	$scope.pagination = function(dir){
		var page = $scope.pr.page,
			pageSize = FacilityFctry.pageSize,
			records = $scope.pr.records

		if((page <= 1 && dir === -1) || (page >= Math.ceil( records / pageSize ) && dir === 1))
			return
		if(dir === -1)
			page--
		else if(dir === 1)
			page++
		$state.transitionTo('home.profile.pagination', { page: page })
	}

	$scope.admin = function(){
		if($scope.ur.roles.indexOf('admin') != -1)
			return true
		return false
	}
})

.controller('addFacilityCtrl', function($scope, FacilityFctry, $state, Toastr){
	$scope.add = true
	$scope.op = FacilityFctry.options
	$scope.ad = {
		type: $scope.op.type[0],
		category: $scope.op.category[0],
		speciality: $scope.op.speciality[0],
		region: $scope.op.region[0],
		nearestAirport: $scope.op.airport[0]
	}

	$scope.submit = function(){
		FacilityFctry.addFacility($scope.ad).then(function(data){
			$state.transitionTo('home.facility', { id: data.facility._id })
			Toastr.success('The operation has been completed successfully')
		}, function(data){
			Toastr.error(data.error)
		})
	}

	$scope.cancel = function(){
		$state.transitionTo('home.profile.facility')
		Toastr.warning('The operation has been cancelled')
	}
})

.controller('editFacilityCtrl', function($scope, FacilityFctry, $state, Toastr){
	$scope.edit = true
	$scope.op = FacilityFctry.options
	var fc = FacilityFctry.current

	function refresh(fc){
		$scope.ad = {
			name: fc.name,
			name_ar: fc.name_ar,
			type: fc.type,
			category: fc.category,
			speciality: fc.speciality,
			region: fc.address.region,
			nearestAirport: fc.address.nearestAirport,
			street: fc.address.street,
			district: fc.address.district,
			POBox: fc.address.POBox,
			zipCode: fc.address.zipCode,
			city: fc.address.city,
			telephone: fc.address.telephone,
			extensionNo: fc.address.extensionNo,
			fax: fc.address.fax,
			offecialEmail: fc.address.offecialEmail,
			offecialWebsite: fc.address.offecialWebsite,
			lat: fc.address.map.lat,
			lng: fc.address.map.lng
		}
	}

	refresh(fc)

	$scope.submit = function(){
		FacilityFctry.editFacility(FacilityFctry.current._id, $scope.ad).then(function(data){
			$state.transitionTo('home.facility', { id: data.facility._id })
			Toastr.success('The operation has been completed successfully')
		}, function(data){
			Toastr.error(data.error)
		})
	}

	$scope.cancel = function(){
		$state.transitionTo('home.profile.facility')
		Toastr.warning('The operation has been cancelled')
	}
})

.controller('accreditFacilityCtrl', function($scope, FacilityFctry, $state, Toastr){
	$scope.op = FacilityFctry.options
	$scope.ad = FacilityFctry.current

	$scope.submit = function(){
		FacilityFctry.accreditFacility(FacilityFctry.current._id, $scope.ad.status, $scope.ad.chapters).then(function(data){
			$scope.ad = data.facility
			Toastr.success('The operation has been completed successfully')
		}, function(data){
			Toastr.error(data.error)
		})
	}

	$scope.cancel = function(){
		$state.transitionTo('home.profile.facility')
		Toastr.warning('The operation has been cancelled')
	}
})

.controller('SearchCtrl', function($scope, $state, utils, StandardFctry){
	$scope.sr = utils.extend({}, StandardFctry.search)
	$scope.sr.standards = StandardFctry.searchedStandards

	$scope.search = function(){
		$state.transitionTo('home.search', { tags: $scope.sr.tags, page: $scope.sr.page })
	}

	$scope.pagination = function(dir){
		var tags = $scope.sr.tags,
			page = $scope.sr.page,
			pageSize = StandardFctry.pageSize,
			records = $scope.sr.records

		if((page <= 1 && dir === -1) || (page >= Math.ceil( records / pageSize ) && dir === 1))
			return
		if(dir === -1)
			page--
		else if(dir === 1)
			page++

		$state.transitionTo('home.searchPagination', { tags: $scope.sr.tags, page: page })
	}

	$scope.dirClass = function(dir){
		var page = $scope.sr.page,
			pageSize = StandardFctry.pageSize,
			records = $scope.sr.records
		if((page <= 1 && dir === -1) || (page >= Math.ceil( records / pageSize ) && dir === 1))
			return 'disabled'
		return ''
	}
})




