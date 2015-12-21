(function() {
  'use strict';

  function appConfig($stateProvider, $urlRouterProvider, $mdThemingProvider) {
    $stateProvider
      .state('register', {
        url: "/register",
        templateUrl: "auth/register.html"
      });
      $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('blue');
  }
  appConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$mdThemingProvider'];

  angular.module('crispy', [
    'crispy.main',
    'crispy.auth',
    'ngCookies',
    'ui.router',
    'btford.socket-io'
  ]).
  config(appConfig);
})();
