(function() {
  'use strict';

  function MainCtrl($state, $mdSidenav, mySocket, AuthService, MessageService) {
    this.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };
    this.logout = function() {
      AuthService.logout();
      $state.go('login');
    };
    var vm = this;
    MessageService.query().then(function(data) {
      vm.messages = data.data;
    });
    this.send = function() {
      MessageService.post({message: vm.message}).then(function(response) {
        vm.messages.push(response.data);
      });
      vm.message = '';
    };
    this.sendLetter = function() {
      mySocket.emit('letter', vm.message);
    };
    var activeMessage = {};
    mySocket.on('letterreceived', function(data) {
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
      if (data.user._id == AuthService.getUserData().id) {
        return;
      }
      console.log('Message received', activeMessage, data);
      if (angular.isDefined(activeMessage[data.user._id])) {
        vm.messages.splice(activeMessage[data.user._id], 1);
        delete activeMessage[data.user._id];
      }
      vm.messages.push(data);
    });
  }
  MainCtrl.$inject = ['$state', '$mdSidenav', 'mySocket', 'AuthService', 'MessageService'];

  angular.module('freshy.main', ['ngMaterial'])
  .controller('MainCtrl', MainCtrl)


  .controller('MainCtrl2', ['$scope', '$mdSidenav', 'mySocket', '$cookies', '$state', 'AuthService', function($scope, $mdSidenav, mySocket, $cookies, $state, AuthService) {
      $scope.messages = [];
      $scope.users = [
        {id: 1, username: 'macav'},
        {id: 2, username: 'niky'},
        {id: 3, username: 'emma'}
      ];
      mySocket.emit('login', $cookies.get('freshyToken'));
      $scope.toggleSidenav = function(menuId) {
          $mdSidenav(menuId).toggle();
      };
      $scope.send = function() {
        mySocket.emit('message', $scope.message);
        $scope.messages.push({time: new Date(), username: $cookies.get('freshyToken'), message: $scope.message});
        $scope.message = '';
      };
      $scope.sendLetter = function() {
        mySocket.emit('letter', $scope.message);
      };
      var activeMessage = {};
      mySocket.on('letterreceived', function(data) {
        if (angular.isUndefined(activeMessage[data.username])) {
          activeMessage[data.username] = $scope.messages.push(data)-1;
        } else {
          if (!data.message) {
            $scope.messages.splice(activeMessage[data.username], 1);
            delete activeMessage[data.username];
          } else {
            $scope.messages[activeMessage[data.username]].message = data.message;
          }
        }
      });
      $scope.logout = function() {
        AuthService.logout();
        $state.go('login');
      };
      mySocket.on('reconnect', function() {
        mySocket.emit('login', $cookies.get('freshyToken'));
      });
      mySocket.on('received', function(data) {
        if (angular.isDefined(activeMessage[data.username])) {
          $scope.messages.splice(activeMessage[data.username], 1);
          delete activeMessage[data.username];
        }
        $scope.messages.push(data);
      });
  }]);
})();