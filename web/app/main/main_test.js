'use strict';

describe('Freshy main module', function() {

  beforeEach(module('ngAria'));
  beforeEach(module('ngAnimate'));
  beforeEach(module('ngMaterial'));
  beforeEach(module('freshy.main'));

  var scope, ctrl;

  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    ctrl = $controller('MainCtrl', {$scope: scope});
  }));

  describe('Main controller', function(){

    it ('should have defined controller', function() {
      expect(ctrl).toBeDefined();
    });

    it ('should have a list of users defined', function() {
      expect(scope.users).toBeDefined();
    });

  });
});