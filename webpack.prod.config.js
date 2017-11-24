const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "./dist/css/main.min.css"
});

module.exports = {
  devServer: {
    port: process.env.PORT
  },
  entry: "./src/js/index.js",
  output: {
    filename: "./dist/js/bundle.min.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env"]
          }
        }
      },
      {
        test: /\.scss$/,
          use: extractSass.extract({
            use: [{
              loader: "css-loader",
              options: {
                sourceMap: true
              }
            }, {
              loader: "sass-loader",
              options: {
                sourceMap: true,
                outputStyle: "compressed",

              }
            }]
          })
      }
    ]
  },
  plugins: [
    extractSass
  ]
};
