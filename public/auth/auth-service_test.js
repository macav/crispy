'use strict';

describe('Freshy auth module', function() {

  beforeEach(module('ui.router'));
  beforeEach(module('ngCookies'));
  beforeEach(module('freshy'));
  beforeEach(module('freshy.auth'));

  describe('AuthService', function(){

    var userData = {
      username: 'test1',
      password: 'testpass',
      token: 'adsf'
    };
    var authService, $httpBackend;
    beforeEach(inject(function(_AuthService_, _$httpBackend_) {
      authService = _AuthService_;
      $httpBackend = _$httpBackend_;
    }));

    describe('Successful authentication', function() {
      beforeEach(function() {
        $httpBackend.expectPOST('/auth/local').respond({success: true, user: userData.username, userId: 1, token: userData.token});
        authService.authenticate(userData.username, userData.password);
        $httpBackend.flush();
      });

      it('should authenticate user', function() {
        expect(authService.isAuthenticated()).toBe(true);
      });

      it('should set user data', function() {
        expect(authService.getUserData().email).toBe(userData.username);
      });

      it('should set authentication token', function() {
        expect(authService.getToken()).toBe('JWT ' + userData.token);
      });
    });

    describe('Unsuccessful authentication', function() {
      beforeEach(function() {
        $httpBackend.expectPOST('/auth/local').respond({success: false, message: 'User not found'});
        authService.authenticate(userData.username, userData.password);
        $httpBackend.flush();
      });

      it('should authenticate user', function() {
        expect(authService.isAuthenticated()).toBe(false);
      });

      it('should set user data', function() {
        expect(authService.getUserData()).toBeUndefined();
      });

      it('should set authentication token', function() {
        expect(authService.getToken()).toBeUndefined();
      });
    });

    it('should refresh valid token', function() {
      $httpBackend.expectPOST('/auth/local').respond({success: true, user: userData.username, userId: 1, token: userData.token});
      authService.authenticate(userData.username, userData.password);
      $httpBackend.expectPOST('/auth/refresh_token').respond({token: 'newToken'});
      authService.refreshToken();
      $httpBackend.flush();
      expect(authService.getToken()).toBe('JWT newToken');
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