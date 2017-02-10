'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', ['ngMaterial', 'ngAvatar', 'lfNgMdFileInput',
  'ngRoute',
  'myApp.view_auth',
  'myApp.view2',
  'myApp.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view_auth'});
}])

.controller('NavCtrl', function($scope, $mdDialog) {
	$scope.name = "Omar Almootassem";

	firebase.auth().onAuthStateChanged(function(user){
		if (user){
			//User is signed in
			$scope.auth = true;
			console.log("Signed In");
		} else {
			//No user signed in
			$scope.auth = false;
			console.log("Not Signed In");
		}
	})

	$scope.showAddDialog = function(ev){
		$mdDialog.show({
			controller: AddDialogController,
			templateUrl: 'dialogs/add-item.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true,
		});
	};

	function AddDialogController($scope, $mdDialog){
	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    };
	}
});
