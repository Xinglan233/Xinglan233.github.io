---
title: '文件还在，为什么暂存的改动没了？'
description: '同一个文件可以同时有已暂存和未暂存的改动。用两份 diff 看清它们，并验证脚本不会打乱原有暂存状态。'
publishDate: 2026-11-19T17:31:00+08:00
tags: ['软件工程', '版本控制', 'Git', '暂存区', '工作区']
language: '中文'
draft: false
comment: false
---

[![文件还在，为什么暂存的改动没了？](/images/blog/git-staging-area-and-working-tree/git-staging-area-and-working-tree-mindmap.png)](/images/blog/git-staging-area-and-working-tree/git-staging-area-and-working-tree-mindmap.png)

1. 同一个文件，可以同时有两版改动。先改一段代码，执行`git add`，再接着改第二段。这时`git diff --cached`能看到第一段，`git diff`能看到第二段。打开编辑器看见两段都在，不代表它们都已经暂存。

2. 这也是我排查一个资源统计脚本时遇到的情况。脚本为了扫描文件，先用`git add`改动暂存区，最后又把暂存区重置到上一次提交。文件本身没丢，但我原先选好的那一版不再处于暂存状态。如果直接把整个文件重新暂存，后加的内容也会一起进下一次提交。

3. 对只想统计文件的脚本，更合适的做法是用临时索引，不碰用户正在用的暂存区。测试也不能只看脚本有没有输出结果：先特意留下未暂存和已暂存的不同改动，跑完后再分别检查两份差异，才能确认脚本没有打乱原来的提交安排。
