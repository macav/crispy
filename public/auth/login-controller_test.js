'use strict';

describe('Crispy auth module', function() {

  beforeEach(module('crispy'));
  beforeEach(module('crispy.auth'));
  var $httpBackend;
  var scope;

  describe('Login controller', function(){

    var userData = {
      username: 'test1',
      password: 'testpass',
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEyMzQ1LCJlbWFpbCI6InRlc3QxIiwiaWF0IjoxNDUwNzEyMDQ3LCJleHAiOjE0NTEzMTY4NDd9.iakUF8_f7HXiOOvEKiBVsKPckyf6mlpJjcDcQ5zbCxg'
    };
    var scope, ctrl;
    beforeEach(inject(function($controller, $rootScope, _$httpBackend_) {
      scope = $rootScope.$new();
      ctrl = $controller('LoginCtrl', {$scope: scope});
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('auth/login.html').respond({});
      $httpBackend.whenGET('conversation/conversation.html').respond({});
    }));
    afterEach(inject(function(AuthService) {
      AuthService.logout();
    }));

    it('should have controller defined', inject(function($controller, $rootScope) {
      expect(ctrl).toBeDefined();
    }));

    it('should display error message when user credentials are incorrect', inject(function($state, $timeout) {
      scope.login = userData;
      scope.loginUser();
      $httpBackend.expectPOST('/auth/local').respond({success: false, message: 'User not found'});
      $httpBackend.flush();
      expect(scope.message).toBe('User not found');
      $timeout(function() {
        expect($state.current.name).toBe('login');
      });
    }));

    it('should authenticate user with correct credentials', inject(function($state) {
      scope.login = userData;
      scope.loginUser();
      $httpBackend.expectPOST('/auth/local').respond({success: true, user: userData.username, userId: 1, token: userData.token});
      $httpBackend.expectGET('/api/users').respond([]);
      $httpBackend.expectGET('main/main.html').respond({});
      $httpBackend.flush();
      expect(scope.message).not.toBeDefined();
      expect($state.current.name).toBe('main.conversation');
    }));
  });
});
