(function() {
  'use strict';

  function appConfig($mdThemingProvider) {
      $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('blue');
  }
  appConfig.$inject = ['$mdThemingProvider'];

  angular.module('crispy', [
    'crispy.main',
    'crispy.auth',
    'ngCookies',
    'ui.router',
    'btford.socket-io'
  ]).
  config(appConfig);
})();
