(function() {
  'use strict';

  function RegisterCtrl($state, AuthService) {
    var vm = this;
    vm.data = {gender: 0};
    vm.registerUser = function() {
      if (vm.data.password && vm.data.password !== vm.data.password2) {
        vm.message = 'Passwords do not match';
        return;
      }
      AuthService.register(vm.data).then(function(result) {
        if (result.status === 201) {
          $state.go('login');
        } else {
          vm.message = result.data.message;
        }
      }, function(err) {
        vm.message = err.data.message || err.data;
      });
    };
  }
  RegisterCtrl.$inject = ['$state', 'AuthService'];

  function registerConfig($stateProvider) {
    $stateProvider
      .state('register', {
        url: '/register',
        templateUrl: 'auth/register.html',
        controller: 'RegisterCtrl',
        controllerAs: 'vm'
      });
  }
  registerConfig.$inject = ['$stateProvider'];

  angular.module('crispy.auth')
  .config(registerConfig)
  .controller('RegisterCtrl', RegisterCtrl);
})();
