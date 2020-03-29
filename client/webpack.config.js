const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const contentBase = path.resolve(__dirname, 'dist');
const NODE_ENV = process.env.NODE_ENV;

// Different build modes
const __PROD__ = NODE_ENV === 'production';
const __DEV__ = NODE_ENV === 'dev';
const __TEST__ = NODE_ENV === 'test';

let TS_CONFIG_FILE_NAME = 'tsconfig.';
if (__TEST__) {
    TS_CONFIG_FILE_NAME += 'test.json';
} else if (__DEV__ || __PROD__) {
    TS_CONFIG_FILE_NAME += 'json';
} else {
    console.error(`Invalid value for NODE_ENV=(${NODE_ENV}). Acceptable values are 'dev', 'test' and 'production'`);
    process.exitCode(1);
}

module.exports = webpackConfig = {
    entry: [
        './src/index.tsx',
        'whatwg-fetch'
    ],
    output: {
        path: contentBase,
        filename: 'bundle.js',
        publicPath: '/'
    },
    devServer: {
        inline: true,
        contentBase: contentBase,
        port: 4002,
        historyApiFallback: true,
        open: true,
        overlay: true
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json', '.css']
    },
    module: {
        rules: [{ // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            test: /\.tsx?$/,
            enforce: 'post',
            loader: 'awesome-typescript-loader',
            options: {
                configFileName: TS_CONFIG_FILE_NAME
            }
        }, { // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            test: /\.js$/,
            enforce: 'pre',
            loader: 'source-map-loader'
        }, {
            test: /\.css$/,
            loaders: [{
                loader: 'style-loader'
            }, {
                loader: 'typings-for-css-modules-loader',
                options: {
                    modules: true,
                    namedExport: true,
                    camelCase: true,
                    minimize: true,
                    localIdentName: '[name]-[local]-[hash:base64:5]'
                }
            }]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            // For Redux: https://stackoverflow.com/questions/30030031/
            'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
            __PROD__: __PROD__,
            __DEV__:  __DEV__,
            __TEST__: __TEST__
        }),
        new webpack.WatchIgnorePlugin([/css\.d\.ts$/]),
        new HtmlWebpackPlugin({
            template: 'index.template.html'
        }),
    ]
};

if (__PROD__) {
    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    webpackConfig.externals = {
        'react': 'React',
        'react-dom': 'ReactDOM'
    };

    webpackConfig.plugins.push(new UglifyJSPlugin());
}
