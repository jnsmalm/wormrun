const path = require("path")

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  devServer: {
    contentBase: ".",
    host: "0.0.0.0"
  },
  resolve: {
    extensions: [".js"]
  },
  externals: {
    "pixi.js": {
      commonjs: "pixi.js",
      commonjs2: "pixi.js",
      amd: "pixi.js",
      root: "PIXI"
    },
    "pixi3d": {
      commonjs: "pixi3d",
      commonjs2: "pixi3d",
      amd: "pixi3d",
      root: "PIXI3D"
    }
  },
  output: {
    path: path.resolve(__dirname),
    filename: "game.js"
  }
}