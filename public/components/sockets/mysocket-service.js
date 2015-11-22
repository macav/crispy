'use strict';

angular.module('freshy').
  factory('mySocket', ['socketFactory', function(socketFactory) {
    return socketFactory();
  }]);
