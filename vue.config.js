module.exports = {
  publicPath: "./",
  outputDir: "docs",
  productionSourceMap: false,
  chainWebpack: config => {
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
  },
  devServer: {
    host: 'localhost',
    open: true,
    port: 4000,
    hot: true,
    hotOnly: false,
    proxy: {
      '/graphiql': {
        target: 'https://owaf.io/api',
        changeOrigin: true,
        secure: true,
        // ws: true,
        rewrite: (path) => path.replace(/^\/graphiql/, ''),
      },
    }
  }
}