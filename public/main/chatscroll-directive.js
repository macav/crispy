(function() {
  'use strict';

  function chatScroll($timeout) {
    return {
      restrict: 'EA',
      scope: {
        chatScroll: '='
      },
      link: function(scope, element, attrs) {
        scope.$watchCollection('chatScroll', function(val) {
          if (val) {
            $(element).scrollTop(element[0].scrollHeight);
          }
        });
      }  
    };
  }
  chatScroll.$inject = ['$timeout'];

  angular.module('freshy.main')
  .directive('chatScroll', chatScroll);
})();