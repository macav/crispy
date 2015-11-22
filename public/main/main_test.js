'use strict';

describe('Freshy main module', function() {

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
  beforeEach(module('ngAria'));
  beforeEach(module('ngAnimate'));
  beforeEach(module('ngMaterial'));
  beforeEach(module('freshy'));
  beforeEach(module('freshy.main'));
  beforeEach(module('freshy.auth'));

  var scope, ctrl, socketMock, $httpBackend;
  var username = 'user1';

  beforeEach(inject(function($controller, $rootScope, _$httpBackend_) {
    scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET("auth/login.html").respond({});
    $httpBackend.whenGET("main/main.html").respond({});
    socketMock = new sockMock($rootScope);
    ctrl = $controller('MainCtrl', {$scope: scope, mySocket: socketMock});
  }));

  describe('Main controller', function(){

    it ('should have defined controller', function() {
      expect(ctrl).toBeDefined();
    });

    it ('should have a list of users defined', function() {
      expect(scope.users).toBeDefined();
    });

    it('should have non-empty list of users', function() {
      expect(scope.users.length).toBe(3);
    });

    it('should emit login signal via socket', function() {
      expect(socketMock.emits['login'].length).toBe(1);
    });

    it('should emit login signal when reconnect is received', function() {
      socketMock.receive('reconnect', {});
      expect(socketMock.emits['login'].length).toBe(2);
    });

    it ('should add message to the list on socket receive', function() {
      var msgData = {username: username, message: 'test msg'};
      expect(scope.messages.length).toBe(0);
      socketMock.receive('received', msgData);
      expect(scope.messages.length).toBe(1);
      expect(scope.messages[0]).toEqualData(msgData);
    });

    it('should emit new message', function() {
      scope.message = 'ahojky';
      scope.send();
      expect(socketMock.emits['message'].length).toBe(1);
      expect(scope.message).toBe('');
      expect(scope.messages.length).toBe(1);
    });

    describe('should handle partial message when letter is received', function() {
      var msgData = {username: username, message: 'test msg'};
      beforeEach(function() {
        socketMock.receive('received', msgData);
      });

      it('should add partial message', function() {
        msgData = {username: username, message: 'te'};
        socketMock.receive('letterreceived', msgData);
        expect(scope.messages.length).toBe(2);
        expect(scope.messages[1]).toEqualData(msgData);
      });

      it('should update partial message when another letter is received', function() {
        msgData = {username: username, message: 'te'};
        socketMock.receive('letterreceived', msgData);
        expect(scope.messages.length).toBe(2);
        expect(scope.messages[1].message).toBe('te');
        socketMock.receive('letterreceived', {username: username, message: 'testik'});
        expect(scope.messages.length).toBe(2);
        expect(scope.messages[1].message).toBe('testik');
      });

      it('should remove partial message when empty letter signal is received', function() {
        msgData = {username: username, message: 'te'};
        socketMock.receive('letterreceived', msgData);
        expect(scope.messages.length).toBe(2);
        expect(scope.messages[1].message).toBe('te');
        socketMock.receive('letterreceived', {username: username, message: ''});
        expect(scope.messages.length).toBe(1);
      });

      it('should add two partial messages for two different users', function() {
        socketMock.receive('letterreceived', {username: username, message: 'm1'});
        expect(scope.messages.length).toBe(2);
        expect(scope.messages[1].message).toBe('m1');
        socketMock.receive('letterreceived', {username: 'test2', message: 'm2'});
        expect(scope.messages.length).toBe(3);
        expect(scope.messages[2].message).toBe('m2');
      });
    });

  });
});