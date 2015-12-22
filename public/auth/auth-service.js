(function() {
  'use strict';
  function AuthService($http, $window, $interval, mySocket, jwtHelper, ProfileService) {
      var _isAuthenticated = false;
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
              var userData = {
                  email: tokenPayload.email,
                  id: tokenPayload.userId,
                  status: tokenPayload.status,
                  gender: tokenPayload.gender,
                  first_name: tokenPayload.first_name,
                  last_name: tokenPayload.last_name,
                  name: tokenPayload.first_name + ' ' + tokenPayload.last_name
              };
              if (!ProfileService.load()) {
                ProfileService.setUserData(userData);
              }
              mySocket.connect();
              mySocket.emit('login', userData.id);
              socketHandler = mySocket.on('reconnect', function() {
                  mySocket.emit('login', userData.id);
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
              ProfileService.clear();
              mySocket.disconnect();
              if (socketHandler) {
                  socketHandler();
              }
          },
          isAuthenticated: function() {
              return _isAuthenticated;
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
          },
          register: function(data) {
            return $http.post('/auth/register', data);
          }
      };
  }
  AuthService.$inject = ['$http', '$window', '$interval', 'mySocket', 'jwtHelper', 'ProfileService'];

  function AuthServiceConfig($urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');
    $urlRouterProvider.when('/login', ['$state', '$window', function($state, $window) {
      if ($window.localStorage.accessToken) {
        $state.go('main.conversation');
      } else {
        return false;
      }
    }]);
    $urlRouterProvider.rule(function($injector, $location) {
      var $window = $injector.get('$window');
      var $state = $injector.get('$state');
      if (!$window.localStorage.accessToken && ['/login', '/login/callback', '/register'].indexOf($location.path()) === -1) {
        return $state.get('login').url;
      }
    });
  }
  AuthServiceConfig.$inject = ['$urlRouterProvider'];

  function AuthModuleInit($window, AuthService) {
    if ($window.localStorage.accessToken) {
      AuthService.authenticateToken($window.localStorage.accessToken);
    }
  }
  AuthModuleInit.$inject = ['$window', 'AuthService'];

  angular.module('crispy.auth', [
               'ui.router',
               'angular-jwt'])
  .factory('AuthService', AuthService)
  .config(AuthServiceConfig).
  run(AuthModuleInit);
})();
