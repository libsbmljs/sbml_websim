// Karma configuration
// Generated on Sat Feb 02 2019 16:15:22 GMT-0800 (PST)

// https://github.com/babel/karma-babel-preprocessor

// https://stackoverflow.com/questions/38573690/uncaught-referenceerror-require-is-not-defined-on-karma-start-karma-conf-js/38579355

// https://stackoverflow.com/questions/22421857/error-no-provider-for-frameworkjasmine-resolving-frameworkjasmine

// https://mike-ward.net/2015/09/07/tips-on-setting-up-karma-testing-with-webpack/

var path = require('path');
const webpack = require('webpack');
// var entry = path.resolve(webpackConfig.context, webpackConfig.entry);
// var preprocessors = {};
// preprocessors[entry] = ['webpack'];
// preprocessors = ['webpack']

const wasm_dir = 'node_modules/libsbmljs_stable'

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    frameworks: ['jasmine'],

    mime: {
     'application/wasm': ['wasm']
    },

    // https://github.com/webpack/webpack-dev-middleware/issues/229
    files: [
      {pattern: wasm_dir+'/libsbml.wasm', watched: false, served: true, included: false, type: 'wasm'},
      {pattern: '../models/*.xml', watched: false, served: true, included: false},
      'test/index.js'
    ],

    webpack: {
      mode: 'development',
      resolve: {
        modules: ['node_modules']
      },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader"
            }
          },
        ]
      },
      devtool: 'inline-source-map',
      plugins: [
        new webpack.IgnorePlugin(/^fs$/)
      ]
    },

    proxies: {
      '/base/libsbml.wasm': '/base/'+wasm_dir+'/libsbml.wasm',
      '/base/models/': path.resolve('models/')
    },

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/index.js': ['webpack', 'sourcemap'],
      'test/index.js': ['webpack'],
    },

    // babelPreprocessor: {
    //   options: {
    //     presets: ['@babel/preset-env'],
    //     sourceMap: 'inline'
    //   },
    //   filename: function (file) {
    //     return file.originalPath.replace(/\.js$/, '.es5.js');
    //   },
    //   sourceFileName: function (file) {
    //     return file.originalPath;
    //   }
    // },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    concurrency: Infinity,
    plugins:[
      require('karma-webpack'),
      ('karma-jasmine'),
      // ('karma-chai'),
      // ('karma-mocha'),
      // ('karma-chrome-launcher')
      ('karma-firefox-launcher'),
      ('karma-sourcemap-loader'),
      // ('karma-babel-preprocessor'),
    ]
  });
};
