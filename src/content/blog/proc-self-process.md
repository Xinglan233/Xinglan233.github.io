---
title: '`/proc/self`里的self，到底指谁？'
description: '用三条Bash命令看清Linux里哪个进程打开了/proc/self。'
publishDate: 2026-11-27T12:56:00+08:00
tags: ['操作系统', 'Linux', 'procfs', '进程', 'Bash']
language: '中文'
draft: false
comment: false
---

在Bash里敲下`cat /proc/self/comm`，很容易把`self`理解成「这个终端里的Bash」。但按Linux的规则，这条命令通常会读到`cat`。把读取换成Bash内建命令，又会读到`bash`。路径没变，变的是打开文件的进程。

## 1. self不是终端的名字

`/proc`是Linux用来展示进程和内核信息的文件系统。`/proc/self`是个特殊的符号链接，进程访问它时，Linux会把它解析到该进程自己的`/proc/<PID>`目录。它不看是谁在键盘上输入命令，只看哪个进程在访问这条路径。[Linux `proc_pid(5)`](https://man7.org/linux/man-pages/man5/proc_self.5.html) · [Linux内核的proc文档](https://docs.kernel.org/filesystems/proc.html)

这次只读`comm`。它给出一个简短的进程名，不是完整命令行，进程也能改这个名字。所以这里用它对照`bash`和`cat`，不拿它当进程身份的唯一凭据。[Linux `proc_pid_comm(5)`](https://man7.org/linux/man-pages/man5/proc_pid_comm.5.html)

![三次读取对照：Bash内建读取的self指向Bash，cat直接读取时的self指向cat，cat读取显式Bash PID时得到Bash。](/images/blog/proc-self-process/proc-self-mindmap.png)

## 2. 用同一个Bash终端读三次

在普通现代Linux的交互式Bash里，逐行输入下面三行。第一行用内建`read`读取，再用内建`printf`打印。例子不需要安装其他工具或创建文件。

```bash
IFS= read -r shell_name < /proc/self/comm; printf '%s\n' "$shell_name"
command cat /proc/self/comm
command cat "/proc/$$/comm"
```

在Linux 6.18.57、Bash 5.2.37的独立演示环境中，实测输出依次是：

```text
bash
cat
bash
```

第一行里，重定向`< /proc/self/comm`由Bash处理。Bash打开路径，`self`就指向Bash。第二行把路径作为参数交给外部程序`cat`，由`cat`打开，`self`就指向`cat`。第三行还是`cat`打开文件，但Bash先把`$$`展开为自己的PID，交给`cat`的已经是一个明确的`/proc/<PID>/comm`，这次没有`self`需要解析。[GNU Bash特殊参数](https://www.gnu.org/software/bash/manual/html_node/Special-Parameters.html)

## 3. 先看是谁打开的，再看路径写了什么

对这三行来说，最容易混淆的是第二行和第三行。它们都由`cat`读，前者问「读文件的进程是谁」，后者问「这个指定PID的进程叫什么」。下次看到`/proc/self`出现在管道、重定向或命令参数里，可以先找实际打开路径的那一步，而不是直接把`self`换成熟悉的进程名。

这个例子针对现代Linux。这里用的`/proc/<PID>/comm`从Linux 2.6.33起提供，不能把这三行原样搬到Linux 0.11实验里。
