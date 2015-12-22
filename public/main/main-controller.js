(function() {
  'use strict';

  function StatusDialogController(status, $mdDialog) {
    this.status = status;
    this.cancel = function() {
      $mdDialog.cancel();
    };
    this.ok = function() {
      $mdDialog.hide(this.status);
    };
  }
  StatusDialogController.$inject = ['status', '$mdDialog'];

  function MainCtrl(users, $state, $stateParams, $mdSidenav, mySocket, AuthService, MessageService, $timeout, $mdToast, ngAudio, $mdDialog, $mdMedia, ProfileService) {
    this.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };
    this.logout = function() {
      AuthService.logout();
      $state.go('login');
    };
    var vm = this;
    vm.isSelected = function(user) {
      return user._id === $state.params.user;
    };

    vm.selectUser = function(user) {
      delete user.unread;
      $timeout(function() {
        $mdSidenav('left').close();
      });
      $state.go('main.conversation', {user: user._id});
    };

    vm.users = users.data;

    vm.userData = ProfileService.getUserData();
    mySocket.on('userLogin', function(data) {
      if (!_.findWhere(vm.users, {_id: data._id})) {
          vm.users.push(data);
      }
    });
    mySocket.on('userLogout', function(data) {
      var idx = vm.users.indexOf(_.findWhere(vm.users, {_id: data._id}));
      if (idx !== -1) {
        vm.users.splice(idx, 1);
      }
    });
    mySocket.on('statusUpdate', function(data) {
      var user = _.findWhere(vm.users, {_id: data.user._id});
      if (user) {
        user.status = data.status;
      }
    });
    mySocket.on('forceLogout', function() {
      $mdToast.show($mdToast.simple().textContent('You logged in from other device.').position('bottom right'));
      vm.logout();
    });

    vm.setStatus = function(evt) {
      var promise = $mdDialog.show({
        controller: StatusDialogController,
        controllerAs: 'vm',
        templateUrl: 'main/status-template.html',
        parent: angular.element(document.body),
        targetEvent: evt,
        clickOutsideToClose: true,
        resolve: {
          status: function() {
            return vm.userData.status;
          }
        },
        openFrom: '#status'
      });
      promise.then(function(status) {
        ProfileService.setStatus(status).then(function(response) {
          vm.userData.status = status;
          ProfileService.set('status', status);
        });
      });
      return promise;
    };
  }
  MainCtrl.$inject = ['users', '$state', '$stateParams', '$mdSidenav', 'mySocket', 'AuthService', 'MessageService', '$timeout', '$mdToast', 'ngAudio', '$mdDialog', '$mdMedia', 'ProfileService'];
  MainCtrl.resolve = {
    users: ['AuthService', function(AuthService) {
      return AuthService.getActiveUsers();
    }]
  };

  function MainConfig($stateProvider) {
    $stateProvider.state('main', {
      abstract: true,
      templateUrl: 'main/main.html',
      controller: 'MainCtrl',
      controllerAs: 'main',
      resolve: MainCtrl.resolve
    });
  }
  MainConfig.$inject = ['$stateProvider'];

  angular.module('crispy.main')
  .controller('MainCtrl', MainCtrl)
  .config(MainConfig);
})();
