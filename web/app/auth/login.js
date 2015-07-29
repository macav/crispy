'use strict';

angular.module('freshy.auth', [])

.controller('LoginCtrl', ['$scope', '$cookies', '$state', 'mySocket', function($scope, $cookies, $state, mySocket) {
    $scope.login = {};
    $scope.loginUser = function() {
      if (['macav', 'niky'].indexOf($scope.login.username) !== -1 && $scope.login.password === 'pass') {
        $cookies.put('freshyToken', $scope.login.username);
        $state.go('main');
      } else {
        $cookies.remove('freshyToken');
        $scope.login = {};
      }
    };
}]);