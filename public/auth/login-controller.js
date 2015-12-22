(function() {
  'use strict';

  function LoginCtrl($scope, $state, AuthService) {
    $scope.login = {};
    $scope.loginUser = function() {
      AuthService.authenticate($scope.login.username, $scope.login.password).then(function(result) {
        if (AuthService.isAuthenticated()) {
          $state.go('main.conversation');
        } else {
          $scope.message = result.data.message;
        }
      }, function(err) {
        $scope.message = err.data;
      });
    };
  }
  LoginCtrl.$inject = ['$scope', '$state', 'AuthService'];

  function LoginCallbackCtrl($state, AuthService, $location) {
    var search = $location.search();
    if (search.token) {
      AuthService.authenticateToken(search.token);
      $state.go('main.conversation');
    } else {
      $state.go('login');
    }
  }
  LoginCallbackCtrl.$inject = ['$state', 'AuthService', '$location'];

  function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');
    $urlRouterProvider.when('/login', ['$state', '$window', function($state, $window) {
      if ($window.localStorage.accessToken) {
        $state.go('main.conversation');
      } else {
        return false;
      }
    }]);
    $urlRouterProvider.rule(function($injector, $location) {
      var $window = $injector.get('$window');
      var $state = $injector.get('$state');
      if (!$window.localStorage.accessToken && ['/login', '/login/callback', '/register'].indexOf($location.path()) === -1) {
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
  }
  config.$inject = ['$stateProvider', '$urlRouterProvider'];

  function AuthModuleInit($window, AuthService) {
    if ($window.localStorage.accessToken) {
      AuthService.authenticateToken($window.localStorage.accessToken);
    }
  }
  AuthModuleInit.$inject = ['$window', 'AuthService'];

  angular.module('crispy.auth')
  .config(config)
  .controller('LoginCtrl', LoginCtrl)
  .controller('LoginCallbackCtrl', LoginCallbackCtrl)
  .run(AuthModuleInit);
})();
