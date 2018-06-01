require("webpack")({
  target: "web",
  entry: "./src/index.html",
  output: {
    path: __dirname + "/dist",
  },
  module: { rules: [
    {
      test: /\.html/,
      use: [
        "file-loader",
        "extract-loader",
        {
          loader: "html-loader",
          options: { attrs: ["script:src"]}
        }
      ]
    },
    {
      test: /\.jsx?$/,
      use: [
        "file-loader",
        {
          loader: "babel-loader",
          options: { presets: ["env", "react", "stage-0"]},
        }
      ]
    },
    {
      test: /\.scss$/,
      loader: ["style-loader", "css-loader", "sass-loader"],
    },
    {
      test: /\.(png|jpg|gif|svg)$/,
      loader: "file-loader",
    },
  ]},
}, (err, stats) => {
  if(err || stats.hasErrors()) {
    console.log(err, stats.compilation.errors)
  }
});
