/**
 * Hot Module Replacement (HMR) para NestJS em Docker dev.
 * Receita oficial: https://docs.nestjs.com/recipes/hot-reload
 * Invocado pelo Nest CLI (`nest build --webpack --webpackPath ...`): recebe
 * (options, webpack) e estende a config padrão do CLI.
 * Lock-in: webpack 5.x — `HotModuleReplacementPlugin` é interno ao webpack 5.
 * Em uma futura migração para webpack 6, conferir a receita oficial atualizada.
 */
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({
        name: options.output.filename,
        autoRestart: false,
      }),
    ],
  };
};
