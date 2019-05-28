import path from "path"
import webpack from 'webpack'
import nodeExternals from 'webpack-node-externals'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'

module.exports = env => ({
  entry: './src/index.js',
  target: 'node',
  output: {
    // https://stackoverflow.com/questions/43209666/react-router-v4-cannot-get-url/43212553
    library: 'sbml_websim',
    libraryTarget: 'umd',
    filename: 'sbml_websim.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: [path.join(__dirname,'src'), path.join(__dirname,'node_modules','libsbmljs_stable'), env ? env.DATABASE_PREFIX : ''],
    hot: false
  },
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
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.IgnorePlugin(/^fs$/),
    new CopyPlugin([
      {from: '**/*.wasm', to: './', flatten: true},
      {from: 'package.json', to: './', flatten: true}
    ]),
  ],
  externals: [nodeExternals()]
})
