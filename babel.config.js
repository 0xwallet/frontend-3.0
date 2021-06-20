module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  // ant-design-vue 按需引入
  plugins: [
    [
      "import",
      { libraryName: "ant-design-vue", libraryDirectory: "es", style: "css" },
    ], // `style: true` 会加载 less 文件
  ],
};
