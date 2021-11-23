const { VueLoaderPlugin } = require('vue-loader');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
  entry: './src/main.js',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      // 它会应用到普通的 `.js` 文件
      // 以及 `.vue` 文件中的 `<script>` 块
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
      // 它会应用到普通的 `.css` 文件
      // 以及 `.vue` 文件中的 `<style>` 块
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/*.html',
          to: '[name].[ext]',
        },
      ],
    }),
  ],
  mode: 'development',
  devtool: 'inline-source-map',
};
