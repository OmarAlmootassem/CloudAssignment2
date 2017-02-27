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

.controller('NavCtrl', function($scope, $rootScope, $mdDialog, $location, $mdToast) {
	$rootScope.search = $scope.search;

	//Authentication change listener
	firebase.auth().onAuthStateChanged(function(user){
		$rootScope.itemList = [];
		if (user){	//Signed In
			$scope.auth = true;
			$location.path('home');	//Go to home page
			console.log("Signed In");
			//Get User Info
			firebase.database().ref('users/' + user.uid).once('value').then(function(snapshot){
				$scope.initials = snapshot.val().first_name.charAt(0);
				getItemList();
				$scope.$applyAsync();
			});
		} else {	//Signed Out
			$scope.auth = false;
			$location.path('auth');	//Go to auth page
			console.log("Not Signed In");
			$scope.$applyAsync();
		}
	});

	/**
	 *	Opens a dialog that contains information about the site
	 */
	$scope.showSiteInfo = function(ev){
		$mdDialog.show({
			controller: InfoDialogController,
			templateUrl: 'dialogs/page-info.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true,
		});
	}

	/**
	 *	Controller for the site info dialog
	 */
	function InfoDialogController($scope, $mdDialog){
		//Get number of active users
		firebase.database().ref('users').on('value', function(snapshot){
			$scope.numUsers = snapshot.numChildren();
			console.log($scope.numUsers);
		});

		/**
		 *	Close dialog
		 */
	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    }
	}

	/**
	 *	Gets all the items in the person's inventory
	 */
	function getItemList(){
		firebase.database().ref("items/" + firebase.auth().currentUser.uid).on('value', function(snapshot){
			$rootScope.itemList.length = 0;
			snapshot.forEach(function(childSnapshot){
				$rootScope.itemList.push(childSnapshot.val());
			});
			//Goes through the inventory and formates the date and the tags
			for (var i = 0; i < $rootScope.itemList.length; i++){
				var tags = "";
				$rootScope.itemList[i].formatted_date = moment($rootScope.itemList[i].date).format("MMM/D/YYYY");
				for (var key in $rootScope.itemList[i].tags){
					if ($rootScope.itemList[i].tags.hasOwnProperty(key)){
						tags += $rootScope.itemList[i].tags[key];
					}
				}
				$rootScope.itemList[i].tags_all = tags;
			}
			$scope.$applyAsync();
		});
	}

	/**
	 *	Signs the user out
	 */
	$scope.signOut = function(){
		firebase.auth().signOut();
	}

	/**
	 *	Shows the add item dialog
	 */
	$scope.showAddDialog = function(ev){
		$mdDialog.show({
			controller: AddDialogController,
			templateUrl: 'dialogs/add-item.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true,
		});
	}

	/**
	 *	Controller for the add item dialog
	 */
	function AddDialogController($scope, $mdDialog){
		$scope.imageTags = [];
		$scope.files = [];
		$scope.date = new Date();

		// Called when a file is placed into the upload area
		$scope.$watch('files.length', function(newVal, oldVal){
			if($scope.files.length == 1){
				console.log($scope.files[0]);
				var reader = new FileReader();
				var imageBase64;
				reader.onload = function(event){
					//Build the JSON for the VIsion API request
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

					//Call the vision apu
					$.ajax({
						method:'POST',
						url:'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyB6XH2RQ-2wfUMPQSp0r06UUyXgxo42Kt8',
						contentType: 'application/json',
						processData: false,
						data:JSON.stringify(json),
						success: function(data){
							// console.log(data);
							//Put the returned tag into an array to display
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

		/**
		 *	Adds an item to the database and uploads the image
		 */
		$scope.addItem = function(){
			firebase.storage().ref().child('users/' + firebase.auth().currentUser.uid + '/images/' + Date.now() + $scope.files[0].lfFileName).put($scope.files[0].lfFile).then(function(snapshot){
				console.log(snapshot);
				var postKey = firebase.database().ref("items/" + firebase.auth().currentUser.uid).push().key;
				firebase.database().ref("items/" + firebase.auth().currentUser.uid + "/" + postKey).update({
					date: $scope.date.toISOString(),
					image_url: snapshot.a.downloadURLs[0],
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

		/**
		 *	Closes the dialog
		 */
	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    }
	}
});
