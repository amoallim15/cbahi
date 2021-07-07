
//
angular.module('app', ['ui.router'])

.config(function($locationProvider, $stateProvider, $urlRouterProvider){

	$locationProvider.html5Mode(true)

	$urlRouterProvider.otherwise('/')

	$stateProvider
		.state('home', {
			url: '',
			abstract: true,
			templateUrl: '/templates/home.html',
			controller: 'HomeCtrl',
		})
		.state('home.default', {
			url: '/',
			templateUrl: '/templates/landing-page.html',
			controller: 'LandingCtrl'
		})
		.state('home.facilities', {
			url: '/facilities',
			templateUrl: '/templates/facilities.html',
			controller: 'FacilitiesCtrl',
			resolve: {
				resolveFacilities: resolveFacilities
			}
		})
		.state('home.facilityPagination', {
			url: '/facilities/{page}',
			templateUrl: 'templates/facilities.html',
			controller: 'FacilitiesCtrl',
			resolve: {
				resolveFacilities: resolveFacilities
			}
		})
		.state('home.standards', {
			url: '/standards',
			templateUrl: '/templates/standards.html',
			controller: 'StandardsCtrl',
			resolve: {
				resolveStandards: resolveStandards
			}
		})
		.state('home.standards.chapter', {
			url: '/{id}',
			templateUrl: '/templates/chapter.html',
			controller: 'ChapterCtrl',
			resolve: {
				resolveChapter: resolveChapter
			}
		})
		.state('home.policies', {
			url: '/policies',
			templateUrl: '/templates/policies.html'
		})
		.state('home.about', {
			url: '/about',
			templateUrl: '/templates/about.html'
		})
		.state('home.login', {
			url: '/login',
			templateUrl: '/templates/login.html',
			controller: 'AuthCtrl',
			resolve: {
				resolveAuth: resolveAuth
			}
		})
		.state('home.profile', {
			url: '/profile',
			parent: 'home',
			abstract: true,
			templateUrl: '/templates/profile.html',
			controller: 'ProfileCtrl',
			resolve: {
				resolveUser: resolveUser
			}
		})
		.state('home.profile.info', {
			url: '',
			templateUrl: '/templates/profile.info.html',
		})
		.state('home.profile.facility', {
			url: '/facility',
			templateUrl: 'templates/profile.facilities.html',
			controller: 'ManageFacilityCtrl',
			resolve: {
				resolveManageableFacilities: resolveManageableFacilities
			}
		})
		.state('home.profile.addFacility', {
			url: '/facility/add',
			templateUrl: 'templates/profile.facility.add.edit.html',
			controller: 'addFacilityCtrl',
			resolve: {
				resolveFacilityOptions: resolveFacilityOptions
			}
		})
		.state('home.profile.accreditFacility', {
			url: '/facility/{id}/accredit',
			templateUrl: 'templates/profile.facility.accredit.html',
			controller: 'accreditFacilityCtrl',
			resolve: {
				resolveFacilityOptions: resolveFacilityOptions,
				resolveFacilityProfile: resolveFacilityProfile
			}
		})
		.state('home.profile.editFacility', {
			url: '/facility/{id}/edit',
			templateUrl: 'templates/profile.facility.add.edit.html',
			controller: 'editFacilityCtrl',
			resolve: {
				resolveFacilityOptions: resolveFacilityOptions,
				resolveFacilityProfile: resolveFacilityProfile
			}
		})
		.state('home.profile.pagination', {
			url: '/facility/{page}',
			templateUrl: 'templates/profile.facilities.html',
			controller: 'ManageFacilityCtrl',
			resolve: {
				resolveManageableFacilities: resolveManageableFacilities
			}
		})
		.state('home.search', {
			url: '/search/{tags}',
			templateUrl: '/templates/search.html',
			controller: 'SearchCtrl',
			resolve: {
				resolveSearchStandards: resolveSearchStandards
			}
		})
		.state('home.searchPagination', {
			url: '/search/{tags}/{page}',
			templateUrl: '/templates/search.html',
			controller: 'SearchCtrl',
			resolve: {
				resolveSearchStandards: resolveSearchStandards
			}
		})
		.state('home.facility', {
			url: '/facility/{id}',
			templateUrl: '/templates/facility.html',
			controller: 'FacilityCtrl',
			resolve: {
				resolveFacility: resolveFacility
			}
		})

})

.value('Google', GoogleMapsLoader)
.value('Toastr', toastr)

.value('utils', {
	extend: function(a){
		if(a !== undefined || arguments.length > 1){
			for(var i = 1; i < arguments.length; i++){
				var obj = arguments[i]
				for(var key in obj){
					if(Object.prototype.hasOwnProperty.call(obj, key)){
						a[key] = obj[key]
					}
				}
			}
		}
		return a
	}
})

.run(function(Google, Toastr){
	Google.KEY = 'AIzaSyAU6-RR-zCZ-a-P0SzWa_lmuJJFOw4aCpY',
	Toastr.options = {
		toastClass: 'alert',
		// timeOut: 30000000,
		// extendedTimeOut: 600000000,
		positionClass: 'ap-toastr',
		iconClasses: {
			error: 'alert-danger',
			info: 'alert-info',
			success: 'alert-success',
			warning: 'alert-warning'
		}
	}
})

.directive('mapDrct', function(Google){
	return {
		restrict: 'A',
		link: function($scope, elm, attr){
			if($scope.fc && $scope.fc.address && $scope.fc.address.map.lat && $scope.fc.address.map.lng)
				Google.load(function(google) {
					var marker = new google.maps.Marker({
						position: {lat: $scope.fc.address.map.lat, lng: $scope.fc.address.map.lng},
						title:"Hello World!"
					})
					var map = new google.maps.Map(elm.context, {
						center: {lat: $scope.fc.address.map.lat, lng: $scope.fc.address.map.lng},
						zoom: 16
					})
					marker.setMap(map)
				})
		}
	}
})

function resolveFacility($q, $stateParams, FacilityFctry, $state){
	var dfd = $q.defer()
	FacilityFctry.facility($stateParams.id).then(function(){
		dfd.resolve(true)
	}, function(){
		$state.transitionTo('home.default')
	})
	return dfd.promise
}

function resolveFacilities($q, FacilityFctry, $state, $stateParams){
	var dfd = $q.defer(),
		page = parseInt($stateParams.page)
	if(FacilityFctry.page != page){
		FacilityFctry.query(page).then(function(data){
			if(page > data.page || page < 1){
				$state.transitionTo('home.facilities')
			}
			dfd.resolve(true)
		}, function(){
			$state.transitionTo('home.default')
		})
	}
	return dfd.promise
}

function resolveSearchStandards($stateParams, $q, StandardFctry, $state, $location){ 
	var dfd = $q.defer(),
		tags = $stateParams.tags,
		page = $stateParams.page

	if(StandardFctry.search.tags != tags || StandardFctry.search.page != page){
		StandardFctry.searchStandards(tags, page).then(function(data){
			if(!isNaN(page) && (page > data.page || page < 1)){
				$location.path('/search/' + tags)
			}
			dfd.resolve(true)
		}, function(){
			$state.transitionTo('home.default')
		})
	}
	return dfd.promise
}

function resolveChapter($stateParams, $q, StandardFctry){
	var dfd = $q.defer()
	StandardFctry.chapter($stateParams.id).then(function(){
		dfd.resolve(true)
	}, function(){
		$state.transitionTo('home.standards')
	})
	return dfd.promise
}

function resolveStandards($q, StandardFctry, $state){
	var dfd = $q.defer()
	StandardFctry.query().then(function(){
		dfd.resolve(true)
	}, function(){
		$state.transitionTo('home.default')
	})
	return dfd.promise
}

function resolveAuth($q, AuthFctry, $state){
	var dfd = $q.defer()
	AuthFctry.authenticate().then(function(data){
		if(data.isAuthenticated == true){
			$state.transitionTo('home.default')
			return
		}
		dfd.resolve(true)
	}, function(data){
		if(data.isAuthenticated == true){
			$state.transitionTo('home.default')
			return
		}
		dfd.resolve(true)
	})
	return dfd.promise
}

function resolveUser(AuthFctry, $q, $state){
	var dfd = $q.defer()
	AuthFctry.authenticate().then(function(){
		dfd.resolve(true)
	}, function(){
		$state.transitionTo('home.login')
		dfd.reject(false)
	})
	return dfd.promise
}

function resolveManageableFacilities(resolveUser, $q, FacilityFctry, AuthFctry, $state, $stateParams, $location){
	if(resolveUser == false){
		// $location.path('/login')
		return false
	}
	var dfd = $q.defer(),
		page = parseInt($stateParams.page)

	if(FacilityFctry.profile.page != page){
		FacilityFctry.manageable(page).then(function(data){
			if(page > data.page || page < 1){
				$state.transitionTo('home.profile.facility')
			}
			dfd.resolve(true)
		}, function(){
			$state.transitionTo('home.profile.info') 
		})
	}
	return dfd.promise
}

function resolveFacilityOptions($q, FacilityFctry, AuthFctry, $state, $location, resolveUser){
	if(resolveUser == false){
		$location.path('/login')
		return false
	}
	var dfd = $q.defer()
	FacilityFctry.facilityOptions().then(function(data){
		dfd.resolve(true)
	}, function(){
		$state.transitionTo('home.profile.facility')
	})
	return dfd.promise
}

function resolveFacilityProfile($q, $stateParams, FacilityFctry, $state, $location, AuthFctry, resolveUser){
	if(resolveUser == false){
		$location.path('/login')
		return false
	}
	var dfd = $q.defer()
	FacilityFctry.facility($stateParams.id).then(function(){
		dfd.resolve(true)
	}, function(){
		$state.transitionTo('home.profile.facility')
	})
	return dfd.promise
}





