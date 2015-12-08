(function() {
  'use strict';

  function MainCtrl($state, $mdSidenav, mySocket, AuthService, MessageService, globalData, $timeout) {
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
      MessageService.query({user: user._id}).then(function(data) {
        vm.messages = data.data;
      });
      $timeout(function() {
        $mdSidenav('left').close();
      });
    };

    vm.users = globalData.users;
    console.log(globalData.users);
    if (vm.users.length) {
      vm.selectUser(vm.users[0]);
    }

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
      } else {
        if (!data.message) {
          vm.messages.splice(activeMessage[data.user._id], 1);
          delete activeMessage[data.user._id];
        } else {
          vm.messages[activeMessage[data.user._id]].message = data.message;
        }
      }
    });
    mySocket.on('received', function(data) {
      if (!activeUser || data.user._id !== activeUser._id || data.user._id == AuthService.getUserData().id) {
        return;
      }
      if (angular.isDefined(activeMessage[data.user._id])) {
        vm.messages.splice(activeMessage[data.user._id], 1);
        delete activeMessage[data.user._id];
      }
      vm.messages.push(data);
    });
  }
  MainCtrl.$inject = ['$state', '$mdSidenav', 'mySocket', 'AuthService', 'MessageService', 'globalData', '$timeout'];

  angular.module('freshy.main', ['ngMaterial'])
  .controller('MainCtrl', MainCtrl);
})();
