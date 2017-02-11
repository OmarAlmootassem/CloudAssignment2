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
		console.log($scope.imageTags);
		$scope.files = [];
		$scope.date = new Date();
		console.log($scope.date);

		$scope.$watch('files.length', function(newVal, oldVal){
			if($scope.files.length == 1){
				console.log($scope.files);
				console.log($scope.date);
			}
		});

		$scope.addItem = function(){
			firebase.storage().ref().child('users/' + firebase.auth().currentUser.uid + '/images/' + Date.now() + $scope.files[0].lfFileName).put($scope.files[0].lfFile).then(function(snapshot){
				console.log(snapshot);
				var postKey = firebase.database().ref("items/" + firebase.auth().currentUser.uid).push().key;
				firebase.database().ref("items/" + firebase.auth().currentUser.uid + "/" + postKey).update({
					date: $scope.date.toString(),
					image_ref: snapshot.a.fullPath
				}, function(error){
					if (error){
						console.log(error.errorMessage);
					} else {
						for (var i = 0; i < $scope.imageTags.length; i++) {
							firebase.database().ref("items/" + firebase.auth().currentUser.uid + "/" + postKey + "/tags").push($scope.imageTags[i]);
						}
					}
				});
			});
		}

	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    }
	}
});
