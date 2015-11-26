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
  $stateProvider
    .state('main', {
      url: "/main",
      templateUrl: "main/main.html",
      controller: 'MainCtrl',
      controllerAs: 'vm'
    })
    .state('register', {
      url: "/register",
      templateUrl: "auth/register.html"
    })
}]).
controller('AppCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
}]);
