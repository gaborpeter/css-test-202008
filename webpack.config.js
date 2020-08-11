var path = require ('path'),
  HtmlWebpackPlugin = require ('html-webpack-plugin'),
  CleanWebpackPlugin = require ('clean-webpack-plugin'),
  ExtractTextPlugin = require ('extract-text-webpack-plugin'),
  CopyWebpackPlugin = require ('copy-webpack-plugin');

module.exports = {
  entry: ['babel-polyfill', './src/app.js'],
  output: {
    filename: 'src/js/bundle.js',
    path: path.resolve (__dirname, 'dist'),
  },
  resolve: {
    modules: ['node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.js/,
        include: path.resolve (__dirname, 'src'),
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract ({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader'],
        }),
      },
      {
        test: /\.(jpe?g|png|gif|svg|pdf|ico)$/,
        use: [
          'file-loader?name=[name].[ext]&outputPath=src/img/&publicPath=../img/',
          'image-webpack-loader',
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'src/fonts/',
              publicPath: '../fonts',
            },
          },
        ],
      },
    ],
  },
  devServer: {
    headers: {'Access-Control-Allow-Origin': '*'},
    https: false,
    disableHostCheck: true,
  },
  plugins: [
    new CleanWebpackPlugin (['dist']),
    new HtmlWebpackPlugin ({
      template: 'index.html',
      title: 'Test work',
      filename: 'index.html',
    }),
    new ExtractTextPlugin ({
      filename: 'src/css/main.css',
    }),
    new CopyWebpackPlugin (
      [{from: './src/img/*', to: 'src/img', flatten: true}],
      {}
    ),
  ],
};
