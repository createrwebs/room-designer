const path = require('path');
const webpack = require('webpack');
const args = process.argv.slice(2);

module.exports = {
    devtool: 'eval',
    entry: [
        './src/index.js',
    ],
    /*     entry: {
            index: [
                './js/index.js'
            ],
            meeting: [
                './js/meeting.js'
            ]
        }, */
    output: {
        path: path.resolve(__dirname, 'public'),
        // publicPath: './',
        filename: 'index.js',
    },
    /*     output: {
            path: path.resolve(__dirname, '/public'),
            publicPath: '/public',
            hashDigestLength: 5,
            // filename: `zoom-meeting-${buildVersion}-[name]-[chunkhash].min.js`,
            filename: '[name].min.js'
        }, */
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(jpg|png|svg)$/,
                loader: 'url-loader?limit=500000'
            },
            {
                test: /\.(ttf|eot|woff|woff2|svg)$/,
                loader: 'url-loader?limit=50000'
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    /*     externals: {
            'babel-polyfill': 'babel-polyfill',
            react: 'React',
            'react-dom': 'ReactDOM',
            redux: 'Redux',
            'redux-thunk': 'ReduxThunk',
            lodash: {
                commonjs: 'lodash',
                amd: 'lodash',
                root: '_',
                var: '_'
            }
        }, */
    context: __dirname,
    target: 'web',
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        port: 9000,
        hot: true,
        overlay: true,
        historyApiFallback: false,
        watchContentBase: true,
        disableHostCheck: true,
        headers: {
            'Access-Control-Allow-Origin': 'http://localhost:9999'
        }
    },
    mode: 'development',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.BABEL_ENV': JSON.stringify('development'),
        }),
    ],
};
