module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'public/bower_components/angular/angular.js',
      'public/bower_components/angular-route/angular-route.js',
      'public/bower_components/angular-aria/angular-aria.js',
      'public/bower_components/angular-animate/angular-animate.js',
      'public/bower_components/angular-material/angular-material.js',
      'public/bower_components/angular-cookies/angular-cookies.js',
      'public/bower_components/angular-ui-router/release/angular-ui-router.js',
      'public/bower_components/angular-mocks/angular-mocks.js',
      'public/bower_components/angular-socket-io/socket.js',
      'public/bower_components/socket.io.client/dist/socket.io-1.3.5.js',
      'public/app.js',
      'public/components/**/*.js',
      'public/conversation/**/*.js',
      'public/auth/**/*.js',
      'public/main/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
