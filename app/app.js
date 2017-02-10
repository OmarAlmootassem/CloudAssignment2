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

.controller('NavCtrl', function($scope, $mdDialog, $location) {
	$scope.name = "Omar Almootassem";

	firebase.auth().onAuthStateChanged(function(user){
		if (user){
			//User is signed in
			$scope.auth = true;
			$location.path('view2');
			console.log("Signed In");
			firebase.database().ref('users/' + user.uid).once('value').then(function(snapshot){
				$scope.initials = snapshot.val().first_name.charAt(0);
				$scope.$applyAsync();
			});
		} else {
			//No user signed in
			$scope.auth = false;
			$location.path('auth_view');
			console.log("Not Signed In");
			$scope.$applyAsync();
		}
	});

	$scope.signOut = function(){
		firebase.auth().signOut();
	}

	$scope.showAddDialog = function(ev){
		$mdDialog.show({
			controller: AddDialogController,
			templateUrl: 'dialogs/add-item.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true,
		});
	}

	function AddDialogController($scope, $mdDialog){
		$scope.imageTags = ["cat", "dog", "hat"];
		$scope.date = new Date();

	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    };
	}
});
