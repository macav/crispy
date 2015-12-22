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

  function loginConfig($stateProvider) {
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
  loginConfig.$inject = ['$stateProvider'];

  angular.module('crispy.auth')
  .config(loginConfig)
  .controller('LoginCtrl', LoginCtrl)
  .controller('LoginCallbackCtrl', LoginCallbackCtrl);
})();
