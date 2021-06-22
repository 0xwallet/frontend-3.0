# refactor-frontend-3

### 技术栈

typescript / vue3 / vue-router-next / vue-i18n / pinia(数据管理) / ant-design-vue2 / webpack / graphql

### 项目结构

```bash
├─@types #typescript 类型文件
├─apollo #关于 graphql 的所有函数
│  └─document
│      └─netFile
├─assets #logo 等资源
│  ├─images
│  └─svg
│      └─preview
├─components #公共组件
├─const #全局常量文件
├─hooks #公共hook
├─languages #国际化语言
├─router #路由
├─store #全局数据中心
├─utils #公共工具函数
└─pages #页面
    ├─General #一级菜单
    │  ├─Account #二级菜单
    │  ├─Metanet #二级菜单
    │  │  └─components #二级菜单组件
    │  └─Security
    └─Login
        └─components
```

### 项目命令

```bash
# 安装依赖
yarn install
# 开发项目(注意localhost:4000 端口,不然websocket 授权失败)
yarn serve
# 打包
yarn build
# 单元测试(todo)
yarn test:unit
# 格式检测
yarn lint
# 查看线上包的信息
yarn info [package_name]
# 查看本地安装包的信息
yarn list --pattern [package_name]
```

### 开发技巧

外部 JS 文件加载:

1. public/index.html 里 CDN 引入,然后通过全局引用,webpack 同时配置 externals
2. npm 安装

> 关于 nkn  
> package.json 中安装了依赖 nkn-sdk 然后拷贝其 nkn.min.js 到了 public 目录,  
> 并在 index.html 中手动引入
> webpack 中配置 externals => webpack 不会打包进来
> @types/nkn-sdk.d.ts 中声明了 nkn => typescript 编译器可以识别类型

```css
/* 在css中引入资源 */
background-image: url("~@/assets/svg/login-bg.svg");
```

```javascript
// 1. 路由懒加载的方法
{
  path: "/about",
  name: "About",
  // route level code-splitting
  // this generates a separate chunk (about.[hash].js) for this route
  // which is lazy-loaded when the route is visited.
  component: () =>
    import(/* webpackChunkName: "about" */ "../pages/About.vue"),
}
// 2. 不用引入 @apollo/client , 不然要装 react ! 引入 /core 就可以了
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
```
