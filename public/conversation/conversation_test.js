'use strict';

describe('Crispy conversation module', function() {

  beforeEach(function(){
    jasmine.addMatchers({
      toEqualData: function(util, customEqualityTesters) {
        return {
          compare: function(actual, expected) {
            return {
              pass: angular.equals(actual, expected)
            };
          }
        };
      }
    });
  });
  beforeEach(module('crispy.main'));

  var scope, socketMock, ctrl, $httpBackend;
  var username = 'user1';
  var usersData = [
    {_id: 1, email: 'user1'},
    {_id: 2, email: 'user2'},
    {_id: 3, email: 'user3'}
  ];

  describe('conversation controller', function(){

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      scope = $rootScope.$new();
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('conversation/conversation.html').respond({});
      $httpBackend.whenGET('conversation/message-notification-template.html').respond({});
      socketMock = new sockMock($rootScope);
      ctrl = $controller('ConversationCtrl', {$scope: scope, users: {data: usersData, status: 200}, messages: {data: [], status: 200}, mySocket: socketMock, $stateParams: {user: usersData[1]._id}});
    }));

    it('should have controller defined', function() {
      expect(ctrl).toBeDefined();
    });

    it('should set active user based on id in param', function() {
      expect(ctrl.activeUser).toBe(usersData[1]);
    });

    describe('on message received via socket', function() {
      it ('should add message from active user to the list', function() {
        var msgData = {user: usersData[1], message: 'test msg'};
        expect(ctrl.messages.length).toBe(0);
        socketMock.receive('received', msgData);
        expect(ctrl.messages.length).toBe(1);
        expect(ctrl.messages[0]).toEqualData(msgData);
      });

      it('should not add message from inactive user to the list', function() {
        var msgData = {user: usersData[2], message: 'test msg'};
        expect(ctrl.messages.length).toBe(0);
        socketMock.receive('received', msgData);
        expect(ctrl.messages.length).toBe(0);
      });
    });

    it('should emit new message', function() {
      var msg = 'test message';
      ctrl.message = msg;
      ctrl.send();
      $httpBackend.expectPOST('/api/messages').respond({data: {user: usersData[0], message: msg}});
      $httpBackend.flush();
      expect(ctrl.message).toBe('');
      expect(ctrl.messages.length).toBe(1);
    });

    describe('should handle partial message when letter is received', function() {
      var msgData = {user: usersData[1], message: 'test msg'};
      beforeEach(function() {
        socketMock.receive('received', msgData);
      });

      it('should add partial message', function() {
        msgData = {user: usersData[1], message: 'te'};
        socketMock.receive('letterreceived', msgData);
        expect(ctrl.messages.length).toBe(2);
        expect(ctrl.messages[1]).toEqualData(msgData);
      });

      it('should update partial message when another letter is received', function() {
        msgData = {user: usersData[1], message: 'te'};
        socketMock.receive('letterreceived', msgData);
        expect(ctrl.messages.length).toBe(2);
        expect(ctrl.messages[1].message).toBe('te');
        socketMock.receive('letterreceived', {user: usersData[1], message: 'testik'});
        expect(ctrl.messages.length).toBe(2);
        expect(ctrl.messages[1].message).toBe('testik');
      });

      it('should remove partial message when empty letter signal is received', function() {
        msgData = {user: usersData[1], message: 'te'};
        socketMock.receive('letterreceived', msgData);
        expect(ctrl.messages.length).toBe(2);
        expect(ctrl.messages[1].message).toBe('te');
        socketMock.receive('letterreceived', {user: usersData[1], message: ''});
        expect(ctrl.messages.length).toBe(1);
      });

      it('should not add partial message for inactive user', function() {
        socketMock.receive('letterreceived', {user: usersData[1], message: 'm1'});
        expect(ctrl.messages.length).toBe(2);
        expect(ctrl.messages[1].message).toBe('m1');
        socketMock.receive('letterreceived', {user: usersData[2], message: 'm2'});
        expect(ctrl.messages.length).toBe(2);
      });
    });

  });
});
