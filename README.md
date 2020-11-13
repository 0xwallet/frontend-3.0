# frontend

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

<!-- ### Customize configuration -->
<!-- See [Configuration Reference](https://cli.vuejs.org/config/). -->
### 项目规范
- public：存放静态html
- src：项目根目录
- assets： 图片，视频，字体等资源存放文件夹
- components：公用类组件存放处
  - enum：ts相关枚举类文件夹
  - graphql：graphql相关api存放处
  - hooks：创建各种副作用变量的hook存放处
  - i18n：国际化相关资源存放处
  - layout：页面整体布局文件夹
  - plugins：vue实例化使用的插件
  - router：路由相关
  - store：全局状态管理相关
  - styles：全局样式相关
  - types：ts声明文件定义
  - utils：公共工具包
  - views：主体页面
- .browserslistrc：定义postcss和babel应该兼容的浏览器
- .env.development：定义开发环境变量
- .env.production：定义生产环境变量
- .eslintrc.js：代码格式化规则
- .gitignore：git不会上传的文件目录
- package.json：定义脚本命令和安装的库
- package-lock.json：定义库之间的关联
- postcss.config.js：定义css转换规则
- prettier.config.js：定义代码美化规则
- tsconfig.json：定义ts和tsx文件的规范
- vue.config.js：定义项目打包编译规则
## Git 提交规范

- 参考 [vue](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md) 规范 ([Angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular))

  - `feat` 增加新功能
  - `fix` 修复问题/BUG
  - `style` 代码风格相关无影响运行结果的
  - `perf` 优化/性能提升
  - `refactor` 重构
  - `revert` 撤销修改
  - `test` 测试相关
  - `docs` 文档/注释
  - `chore` 依赖更新/脚手架配置修改等
  - `workflow` 工作流改进
  - `ci` 持续集成
  - `types` 类型定义文件更改
  - `wip` 开发中

## 代码贡献

1. Fork 代码!
2. 创建自己的分支: `git checkout -b feat/xxxx`
3. 提交你的修改: `git commit -am 'feat(function): add xxxxx'`
4. 推送您的分支: `git push origin feat/xxxx`
5. 提交`pull request`

## 已完成功能

- [x] 项目搭建（基于 webpack）
- [x] 登录和注销

## 正在开发的功能

- [ ] 动态权限路由
- [ ] 路由动态菜单
- [ ] 网盘上传功能
