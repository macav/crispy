(function() {
  'use strict';

  function ProfileCtrl($state, $stateParams, ProfileService, $mdToast) {
    var vm = this;
    vm.data = ProfileService.getUserData();

    vm.save = function() {
      if (vm.data.password && vm.data.password !== vm.data.password2) {
        vm.message = 'Passwords do not match';
        return;
      }
      ProfileService.update(vm.data).then(function(result) {
        if (result.status === 200) {
          $mdToast.show($mdToast.simple().textContent('Changes were saved.').position('bottom right'));
          ProfileService.set('first_name', result.data.first_name);
          ProfileService.set('last_name', result.data.last_name);
          ProfileService.set('name', result.data.first_name + ' ' + result.data.last_name);
        } else {
          vm.message = result.data.message;
        }
      }, function(err) {
        vm.message = err.data.message || err.data;
      });
    };
  }
  ProfileCtrl.$inject = ['$state', '$stateParams', 'ProfileService', '$mdToast'];

  function ProfileConfig($stateProvider) {
    $stateProvider.state('main.profile', {
      url: '/profile',
      templateUrl: 'main/profile.html',
      controller: 'ProfileCtrl',
      controllerAs: 'profile'
    });
  }
  ProfileConfig.$inject = ['$stateProvider'];

  angular.module('crispy.main')
  .controller('ProfileCtrl', ProfileCtrl)
  .config(ProfileConfig);
})();
