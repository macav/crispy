(function() {
    function AuthService($http, $window) {
        var _isAuthenticated = false;
        var _userData;
        var _accessToken;

        return {
            authenticate: function(username, password) {
                var self = this;
                var promise = $http.post('/auth/local', {username: username, password: password});
                promise.then(function(result) {
                    if (!result.data.success) {
                        self.logout();
                        return;
                    }
                    _userData = {
                        email: result.data.user,
                        id: result.data.userId
                    };
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
            },
            logout: function() {
                _isAuthenticated = false;
                delete $http.defaults.headers.common.Authorization;
                delete $window.localStorage.accessToken;
            },
            isAuthenticated: function() {
                return _isAuthenticated;
            },
            getUserData: function() {
                return _userData;
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
        }
    }
    AuthService.$inject = ['$http', '$window'];

    angular.module('freshy.auth', [
                 'ui.router',
                 'ngCookies'])
    .factory('AuthService', AuthService);
})();