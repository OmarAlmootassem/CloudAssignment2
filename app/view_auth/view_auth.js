'use strict';

angular.module('myApp.view_auth', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/auth', {
    templateUrl: 'view_auth/view_auth.html',
    controller: 'AuthCtrl'
  });
}])

.controller('AuthCtrl', function($scope, $mdToast) {
	$scope.signInUp = false;
	$scope.user = {};

	/**
	 *	Switch between sign in and sign up
	 */
	$scope.switchView = function(){
		$scope.signInUp = !$scope.signInUp;
		$scope.$applyAsync();
	}

	/**
	 *	Create a new user in firebase and catch error
	 */
	$scope.signUp = function(input){
		firebase.auth().createUserWithEmailAndPassword(input.email, input.password).then(function(user){
			firebase.database().ref('users/' + user.uid).update({
	          first_name: input.fname,
	          last_name: input.lname,
	          email: user.email
	        });

		}).catch(function(error){
			var errorCode = error.code;
			var errorMessage = error.message;
			$mdToast.show(
	        $mdToast.simple()
	          .textContent('Error ' + errorCode + ": " + errorMessage)
	          .hideDelay(3000)
	        );
		});
	}

	/**
	 *	Sign in user in firebase and catch error
	 */
	$scope.signIn = function(input){
		firebase.auth().signInWithEmailAndPassword(input.email, input.password).then(function(user){
			firebase.database().ref('users/' + user.uid).once('value').then(function(snapshot){
				$mdToast.show(
			        $mdToast.simple()
			          .textContent('Welcome ' + snapshot.val().first_name + " " + snapshot.val().last_name)
			          .hideDelay(3000)
		        );
			});
		}).catch(function(error){
			var errorCode = error.code;
			var errorMessage = error.message;
			$mdToast.show(
		        $mdToast.simple()
		          .textContent('Error ' + errorCode + ": " + errorMessage)
		          .hideDelay(3000)
	        );
		});
	}

});