'use strict';

angular.module('myApp.view_auth', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view_auth', {
    templateUrl: 'view_auth/view_auth.html',
    controller: 'ViewAuthCtrl'
  });
}])

.controller('ViewAuthCtrl', function($scope) {
	$scope.signInUp = false;
	$scope.user = {};

	$scope.switchView = function(){
		$scope.signInUp = !$scope.signInUp;
		$scope.$applyAsync();
	}

});