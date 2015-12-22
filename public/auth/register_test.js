'use strict';

describe('Crispy auth module', function() {

  beforeEach(module('crispy'));
  beforeEach(module('crispy.auth'));
  var $httpBackend;
  var scope;

  describe('register controller', function(){

    var userData = {
      username: 'test1',
      password: 'testpass',
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEyMzQ1LCJlbWFpbCI6InRlc3QxIiwiaWF0IjoxNDUwNzEyMDQ3LCJleHAiOjE0NTEzMTY4NDd9.iakUF8_f7HXiOOvEKiBVsKPckyf6mlpJjcDcQ5zbCxg'
    };
    var scope, ctrl;
    beforeEach(inject(function($controller, $rootScope, _$httpBackend_) {
      scope = $rootScope.$new();
      ctrl = $controller('RegisterCtrl', {$scope: scope});
      $httpBackend = _$httpBackend_;
      $httpBackend.whenGET('auth/register.html').respond({});
      $httpBackend.whenGET('auth/login.html').respond({});
    }));

    it('should have controller defined', inject(function($controller, $rootScope) {
      expect(ctrl).toBeDefined();
    }));

    it('should have default male gender', function() {
      expect(ctrl.data.gender).toBe(0);
    });

    it('should display error message when password dont match', function() {
      ctrl.data = {
        email: 'test@test.com',
        password: 'password',
        password2: 'somethingelse'
      };
      ctrl.registerUser();
      expect(ctrl.message).toBe('Passwords do not match');
    });

    it('should display error message when password are not provided', function() {
      ctrl.data = {
        email: 'test@test.com'
      };
      ctrl.registerUser();
      $httpBackend.expectPOST('/auth/register').respond({message: 'Password has not been provided'});
      $httpBackend.flush();
      expect(ctrl.message).toBe('Password has not been provided');
    });

    it('should go to login state when register is successful', inject(function($state) {
      ctrl.data = {
        email: 'test@test.com',
        password: 'password',
        password2: 'password'
      };
      ctrl.registerUser();
      $httpBackend.expectPOST('/auth/register').respond({status: 201});
      $httpBackend.flush();
      expect($state.current.name).toBe('login');
    }));
  });
});
