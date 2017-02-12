'use strict';

angular.module('myApp.view_home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'view_home/view_home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', function($scope, $rootScope, $mdDialog) {
	console.log($rootScope.itemList);
	$scope.search = $rootScope.search;

	$scope.delete = function(ev, item, index){
		console.log(item);
		var confirm = $mdDialog.confirm()
			.title("Are You Sure?")
			.ariaLabel("Confirmation")
			.targetEvent(ev)
			.ok("Delete")
			.cancel("Cancel");

		$mdDialog.show(confirm).then(function(){
			firebase.database().ref('items/' + firebase.auth().currentUser.uid).orderByChild('image_ref').equalTo(item.image_ref).on('child_added', function(snapshot){
				snapshot.ref.remove();
				firebase.storage().ref(item.image_ref).delete();
			});
		});
		
	}

});