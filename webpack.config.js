import { HotModuleReplacementPlugin, WatchIgnorePlugin } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';

export const entry = ['webpack/hot/poll?100', './src/main.ts'];
export const watch = true;
export const target = 'node';
export const externals = [
  nodeExternals({
    allowlist: ['webpack/hot/poll?100']
  })
];
export const module = {
  rules: [
    {
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }
  ]
};
export const mode = 'development';
export const resolve = {
  extensions: ['.tsx', '.ts', '.js']
};
export const plugins = [
  new HotModuleReplacementPlugin(),
  new WatchIgnorePlugin({
    paths: [/\.js$/, /\.d\.ts$/]
  }),
  new RunScriptWebpackPlugin({ name: 'main.js', autoRestart: false })
];
export const output = {
  filename: 'main.js',
  path: __dirname + '/dist'
};
