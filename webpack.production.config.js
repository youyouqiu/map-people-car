const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackBar = require('webpackbar');

module.exports = {
  mode: 'production',
  entry: './src/index.tsx',
  devtool: '',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        // use: [
        //     {
        //         loader: 'ts-loader',
        //         options: {
        //             transpileOnly: true,
        //             getCustomTransformers: () => ({
        //                 before: [tsImportPluginFactory({
        //                     libraryName: 'antd',
        //                     libraryDirectory: 'lib',
        //                     style: true
        //                 })]
        //             }),
        //             compilerOptions: {
        //                 module: 'es2015'
        //             }
        //         },
        //     }
        // ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true
            }
          }],
        include: /\.module\.css$/
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader'],
        exclude: /\.module\.css$/
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true
            }
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          }
        ],
        include: /\.module\.less$/
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          },
        ],
        exclude: /\.module\.less$/
      },
      {
        test: /\.(png|jpe?g|gif|svg|ttf|woff2?|eot|swf|xml|ico|wasm)$/i,
        type: "javascript/auto",
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            }
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    // splitChunks: {
    //     cacheGroups: {
    //         commons: {
    //             test: /[\\/]node_modules[\\/]/,
    //             name: 'vendors',
    //             chunks: 'all'
    //         }
    //     }
    // }
  },
  plugins: [
    new WebpackBar(),
    // new webpack.ProvidePlugin({
    //   $: "jquery",
    //   jQuery: "jquery"
    // }),
    new CopyPlugin([
      {
        from: path.resolve('static'),
        to: 'static',
        // ignore: ['.*']
      }
    ]),
    new CopyPlugin([{
      from: path.resolve('src/theme.less'),
      to: 'theme.less',
      // ignore: ['.*']
    }]),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: 'src/favicon.ico',
      hash: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css',
      chunkFilename: '[name].css',
    }),
    new webpack.DefinePlugin({
      PROCESS_DEV_ENV: false,
    })
  ],
  // externals: {
  //     "react": "React",
  //     "react-dom": "ReactDOM"
  // },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.html'],
    alias: {
      '@': path.resolve('src'),
    }
  },
  output: {
    filename: 'bundle.js',
    chunkFilename: '[name].bundle.js',
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
  },
};