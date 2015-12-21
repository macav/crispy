'use strict';

describe('Crispy main module', function() {

  beforeEach(module('ngAria'));
  beforeEach(module('ngAnimate'));
  beforeEach(module('ngMaterial'));
  beforeEach(module('crispy'));
  beforeEach(module('crispy.main'));
  beforeEach(module('crispy.auth'));

  var scope, ctrl, socketMock, $httpBackend;
  var usersData = [
    {_id: 1, email: 'user1'},
    {_id: 2, email: 'user2'},
    {_id: 3, email: 'user3'}
  ];

  beforeEach(inject(function($controller, $rootScope, _$httpBackend_) {
    scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET("auth/login.html").respond({});
    $httpBackend.whenGET("main/main.html").respond({});
    $httpBackend.whenGET('/api/users').respond(usersData);
    $httpBackend.whenGET('/api/messages?user=1').respond([]);
    socketMock = new sockMock($rootScope);
    ctrl = $controller('MainCtrl', {$scope: scope, mySocket: socketMock, users: {data: usersData, status: 200}});
  }));

  describe('Main controller', function(){

    it ('should have defined controller', function() {
      expect(ctrl).toBeDefined();
    });

    it ('should have a list of users defined', function() {
      expect(ctrl.users).toBeDefined();
    });

    it('should have non-empty list of users', function() {
      expect(ctrl.users.length).toBe(3);
    });

    it('should set add logged in user to the list', function() {
      socketMock.receive('userLogin', {_id: 4, email: 'user4'});
      expect(ctrl.users.length).toBe(4);
    });

    it('should remove user from the list if he logs out', function() {
      socketMock.receive('userLogout', {_id: 4, email: 'user4'});
      expect(ctrl.users.length).toBe(3);
    });

    it("should not add user if he's already in the list", function() {
      socketMock.receive('userLogin', usersData[2]);
      expect(ctrl.users.length).toBe(3);
    });

  });
});
