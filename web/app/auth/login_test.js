'use strict';

describe('Freshy auth module', function() {

  beforeEach(module('ui.router'));
  beforeEach(module('ngCookies'));
  beforeEach(module('freshy.auth'));

  var scope;

  describe('Login controller', function(){

    it('should ....', inject(function($controller, $rootScope) {
      scope = $rootScope.$new();
      var view2Ctrl = $controller('LoginCtrl', {$scope: scope});
      expect(view2Ctrl).toBeDefined();
    }));

  });
});