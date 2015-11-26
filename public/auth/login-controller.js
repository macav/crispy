(function() {
  'use strict';

  function LoginCtrl($scope, $cookies, $state, mySocket, AuthService) {
    $scope.login = {};
    $scope.loginUser = function() {
      AuthService.authenticate($scope.login.username, $scope.login.password).then(function(result) {
        if (AuthService.isAuthenticated()) {
          $state.go('main');
        } else {
          $scope.message = result.data.message;
        }
      }, function(err) {
        $scope.message = err.data;
      });
    };
  };
  LoginCtrl.$inject = ['$scope', '$cookies', '$state', 'mySocket', 'AuthService'];

  function LoginCallbackCtrl($scope, $state, $window, AuthService, $location) {
    var search = $location.search();
    if (search.token) {
      AuthService.authenticateToken(search.token);
      $state.go('main');
    } else {
      $state.go('login');
    }
  };
  LoginCallbackCtrl.$inject = ['$scope', '$state', '$window', 'AuthService', '$location'];

  function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');
    $urlRouterProvider.when('/login', ['$state', '$window', function($state, $window) {
      if ($window.localStorage.accessToken) {
        $state.go('main');
      } else {
        return false;
      }
    }]);
    $urlRouterProvider.rule(function($injector, $location) {
      var $window = $injector.get('$window');
      var $state = $injector.get('$state');
      if (!$window.localStorage.accessToken && ['/login', '/login/callback'].indexOf($location.path()) === -1) {
        return $state.get('login').url;
      }
    });

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'auth/login.html',
        controller: 'LoginCtrl'
      })
      .state('login-callback', {
        url: '/login/callback',
        controller: 'LoginCallbackCtrl'
      });
  };
  config.$inject = ['$stateProvider', '$urlRouterProvider'];

  function AuthModuleInit($window, AuthService) {
    if ($window.localStorage.accessToken) {
      AuthService.authenticateToken($window.localStorage.accessToken);
    }
  }
  AuthModuleInit.$inject = ['$window', 'AuthService'];

  angular.module('freshy.auth')
  .config(config)
  .controller('LoginCtrl', LoginCtrl)
  .controller('LoginCallbackCtrl', LoginCallbackCtrl)
  .run(AuthModuleInit);
})();