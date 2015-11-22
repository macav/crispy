'use strict';

describe('Freshy auth module', function() {

  beforeEach(module('ui.router'));
  beforeEach(module('ngCookies'));
  beforeEach(module('freshy'));
  beforeEach(module('freshy.auth'));
  var $httpBackend;
  var scope;

  describe('Login controller', function(){

    var userData = {
      username: 'test1',
      password: 'testpass'
    };
    var scope, ctrl;
    beforeEach(inject(function($controller, $rootScope, _$httpBackend_) {
      scope = $rootScope.$new();
      ctrl = $controller('LoginCtrl', {$scope: scope});
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('auth/login.html').respond({});
      $httpBackend.whenGET('main/main.html').respond({});
    }));

    it('should have controller defined', inject(function($controller, $rootScope) {
      expect(ctrl).toBeDefined();
    }));

    it('should display error message when user credentials are incorrect', inject(function($state) {
      scope.login = userData;
      scope.loginUser();
      $httpBackend.expectPOST('/auth/local').respond({success: false, message: 'User not found'});
      $httpBackend.flush();
      expect(scope.message).toBe('User not found');
      expect($state.current.name).toBe('login');
    }));

    it('should authenticate user with correct credentials', inject(function($state) {
      scope.login = userData;
      scope.loginUser();
      $httpBackend.expectPOST('/auth/local').respond({success: true, user: userData.username, userId: 1, token: 'asdf'});
      $httpBackend.flush();
      expect(scope.message).not.toBeDefined();
      expect($state.current.name).toBe('main');
    }));
  });
});