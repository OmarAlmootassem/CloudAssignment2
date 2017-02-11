'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', ['ngMaterial', 'ngAvatar', 'lfNgMdFileInput',
  'ngRoute',
  'myApp.view_auth',
  'myApp.view_home',
  'myApp.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view_auth'});
}])

.controller('NavCtrl', function($scope, $mdDialog, $location, $mdToast) {

	firebase.auth().onAuthStateChanged(function(user){
		if (user){
			//User is signed in
			$scope.auth = true;
			$location.path('home');
			console.log("Signed In");
			firebase.database().ref('users/' + user.uid).once('value').then(function(snapshot){
				$scope.initials = snapshot.val().first_name.charAt(0);
				$scope.$applyAsync();
			});
		} else {
			//No user signed in
			$scope.auth = false;
			$location.path('auth');
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
		$scope.imageTags = [];
		$scope.files = [];
		$scope.date = new Date();

		$scope.$watch('files.length', function(newVal, oldVal){
			if($scope.files.length == 1){
				console.log($scope.files[0]);
				var reader = new FileReader();
				var imageBase64;
				reader.onload = function(event){
					imageBase64 = event.target.result;
					imageBase64 = imageBase64.replace('data:image/jpeg;base64,', '');
					imageBase64 = imageBase64.replace('data:image/png;base64,', '');
					var json = {
						"requests": [
							{"image": {"content": imageBase64},
								"features": [
									{"type": "LABEL_DETECTION"}
								]
							}
						]
					};

					$.ajax({
						method:'POST',
						url:'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyB6XH2RQ-2wfUMPQSp0r06UUyXgxo42Kt8',
						contentType: 'application/json',
						processData: false,
						data:JSON.stringify(json),
						success: function(data){
							// console.log(data);
							for (var i = 0; i < data.responses[0].labelAnnotations.length; i++){
								$scope.imageTags.push(data.responses[0].labelAnnotations[i].description);
							}
							$scope.$applyAsync();
						}, error: function(data, textStatus, errorThrown){
							console.error(data);
						}
					});
				}
				reader.readAsDataURL($scope.files[0].lfFile);
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
	      				$mdDialog.cancel();
	      				$mdToast.show(
					        $mdToast.simple()
					          .textContent('Item Successfuly Added')
					          .hideDelay(3000)
				        );
					}
				});
			});
		}

	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    }
	}
});
