'use strict';

describe('Crispy auth module', function() {

  
  beforeEach(module('crispy.auth'));

  describe('AuthService', function(){

    var userData = {
      username: 'test1',
      password: 'testpass',
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEyMzQ1LCJlbWFpbCI6InRlc3QxIiwiaWF0IjoxNDUwNzEyMDQ3LCJleHAiOjE0NTEzMTY4NDd9.iakUF8_f7HXiOOvEKiBVsKPckyf6mlpJjcDcQ5zbCxg'
    };
    var authService, $httpBackend, socketMock, profileService;
    beforeEach(function() {
      socketMock = new sockMock({$apply: function() {}});
      module(function($provide) {
        $provide.value('mySocket', socketMock);
      });
    });
    beforeEach(inject(function(_ProfileService_, _AuthService_, _$httpBackend_) {
      authService = _AuthService_;
      profileService = _ProfileService_;
      $httpBackend = _$httpBackend_;
    }));
    afterEach(function() {
      authService.logout();
    });

    describe('Successful authentication', function() {
      beforeEach(function() {
        $httpBackend.expectPOST('/auth/local').respond({success: true, user: userData.username, userId: 1, token: userData.token});
        $httpBackend.whenGET('/api/users').respond([]);
        socketMock.clearEmits();
        authService.authenticate(userData.username, userData.password);
        $httpBackend.flush();
      });

      it('should emit login signal via socket', function() {
        expect(socketMock.emits['login'].length).toBe(1);
      });

      it('should emit login signal when reconnect is received', function() {
        socketMock.receive('reconnect', {});
        expect(socketMock.emits['login'].length).toBe(1);
      });

      it('should authenticate user', function() {
        expect(authService.isAuthenticated()).toBe(true);
      });

      it('should set user data', function() {
        expect(profileService.getUserData().email).toBe(userData.username);
      });

      it('should set authentication token', function() {
        expect(authService.getToken()).toBe('JWT ' + userData.token);
      });
    });

    describe('Unsuccessful authentication', function() {
      beforeEach(function() {
        $httpBackend.expectPOST('/auth/local').respond({success: false, message: 'User not found'});
        $httpBackend.whenGET('/api/users').respond([]);
        authService.authenticate(userData.username, userData.password);
        $httpBackend.flush();
      });

      it('should authenticate user', function() {
        expect(authService.isAuthenticated()).toBe(false);
      });

      it('should set user data', function() {
        expect(profileService.getUserData()).toBeUndefined();
      });

      it('should set authentication token', function() {
        expect(authService.getToken()).toBeUndefined();
      });
    });

    it('should refresh valid token', function() {
      $httpBackend.expectPOST('/auth/local').respond({success: true, user: userData.username, userId: 1, token: userData.token});
      authService.authenticate(userData.username, userData.password);
      var newToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEyMzQ1LCJlbWFpbCI6InRlc3QxIiwiaWF0IjoxNDUwNzEyMDg5LCJleHAiOjE0NTEzMTY4ODl9.ILy99GMTIX1JS7EmtZHnD5O980T-XQrErTXLJodWzOc';
      $httpBackend.expectPOST('/auth/refresh_token').respond({token: newToken});
      authService.refreshToken();
      $httpBackend.flush();
      expect(authService.getToken()).toBe('JWT '+newToken);
    });

    it('should not refresh expired token', function() {
      $httpBackend.expectPOST('/auth/local').respond({success: true, user: userData.username, userId: 1, token: userData.token});
      authService.authenticate(userData.username, userData.password);

      $httpBackend.expectPOST('/auth/refresh_token').respond(401, 'Token not valid');
      authService.refreshToken();
      $httpBackend.flush();
      expect(authService.getToken()).toBe('JWT ' + userData.token);
    });
  });
});
