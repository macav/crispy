(function() {
  'use strict';

  function chatScroll($timeout) {
    return {
      restrict: 'EA',
      link: function(scope, element, attrs) {
        scope.$watchCollection(attrs.chatScroll, function(val) {
          if (val) {
            $(element).scrollTop(element[0].scrollHeight);
          }
        });
      }
    };
  }
  chatScroll.$inject = ['$timeout'];

  angular.module('crispy.main')
  .directive('chatScroll', chatScroll);
})();
