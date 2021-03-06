
var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    del = require('del'),
    sass = require('gulp-sass'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify');

var es = require('event-stream');
var bowerFiles = require('main-bower-files');
var print = require('gulp-print');
var Q = require('q');

// == PATH STRINGS ========
var appPath = './public/';
var distPath = './dist/';

var paths = {
    scripts: [appPath + '**/*.js', '!'+ appPath + '**/*_test.js', '!' + appPath + 'bower_components/**/*.js'],
    styles: [appPath + '**/*.css', '!' + appPath + 'bower_components/**/*.css'],
    sassStylesWatch: appPath + '**/*.scss',
    sassStyles: appPath + 'app.scss',
    sassStylesOutput: appPath,
    vendorStyles: [appPath + 'bower_components/html5-boilerplate/css/normalize.css', appPath + 'bower_components/html5-boilerplate/css/main.css', appPath + 'bower_components/angular-material/angular-material.css'],
    assets: appPath + 'assets/**/*',
    index: appPath + 'index.html',
    partials: [appPath + '**/*.html', '!' + appPath + 'index.html', '!' + appPath + 'bower_components/**/*.html'],
    distProd: distPath,
    distScriptsProd: distPath + 'scripts'
};

// == PIPE SEGMENTS ========

var pipes = {};

pipes.orderedVendorScripts = function() {
    return plugins.order(['jquery.js', 'angular.js']);
};

pipes.orderedAppScripts = function() {
    return plugins.angularFilesort();
};

pipes.minifiedFileName = function() {
    return plugins.rename(function (path) {
        path.extname = '.min' + path.extname;
    });
};

pipes.validatedAppScripts = function() {
    return gulp.src(paths.scripts)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.builtAppScriptsProd = function() {
    var scriptedPartials = pipes.scriptedPartials();
    var validatedAppScripts = pipes.validatedAppScripts();

    return es.merge(scriptedPartials, validatedAppScripts)
        .pipe(pipes.orderedAppScripts())
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat('app.min.js'))
            .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.builtVendorScriptsProd = function() {
    return gulp.src(bowerFiles('**/*.js'))
        .pipe(pipes.orderedVendorScripts())
        .pipe(plugins.concat('vendor.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.validatedPartials = function() {
    return gulp.src(paths.partials)
        .pipe(plugins.htmlhint({'doctype-first': false}))
        .pipe(plugins.htmlhint.reporter());
};

pipes.scriptedPartials = function() {
    return pipes.validatedPartials()
        .pipe(plugins.htmlhint.failReporter())
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.angularTemplatecache({
            module: 'crispy'
        }));
};

pipes.builtStylesProd = function() {
    return gulp.src(paths.styles)
        .pipe(plugins.sourcemaps.init())
            // .pipe(plugins.sass())
            .pipe(plugins.minifyCss())
        .pipe(plugins.sourcemaps.write())
        // .pipe(pipes.minifiedFileName())
        .pipe(plugins.concat('app.min.css'))
        .pipe(gulp.dest(paths.distProd));
};

pipes.builtVendorStylesProd = function() {
    return gulp.src(paths.vendorStyles)
        .pipe(plugins.minifyCss())
        .pipe(plugins.concat('vendor.min.css'))
        .pipe(gulp.dest(paths.distProd));
};

pipes.processedAssetsProd = function() {
    return gulp.src(paths.assets)
        .pipe(gulp.dest(paths.distProd + '/assets/'));
};

pipes.validatedIndex = function() {
    return gulp.src(paths.index)
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.reporter());
};

pipes.buildJSDoc = function() {
  var options = {
    scripts: [
      appPath + 'bower_components/angular/angular.min.js',
      appPath + 'bower_components/angular/angular.min.js.map',
      appPath + 'bower_components/angular-animate/angular-animate.min.js',
      appPath + 'bower_components/angular-animate/angular-animate.min.js.map'
    ],
    html5Mode: false,
    startPage: '/api',
    title: "Crispy Docs",
    titleLink: "/api"
  }
  return gulp.src(paths.scripts)
        .pipe(plugins.ngdocs.process(options))
        .pipe(gulp.dest('./docs'));
};

pipes.builtIndexProd = function() {

    var vendorScripts = pipes.builtVendorScriptsProd();
    var vendorStyles = pipes.builtVendorStylesProd();
    var appScripts = pipes.builtAppScriptsProd();
    var appStyles = pipes.builtStylesProd();
    pipes.buildJSDoc();

    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.distProd)) // write first to get relative path for inject
        .pipe(plugins.inject(vendorScripts, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(appScripts, {relative: true}))
        .pipe(plugins.inject(vendorStyles, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(appStyles, {relative: true}))
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest(paths.distProd));
};

pipes.builtAppProd = function() {
    return es.merge(pipes.builtIndexProd(), pipes.processedAssetsProd());
};

pipes.buildSass = function() {
  gulp.src(paths.sassStyles)
  .pipe(plugins.sass({outputStyle: 'expanded'}))
  .pipe(gulp.dest(paths.sassStylesOutput));
};

// == TASKS ========

// removes all compiled production files
gulp.task('clean', function() {
    var deferred = Q.defer();
    del(paths.distProd, function() {
        deferred.resolve();
    });
    return deferred.promise;
});

// checks html source files for syntax errors
gulp.task('validate-partials', pipes.validatedPartials);

// checks index.html for syntax errors
gulp.task('validate-index', pipes.validatedIndex);

// converts partials to javascript using html2js
gulp.task('convert-partials-to-js', pipes.scriptedPartials);

// runs jshint on the app scripts
gulp.task('validate-app-scripts', pipes.validatedAppScripts);

// concatenates, uglifies, and moves app scripts and partials into the prod environment
gulp.task('build-app-scripts', pipes.builtAppScriptsProd);

// compiles and minifies app sass to css and moves to the prod environment
gulp.task('build-styles', pipes.builtStylesProd);

// concatenates, uglifies, and moves vendor scripts into the prod environment
gulp.task('build-vendor-scripts', pipes.builtVendorScriptsProd);

// validates and injects sources into index.html, minifies and moves it to the dev environment
gulp.task('build-index', pipes.builtIndexProd);

// builds a complete prod environment
gulp.task('build', pipes.builtAppProd);

gulp.task('build-doc', pipes.buildJSDoc);

// cleans and builds a complete prod environment
gulp.task('clean-build', ['clean'], pipes.builtAppProd);

// clean, build, and watch live changes to the prod environment
gulp.task('watch-prod', ['clean-build', 'validate-app-scripts', 'build-sass'], function() {

    // start nodemon to auto-reload the dev server
    plugins.nodemon({ script: 'server.js', ext: 'js', watch: [], env: {NODE_ENV : 'production'} })
        .on('change', ['validate-app-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted prod server');
        });

    // start live-reload server
    plugins.livereload.listen({start: true});

    // watch index
    gulp.watch(paths.index, function() {
        return pipes.builtIndexProd()
            .pipe(plugins.livereload());
    });

    // watch app scripts
    gulp.watch(paths.scripts, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch hhtml partials
    gulp.watch(paths.partials, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch styles
    gulp.watch(paths.styles, function() {
        return pipes.builtStylesProd()
            .pipe(plugins.livereload());
    });

    gulp.watch(paths.sassStyles, ['build-sass'], function() {
      return plugins.livereload();
    });

});
// clean, build, and watch live changes to the prod environment
gulp.task('watch', ['validate-app-scripts'], function() {

    // start nodemon to auto-reload the dev server
    plugins.nodemon({ script: 'server.js', ext: 'js', watch: [], env: {NODE_ENV : 'dev'} })
        .on('change', ['validate-app-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    // start live-reload server
    plugins.livereload.listen({start: true});

    // watch index
    gulp.watch(paths.index, function() {
        return pipes.builtIndexProd()
            .pipe(plugins.livereload());
    });

    // watch app scripts
    gulp.watch(paths.scripts, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch hhtml partials
    gulp.watch(paths.partials, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch styles
    gulp.watch(paths.styles, function() {
        return pipes.builtStylesProd()
            .pipe(plugins.livereload());
    });

    gulp.watch(paths.sassStyles, ['build-sass']);
});

gulp.task('validate', ['validate-partials', 'validate-index', 'validate-app-scripts'])

gulp.task('build-sass', pipes.buildSass);
gulp.task('watch-sass', function() {
    gulp.watch(paths.sassStylesWatch, ['build-sass']);
});

gulp.task('serve-docs', function() {
  plugins.connect.server({
    root: 'docs',
    livereload: true,
    port: 8000
  });
});

// default task builds for prod
gulp.task('default', ['clean-build']);
