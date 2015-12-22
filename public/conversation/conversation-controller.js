(function() {
  'use strict';

  function MessageNotificationCtrl($mdToast, message) {
    this.message = message;
    this.closeToast = function() {
      $mdToast.hide('closed');
    };
    this.goToMessage = function() {
      $mdToast.hide('goto');
    };
  }
  MessageNotificationCtrl.$inject = ['$mdToast', 'message'];

  function ConversationCtrl($scope, users, messages, $state, $stateParams, $mdSidenav, mySocket, MessageService, $mdToast, ngAudio, $mdDialog, $mdMedia) {
    var vm = this;
    vm.messages = messages.data;

    vm.activeUser = _.findWhere(users.data, {_id: $stateParams.user});

    this.send = function() {
      MessageService.post({
        message: vm.message,
        recipient: vm.activeUser._id
      }).then(function(response) {
        vm.messages.push(response.data);
      });
      vm.message = '';
    };
    this.sendLetter = function() {
      mySocket.emit('letter', {
        message: vm.message,
        recipient: vm.activeUser._id
      });
    };
    var activeMessage = {};
    mySocket.on('letterreceived', function(data) {
      // if the letter is not from my active user, we don't care
      if (!vm.activeUser || data.user._id !== vm.activeUser._id) {
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
      if (!vm.activeUser || (vm.activeUser && data.user._id !== vm.activeUser._id)) {
        var user = _.findWhere(users.data, {_id: data.user._id});
        if (user) {
          user.unread = angular.isDefined(user.unread) ? user.unread + 1 : 1;
          $mdToast.show({
            controller: 'ToastCtrl',
            templateUrl: 'conversation/message-notification-template.html',
            hideDelay: 3000,
            resolve: {
              message: function() {
                return data.user.first_name + ' ' + data.user.last_name + ': ' + data.message;
              }
            },
            controllerAs: 'vm',
            position: 'bottom right'
          }).then(function(response) {
            if (response === 'goto') {
              delete user.unread;
              $state.go('main.conversation', {user: user._id});
            }
          });
        }
      }
      if (!vm.activeUser || data.user._id !== vm.activeUser._id) {
        return;
      }
      if (angular.isDefined(activeMessage[data.user._id])) {
        vm.messages.splice(activeMessage[data.user._id], 1);
        delete activeMessage[data.user._id];
      }
      vm.messages.push(data);
    });

    $scope.$on('$destroy', function() {
      mySocket.removeListener('received');
      mySocket.removeListener('letterreceived');
    });
  }
  ConversationCtrl.$inject = ['$scope', 'users', 'messages', '$state', '$stateParams', '$mdSidenav', 'mySocket', 'MessageService',  '$mdToast', 'ngAudio', '$mdDialog', '$mdMedia'];
  ConversationCtrl.resolve = {
    messages: ['MessageService', '$stateParams', function(MessageService, $stateParams) {
      return $stateParams.user ? MessageService.query({user: $stateParams.user}) : {};
    }]
  };

  function ConversationConfig($stateProvider) {
    $stateProvider.state('main.conversation', {
      url: '/conversation/:user',
      templateUrl: 'conversation/conversation.html',
      controller: 'ConversationCtrl',
      controllerAs: 'msg',
      resolve: ConversationCtrl.resolve
    });
  }
  ConversationConfig.$inject = ['$stateProvider'];

  angular.module('crispy.main')
  .controller('ConversationCtrl', ConversationCtrl)
  .config(ConversationConfig)
  .controller('ToastCtrl', MessageNotificationCtrl);
})();
