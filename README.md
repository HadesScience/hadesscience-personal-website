# HadesScience · Personal Exploration Program

个人主页，采用低饱和深色配色、构成主义排版与航天图形。

站点：https://hadesscience.github.io/hadesscience-personal-website/

## 发布

GitHub Pages 从 `main` 分支的根目录自动部署。修改网页后提交即可，无需安装依赖或构建。`.nojekyll` 保持静态文件原样发布。

- `index.html`：页面内容与导航。
- `styles.css`：响应式布局、矿物色调与动画。
- `script.js`：导航、面板切换、搜索、动效开关。
- `guestbook.js`：公开留言读取、刷新与分页。
- `assets/`：本地字体、字体许可证与图标。

## 留言板

留言保存在 [Guestbook Issue #1](https://github.com/HadesScience/hadesscience-personal-website/issues/1) 的评论中。

访客在网页点击「用 GitHub 账号留言」，登录 GitHub 后发表评论。网页读取真实的公开评论，发布后点击「刷新留言」即可看到。站长可在 GitHub 中管理评论；访客可编辑、删除自己的评论。

页面不保存访问令牌、密码或其他密钥。留言按时间顺序分页读取，每页 20 条；评论正文按纯文本显示。公共 API 可能触发限流，届时页面提供重试说明与原始讨论入口。没有安装第三方评论应用，也不依赖额外服务器。

动画可通过页面的「暂停动效」开关关闭，并遵循系统的减少动态效果设置。

本地字体为 Nimbus Sans Narrow Bold 子集；许可证位于 `assets/FONT-LICENSE.txt`。
