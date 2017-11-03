'use strict';

angular.module('myApp.view_home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'view_home/view_home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', function($scope, $rootScope, $mdDialog) {
	$scope.search = $rootScope.search;

	/*
	 Deletes an Items
	 */
	$scope.delete = function(ev, item, index){
		//Create and display confirmation dialog
		var confirm = $mdDialog.confirm()
			.title("Are You Sure?")
			.ariaLabel("Confirmation")
			.targetEvent(ev)
			.ok("Delete")
			.cancel("Cancel");

		$mdDialog.show(confirm).then(function(){
			//Delete Item
			firebase.database().ref('items/' + firebase.auth().currentUser.uid).orderByChild('image_ref').equalTo(item.image_ref).on('child_added', function(snapshot){
				snapshot.ref.remove();
				firebase.storage().ref(item.image_ref).delete();
			});
		});
		
	}

});