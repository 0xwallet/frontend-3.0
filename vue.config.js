const name = 'vue-frontend';
module.exports = {
  publicPath: "./",
  outputDir: "dist",
  productionSourceMap: false,
  chainWebpack: config => {
    // config.plugins.delete('preload')
    // config.plugins.delete('prefetch')
    // app的title
    config.set('name', name)

    // https://webpack.js.org/configuration/devtool/#development
    config
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-eval-source-map')
      )
    config.resolve.extensions.store.add('less')
    // remove vue-cli-service's progress output
    config.plugins.delete('progress')
    // replace with another progress output plugin to solve the this bug:
    // https://github.com/vuejs/vue-cli/issues/4557
    config.plugin('simple-progress-webpack-plugin')
      .use(require.resolve('simple-progress-webpack-plugin'), [{
        format: 'compact'
      }])
  },
  devServer: {
    host: 'localhost',
    open: true,
    port: 4000,
    hot: true,
    hotOnly: false,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '/graphiql': {
        target: 'https://owaf.io/api',
        changeOrigin: true,
        secure: true,
        // ws: true,
        pathRewrite: (path) => path.replace(/^\/graphiql/, ''),
      },
    }
  }
}
