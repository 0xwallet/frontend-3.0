/* eslint-disable */
const ContextReplacementPlugin = require("webpack/lib/ContextReplacementPlugin");

module.exports = {
  devServer: {
    port: 4000,
  },
  configureWebpack: (config) => {
    const isEnv = process.env.NODE_ENV === "development";
    // 不生成 sourceMap
    if (!isEnv) config.devtool = "none";
    // key 是import .. from 'vue' 的 'vue'
    // value 是 window.Vue (也就是 js 文件中的 var Vue)
    config.externals = {
      nkn: "nkn",
      vue: "Vue",
      "vue-router": "VueRouter",
      "vue-i18n": "VueI18n",
    };
    config.optimization.splitChunks.cacheGroups.antd = {
      name: "chunk-antd",
      test: /[\\/]node_modules[\\/]ant-design-vue[\\/]/,
      chunks: "all",
      priority: -7,
      reuseExistingChunk: true,
      enforce: true,
    };
  },
  // 国际化语言配置
  chainWebpack: (config) => {
    config
      .plugin("ignore")
      .use(ContextReplacementPlugin, [
        /moment[/\\]locale$/,
        /(zh-cn)|(en-gb)$/,
      ]);
  },
};
