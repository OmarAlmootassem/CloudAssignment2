'use strict';

angular.module('myApp.view_home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'view_home/view_home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', function() {

});