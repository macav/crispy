'use strict';

// Declare app level module which depends on views, and components
angular.module('freshy', [
  'freshy.main',
  'freshy.conversation',
  'freshy.auth',
  'myApp.version',
  'ngCookies',
  'ui.router',
  'btford.socket-io'
]).
config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/login");
  $urlRouterProvider.when('/login', ['$state', '$cookies', function($state, $cookies) {
    if ($cookies.get('freshyToken')) {
      $state.go('main');
    } else {
      return false;
    }
  }]);
  $urlRouterProvider.when(/(?!\/login).+/, ['$state', '$cookies', function($state, $cookies) {
    if (!$cookies.get('freshyToken')) {
      $state.go('login');
    } else {
      return false;
    }
  }]);

  $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: "auth/login.html",
      controller: 'LoginCtrl'
    })
    .state('main', {
      url: "/main",
      templateUrl: "main/main.html",
      controller: 'MainCtrl'
    })
    .state('register', {
      url: "/register",
      templateUrl: "auth/register.html"
    })
}]).
factory('mySocket', ['socketFactory', function(socketFactory) {
  return socketFactory();
}]).
controller('AppCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
}]);
