'use strict';

describe('Freshy conversation module', function() {

  beforeEach(module('freshy.conversation'));

  var scope;
  describe('conversation controller', function(){

    it('should ....', inject(function($controller, $rootScope) {
      scope = $rootScope.$new();
      var view1Ctrl = $controller('ConversationCtrl', {$scope: scope});
      expect(view1Ctrl).toBeDefined();
    }));

  });
});