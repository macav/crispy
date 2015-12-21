(function() {
  'use strict';
  function AuthService($http, $window, $interval, mySocket, jwtHelper) {
      var _isAuthenticated = false;
      var _userData;
      var _accessToken;
      var _refreshTokenInterval;
      var socketHandler;

      return {
          authenticate: function(username, password) {
              var self = this;
              var promise = $http.post('/auth/local', {username: username, password: password});
              promise.then(function(result) {
                  if (!result.data.success) {
                      self.logout();
                      return;
                  }
                  self.authenticateToken(result.data.token);
              }, function(err) {
                  self.logout();
              });
              return promise;
          },
          authenticateToken: function(token) {
              _isAuthenticated = true;
              _accessToken = token;
              $http.defaults.headers.common.Authorization = 'JWT ' + _accessToken;
              $window.localStorage.accessToken = _accessToken;
              _refreshTokenInterval = $interval(this.refreshToken, 3600000);
              var tokenPayload = jwtHelper.decodeToken(token);
              _userData = {
                  email: tokenPayload.email,
                  id: tokenPayload.userId
              };
              mySocket.connect();
              mySocket.emit('login', _userData.id);
              socketHandler = mySocket.on('reconnect', function() {
                  mySocket.emit('login', _userData.id);
              });
          },
          logout: function() {
              if (_refreshTokenInterval) {
                  $interval.cancel(_refreshTokenInterval);
                  _refreshTokenInterval = null;
              }
              _isAuthenticated = false;
              delete $http.defaults.headers.common.Authorization;
              delete $window.localStorage.accessToken;
              mySocket.disconnect();
              if (socketHandler) {
                  socketHandler();
              }
          },
          isAuthenticated: function() {
              return _isAuthenticated;
          },
          getUserData: function() {
              return _userData;
          },
          getActiveUsers: function() {
              return $http.get('/api/users');
          },
          getToken: function() {
              return $http.defaults.headers.common.Authorization;
          },
          refreshToken: function() {
              return $http.post('/auth/refresh_token').then(function(result) {
                  _accessToken = result.data.token;
                  $http.defaults.headers.common.Authorization = 'JWT ' + _accessToken;
                  $window.localStorage.accessToken = _accessToken;
              });
          }
      };
  }
  AuthService.$inject = ['$http', '$window', '$interval', 'mySocket', 'jwtHelper'];

  angular.module('crispy.auth', [
               'ui.router',
               'angular-jwt'])
  .factory('AuthService', AuthService);
})();
