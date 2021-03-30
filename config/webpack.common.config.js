const path = require('path');
const winston = require('winston');
const paths = require('./paths.js');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackScriptsPlugin = require('html-webpack-scripts-plugin');

const TARGET = process.env.npm_lifecycle_event;
const PROJECT_MAIN_PATH = process.env.PROJECT_MAIN_PATH || './';
const PROJECT_MAIN_CLASS = process.env.PROJECT_MAIN_CLASS || 'ProjectMain';
const RESOURCES_PATH = process.env.RESOURCES_PATH || './src/resources/';
const APP_PREFIX = process.env.APP_PREFIX;

let CustomCssTheme;

if (process.env.PROJECT_MAIN_PATH)  {
  CustomCssTheme = require(PROJECT_MAIN_PATH + 'theme/antLessModifyVars');
} else {
  CustomCssTheme = path.resolve(PROJECT_MAIN_PATH + 'src/theme/antLessModifyVars');
}

const Logger = winston.createLogger({
  format: winston.format.simple(),
  level: 'info',
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
});

const commonWebpackConfig = {
  performance: {
    hints: false,
    maxEntrypointSize: 6291456,
    maxAssetSize: 6291456
  },
  entry: {
    app: [
      '@babel/polyfill',
      'whatwg-fetch',
      'object-fit-polyfill',
      paths.appIndexJs
    ]
  },

  output: {
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: (TARGET.indexOf('build') > -1) ? false : true,
    path: (TARGET.indexOf('start') > -1) ? path.join(__dirname + '/../') : path.join(__dirname + '/../', 'build'),
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'bundle.js',
    publicPath: '',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js'
  },

  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules\/(?!@terrestris\/d3-util)/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true // compile happens in ForkTsCheckerWebpackPlugin
          }
        }
      ]
    }, {
      test: /\.jsx?$/,
      exclude: /node_modules\/(?!@terrestris)/,
      loader: 'babel-loader',
    },
    {
      test: /\.css$/,
      loaders: [
        'style-loader',
        'css-loader'
      ]
    }, {
      test: /\.less$/,
      loaders: [
        'style-loader',
        'css-loader',
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              modifyVars: CustomCssTheme,
              javascriptEnabled: true
            }
          }
        }
      ]
    }, {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      ]
    }, {
      test: /\.(pdf|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader'
    }, {
      test: /\.(jpe?g|png|gif|ico)$/i,
      use: [
        'file-loader?name=img/[name].[ext]'
      ]
    }]
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false
    }),
    new CopyWebpackPlugin({
      patterns: [
        './public/de.png',
        './public/en.png',
        './public/logo_terrestris.png',
        './public/index.css',
        './public/manifest.json',
        './public/something-went-wrong.png',
        {
          from: RESOURCES_PATH + 'appContext.json',
          to: './resources/'
        }, {
          from: RESOURCES_PATH + 'i18n/',
          to: './resources/i18n/'
        }, {
          from: RESOURCES_PATH + 'img/',
          to: './resources/img/'
        }, {
          from: RESOURCES_PATH + 'help/',
          to: './resources/help/'
        }
      ]
    }),
    new webpack.DefinePlugin({
      PROJECT_MAIN_PATH: JSON.stringify(PROJECT_MAIN_PATH),
      PROJECT_MAIN_CLASS: new RegExp('^./' + PROJECT_MAIN_CLASS + '\\.(jsx|js|ts|tsx)$'),
      APP_PREFIX: JSON.stringify(APP_PREFIX),
      ___TEST___: JSON.stringify(TARGET.indexOf('test') > -1)
    }),
    new SimpleProgressWebpackPlugin({
      format: 'compact'
    }),
    new HtmlWebpackScriptsPlugin({
      'charset=utf-8': /bundle/
    })
  ],

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: ['node_modules'],
    alias: {
      // This is need if working with npm link or while invoking react-geo-baseclient as submodule
      // in some other project
      'react-geo-baseclient': path.join(__dirname + '/../', 'src'),
      '@terrestris/base-util': path.join(__dirname + '/../', 'node_modules', '@terrestris/base-util'),
      '@terrestris/ol-util': path.join(__dirname + '/../', 'node_modules', '@terrestris/ol-util'),
      '@terrestris/react-geo': path.join(__dirname + '/../', 'node_modules', '@terrestris/react-geo'),
      'antd': path.join(__dirname + '/../', 'node_modules', 'antd'),
      'react': path.join(__dirname + '/../', 'node_modules', 'react'),
      'react-redux': path.join(__dirname + '/../', 'node_modules', 'react-redux'),
      'react-i18next': path.join(__dirname + '/../', 'node_modules', 'react-i18next'),
      '@ant-design/icons': path.join(__dirname + '/../', 'node_modules', '@ant-design/icons'),
      'moment': path.join(__dirname + '/../', 'node_modules', 'moment'),
      'ol': path.join(__dirname + '/../', 'node_modules', 'ol')
    }
  }
};

module.exports = {
  logger: Logger,
  commonWebpackConfig: commonWebpackConfig,
  TARGET: TARGET
};
