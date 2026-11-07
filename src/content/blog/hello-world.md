---
title: '你好，博客'
description: '从这里开始，慢慢积累。'
publishDate: 2026-11-07
tags: ['博客']
language: '中文'
comment: false
---

这是这个博客的第一篇文章，也是一份简短的使用说明。

## 从这里开始

这里使用 Astro Theme Pure 主题，内容用 Markdown 编写，由 GitHub Actions 自动构建并发布到 GitHub Pages。

正文可以是技术笔记，也可以是日常记录。暂时不急着填满，先留下一个可以持续写作的地方。

## 写一篇新文章

在仓库的 `src/content/blog/` 目录中新建 Markdown 文件，例如 `my-first-post.md`。文件开头写上：

```yaml
---
title: '文章标题'
description: '一句话介绍这篇文章。'
publishDate: 2026-11-07
tags: ['随笔']
draft: false
comment: false
---
```

接下来就是正文。提交到 `main` 分支后，网站会自动更新。

本地也可以运行 `npm run new -- my-first-post` 创建草稿。准备好发布时，把 `draft: true` 改为 `draft: false`。

## 慢慢积累

第一篇先写到这里。下一篇，留给新的发现。
