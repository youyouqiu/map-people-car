/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const apiMocker = require('mocker-api');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
    entry: './src/index.tsx',
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: false,
        port: 9000,
        host: '0.0.0.0',
        publicPath: '/',
        historyApiFallback: true,
        before (app) {
            apiMocker(app, path.resolve('mock/api.js'), {
                proxy: {
                    '/api/(.*)': 'http://192.168.24.165:8763',
                    // '/api/(.*)': 'http://192.168.66.8:8763', // 万兴
                    // '/api/(.*)': 'http://192.168.66.15:8763', // 郑建成
                    // '/api/(.*)': 'http://192.168.66.13:8763', // 李杰
                    // '/api/(.*)': 'http://192.168.66.4:8763', // 田张旭
                    // '/api/(.*)': 'http://192.168.66.7:8763', // 张娟
                    // '/api/(.*)': 'http://192.168.66.113:8763', // 彭胡杰
                },
                //对请求不到服务器或者网络问题导致的关闭端口处理-勿删
                httpProxy: {
                    options: {
                        ignorePath: false,
                    },
                    listeners: {
                        error: function (err, req, res) {
                            // console.log(err)
                            return res.status(500).json({
                                status: '-1',
                                msg: '找不到服务器，请检查网络!',
                                code: 500
                            });
                        },
                    },
                },
                changeHost: true,
            });
        },
    },
    module: {

        rules: [{
            test: /\.tsx?$/,
            use: [{
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            },],
            exclude: /node_modules/,
        },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: true,
                        },
                    },
                ],
                include: /\.module\.css$/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                exclude: /\.module\.css$/,
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: true,
                        },
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            javascriptEnabled: true,
                        },
                    },
                ],
                include: /\.module\.less$/,
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            javascriptEnabled: true,
                        },
                    },
                ],
                exclude: /\.module\.less$/,
            },
            // {
            //   test: /\.(png|jpe?g|gif|svg|ttf|woff2?|eot|swf|xml|ico)$/i,
            //   use: [{
            //     loader: 'file-loader',
            //     options: {
            //       name: '[path][name].[ext]',
            //     },
            //   },],
            // },
            {
                test: /\.(png|jpe?g|gif|svg|ttf|woff2?|eot|swf|xml|ico|wasm)$/i,
                type: "javascript/auto",
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                    },
                },],
            },
        ],
    },
    plugins: [
        // new webpack.ProvidePlugin({
        //   $: "jquery",
        //   jQuery: "jquery"
        // }),
        new CopyPlugin([{
            from: path.resolve('static'),
            to: 'static',
            // ignore: ['.*']
        }]),
        new CopyPlugin([{
            from: path.resolve('src/theme.less'),
            to: 'theme.less',
            // ignore: ['.*']
        }]),
        // new CopyPlugin ([
        //     {
        //         patterns: [
        //             { from: path.resolve('static'), to: 'static' },
        //         ],
        //     }
        // ]),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            favicon: 'src/favicon.ico'
        }),
        new webpack.DefinePlugin({
            PROCESS_DEV_ENV: true,
        }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html'],
        alias: {
            '@': path.resolve('src'),
        },
    },
    output: {
        filename: 'bundle.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },
};
