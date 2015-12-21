(function() {
  'use strict';

  function MessageService($http) {
    var _endpoint = '/api/messages';
    return {
        query: function(query) {
            return $http.get(_endpoint, {params: query});
        },
        post: function(message) {
            return $http.post(_endpoint, message);
        }
    };
  }
  MessageService.$inject = ['$http'];

  angular.module('crispy.main')
  .factory('MessageService', MessageService);
})();
