(function() {
  'use strict';

  function DialogController($scope, status, $mdDialog) {
    $scope.status = status;
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.ok = function() {
      $mdDialog.hide($scope.status);
    };
  }
  DialogController.$inject = ['$scope', 'status', '$mdDialog'];

  function MainCtrl($state, $mdSidenav, mySocket, AuthService, MessageService, globalData, $timeout, $mdToast, ngAudio, $mdDialog, $mdMedia) {
    this.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };
    this.logout = function() {
      AuthService.logout();
      $state.go('login');
    };
    var vm = this;
    var activeUser = null;
    vm.isSelected = function(user) {
      return activeUser !== null && activeUser._id === user._id;
    };
    vm.selectUser = function(user) {
      activeUser = user;
      delete user.unread;
      MessageService.query({user: user._id}).then(function(data) {
        vm.messages = data.data;
      });
      $timeout(function() {
        $mdSidenav('left').close();
      });
    };

    vm.users = globalData.users;
    if (vm.users.length) {
      vm.selectUser(vm.users[0]);
    }

    vm.userStatus = 'Som super';
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
    this.send = function() {
      MessageService.post({
        message: vm.message,
        recipient: activeUser._id
      }).then(function(response) {
        vm.messages.push(response.data);
      });
      vm.message = '';
    };
    this.sendLetter = function() {
      mySocket.emit('letter', {
        message: vm.message,
        recipient: activeUser._id
      });
    };
    var activeMessage = {};
    mySocket.on('letterreceived', function(data) {
      // if the letter is not from my active user, we don't care
      if (!activeUser || data.user._id !== activeUser._id) {
        return;
      }
      if (angular.isUndefined(activeMessage[data.user._id])) {
        activeMessage[data.user._id] = vm.messages.push(data)-1;
        vm.messages[activeMessage[data.user._id]].typing = true;
      } else {
        if (!data.message) {
          vm.messages.splice(activeMessage[data.user._id], 1);
          delete activeMessage[data.user._id];
        } else {
          vm.messages[activeMessage[data.user._id]].message = data.message;
          vm.messages[activeMessage[data.user._id]].typing = true;
        }
      }
    });
    mySocket.on('received', function(data) {
      ngAudio.play("assets/sounds/incoming.mp3");
      if (activeUser && data.user._id !== activeUser._id) {
        var user = _.findWhere(vm.users, {_id: data.user._id});
        if (user) {
          user.unread = angular.isDefined(user.unread) ? user.unread + 1 : 1;
          $mdToast.show({
            controller: 'ToastCtrl',
            templateUrl: 'main/message-notification-template.html',
            hideDelay: 3000,
            resolve: {
              message: function() {
                return data.user.email + ': ' + data.message;
              }
            },
            controllerAs: 'vm',
            position: 'bottom right'
          }).then(function(response) {
            if (response === 'goto') {
              vm.selectUser(user);
            }
          });
        }
      }
      if (!activeUser || data.user._id !== activeUser._id) {
        return;
      }
      if (angular.isDefined(activeMessage[data.user._id])) {
        vm.messages.splice(activeMessage[data.user._id], 1);
        delete activeMessage[data.user._id];
      }
      vm.messages.push(data);
    });

    vm.setStatus = function(evt) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'main/status-template.html',
        parent: angular.element(document.body),
        targetEvent: evt,
        clickOutsideToClose: true,
        resolve: {
          status: function() {
            return vm.userStatus;
          }
        },
        openFrom: '#status'
      })
      .then(function(status) {
        vm.userStatus = status;
      });
      // $mdDialog.show(
      //   $mdDialog.alert()
      //     .clickOutsideToClose(true)
      //     .title('This is an alert title')
      //     .textContent('You can specify some description text in here.')
      //     .ariaLabel('Alert Dialog Demo')
      //     .ok('Got it!')
      //     .targetEvent(evt)
      // );
    };
  }
  MainCtrl.$inject = ['$state', '$mdSidenav', 'mySocket', 'AuthService', 'MessageService', 'globalData', '$timeout', '$mdToast', 'ngAudio', '$mdDialog', '$mdMedia'];

  angular.module('freshy.main', ['ngMaterial', 'ngAudio'])
  .controller('MainCtrl', MainCtrl)
  .controller('ToastCtrl', ['$mdToast', 'message', function($mdToast, message) {
    this.message = message;
    this.closeToast = function() {
      $mdToast.hide('closed');
    }
    this.goToMessage = function() {
      $mdToast.hide('goto');
    }
  }]);
})();
