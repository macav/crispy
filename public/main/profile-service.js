(function() {
  'use strict';

  function ProfileService($http, $window) {
    var _userData;
    var _endpoint = '/api/profile';

    return {
        update: function(profile) {
          return $http.put(_endpoint, profile);
        },
        setStatus: function(status) {
          return $http.patch(_endpoint, {status: status});
        },
        getUserData: function() {
          return _userData;
        },
        get: function(key) {
          return _userData[key];
        },
        set: function(key, value) {
          _userData[key] = value;
          this.save();
        },
        save: function() {
          $window.localStorage.profile = JSON.stringify(_userData);
        },
        load: function() {
          if (!angular.isDefined($window.localStorage.profile)) {
            return false;
          }
          _userData = JSON.parse($window.localStorage.profile);
          return true;
        },
        clear: function() {
          delete $window.localStorage.profile;
        },
        setUserData: function(data) {
          _userData = data;
          this.save();
        }
    };
  }
  ProfileService.$inject = ['$http', '$window'];

  angular.module('crispy.main')
  .factory('ProfileService', ProfileService);
})();
