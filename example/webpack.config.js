module.exports = {
  context: __dirname,
  entry: "./entry",
  output: {
    path: __dirname + "/public/assets",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel?stage=0'
      }
    ]
  }
}
