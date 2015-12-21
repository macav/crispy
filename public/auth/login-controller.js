(function() {
  'use strict';

  function LoginCtrl($scope, $cookies, $state, mySocket, AuthService, globalData) {
    $scope.login = {};
    $scope.loginUser = function() {
      AuthService.authenticate($scope.login.username, $scope.login.password).then(function(result) {
        if (AuthService.isAuthenticated()) {
          globalData.users = result.data.users;
          $state.go('main.conversation');
        } else {
          $scope.message = result.data.message;
        }
      }, function(err) {
        $scope.message = err.data;
      });
    };
  }
  LoginCtrl.$inject = ['$scope', '$cookies', '$state', 'mySocket', 'AuthService', 'globalData'];

  function LoginCallbackCtrl($scope, $state, $window, AuthService, $location, globalData) {
    var search = $location.search();
    if (search.token) {
      AuthService.authenticateToken(search.token);
      AuthService.getActiveUsers().then(function(response) {
        globalData.users = response.data;
        $state.go('main.conversation');
      });
    } else {
      $state.go('login');
    }
  }
  LoginCallbackCtrl.$inject = ['$scope', '$state', '$window', 'AuthService', '$location', 'globalData'];

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
  }
  config.$inject = ['$stateProvider', '$urlRouterProvider'];

  function AuthModuleInit($window, AuthService, globalData) {
    if ($window.localStorage.accessToken) {
      AuthService.authenticateToken($window.localStorage.accessToken);
    }
  }
  AuthModuleInit.$inject = ['$window', 'AuthService', 'globalData'];

  angular.module('crispy.auth')
  .config(config)
  .controller('LoginCtrl', LoginCtrl)
  .controller('LoginCallbackCtrl', LoginCallbackCtrl)
  .run(AuthModuleInit);
})();
