'use strict';

angular.module('crispy').
  factory('mySocket', ['socketFactory', function(socketFactory) {
    return socketFactory();
  }]);
