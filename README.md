# 星闌的博客

地址：https://xinglan233.github.io

基于官方 [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) 4.1.6 模板与 `astro-pure` 1.4.9，使用 Astro 6、中文界面、系统字体、明暗主题、Pagefind 本地全文搜索、RSS 与 Sitemap。

## 本地预览

需要 Node.js 22.12+（推荐 Node.js 24）。

```sh
npm ci
npm run dev
```

## 写文章

- 最简单：在 GitHub 打开 `src/content/blog/`，点击 Add file → Create new file，创建 `文章英文名.md`。
- 本地创建：`npm run new -- my-first-post`。默认是草稿，不会公开到网站。
- 新文章格式：

```md
---
title: '文章标题'
description: '一句话摘要。'
publishDate: 2026-11-07
tags: ['随笔']
draft: false
comment: false
---

这里开始写正文。
```

把日期改为实际发布日期。`draft: true` 会隐藏文章；草稿仍在公开仓库中，不要写入秘密或隐私。添加本地图片时，可用同名文件夹放 `index.md` 和图片，以 `![说明](./photo.jpg)` 引用。

提交到 `main` 后，GitHub Actions 会自动构建和部署。可在仓库 Actions 中看结果。

## 修改主页

- 站点标题、描述、导航、社交链接：`src/site.config.ts`
- 首页：`src/pages/index.astro`
- 关于：`src/pages/about/index.astro`
- 颜色与字体：`src/assets/styles/app.css`

目前未开启评论、访问统计或外部随机语录，也不需要额外的 API 密钥。

## 验证生产构建

```sh
npm run build
npm run preview
```

搜索索引在构建时生成，开发模式下不启用。

## 部署设置

仓库 Settings → Pages → Source 选择 GitHub Actions。工作流使用 GitHub 自动提供的临时 `GITHUB_TOKEN`，不需要创建或保存个人访问令牌。构建完成后由 deploy job 发布 `dist`。

## 主题许可与修改记录

原始主题由 CWorld / Pure Lab 维护，采用 Apache-2.0；保留 `LICENSE` 与下方署名。本站在官方模板基础上改为中文、静态 GitHub Pages 部署，移除示例文章、虚构履历、捐赠与第三方评论服务，加入简洁首页和写作脚本。

Upstream: https://github.com/cworld1/astro-theme-pure
Template commit: ed7d65b424333271955ba2ff8e9d8832a6bbdfb4
