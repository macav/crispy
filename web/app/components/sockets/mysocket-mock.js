/*
 Simple mock for socket.io
 see: https://github.com/btford/angular-socket-io-seed/issues/4
 thanks to https://github.com/southdesign for the idea
 */
var sockMock = function($rootScope){
  this.events = {};
  this.emits = {};

  // intercept 'on' calls and capture the callbacks
  this.on = function(eventName, callback){
    if(!this.events[eventName]) this.events[eventName] = [];
    this.events[eventName].push(callback);
  };

  // intercept 'emit' calls from the client and record them to assert against in the test
  this.emit = function(eventName){
    var args = Array.prototype.slice.call(arguments, 1);

    if(!this.emits[eventName])
      this.emits[eventName] = [];
    this.emits[eventName].push(args);
  };

  //simulate an inbound message to the socket from the server (only called from the test)
  this.receive = function(eventName){
    var args = Array.prototype.slice.call(arguments, 1);

    if(this.events[eventName]){
      angular.forEach(this.events[eventName], function(callback){
        $rootScope.$apply(function() {
          callback.apply(this, args);
        });
      });
    }
  };

};