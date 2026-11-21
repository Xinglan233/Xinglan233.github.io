---
title: '后选的文件，为什么会被先选的覆盖？'
description: '先选A再选B，为什么最后又显示了A？用操作编号区分当前结果和过期结果，再用可控制完成顺序的Promise验证。'
publishDate: 2026-11-21T14:58:00+08:00
tags: ['JavaScript', '异步', '文件导入', '竞态条件', '软件测试']
language: '中文'
draft: false
comment: false
---

假设页面上有一个文件选择框，选中文本文件后，就把内容放进可编辑的预览区。先选A，发现选错了，又选B。B的内容已经显示出来，过了一会儿，预览却变回了A。

文件没有选反，问题出在两个顺序不一样：用户选择文件的顺序，和程序读完文件的顺序。

[![先选A后选B，B先读完；操作编号防止A的迟到结果或错误覆盖较新的选择或手动编辑](/images/blog/async-file-import-operation-order/async-file-import-operation-order.png)](/images/blog/async-file-import-operation-order/async-file-import-operation-order.png)

## 1. 先开始，不一定先完成

浏览器中的文件对象可以用`file.text()`读取文本。它返回一个Promise，可以把它理解成“稍后会得到读取结果”。`await`会让这次函数调用等到结果出来，再继续执行后面的语句。[W3C File API草案](https://w3c.github.io/FileAPI/#dom-blob-text)

但等待A的这次调用，不会阻止用户再次选择B，触发另一次读取。如果每次读完都直接更新预览，就可能出现这样的过程：

```text
选择顺序：选A → 选B
完成顺序：B读完，显示B → A读完，显示A
```

从程序看，两次读取都成功了。从用户看，最后选的是B，页面却显示A。

这是一种竞态条件：结果取决于几件事情完成的先后顺序。这里不需要两段JavaScript同时修改变量，只要两次异步操作交错完成，就可能覆盖错内容。React官方文档也用网络响应说明了类似问题：发出的顺序和返回的顺序可能不同，因此旧结果需要被忽略。[React异步请求示例](https://react.dev/reference/react/useEffect#fetching-data-with-effects)

## 2. 更新之前，核对这是不是最新操作

先明确这个页面的规则：以最近一次选择或手动编辑为准，旧读取不能覆盖较新的操作。

可以用一个递增编号记录这个规则。每次开始读取，先增加编号，并保存属于本次读取的那一份。等结果回来，只有编号仍然相同，才更新预览。

下面用`state.preview`和`state.error`代表页面要显示的内容，省略具体的界面绑定：

```js
let operation = 0;
const state = { preview: "", error: "" };

async function importFile(file) {
  const mine = ++operation;
  state.error = "";
  try {
    const text = await file.text();
    if (mine !== operation) return;
    state.preview = text;
  } catch {
    if (mine !== operation) return;
    state.error = "读取失败";
  }
}

function edit(text) {
  ++operation;
  state.preview = text;
  state.error = "";
}
```

选择A时，A记住编号1。再选B，当前编号变成2。A无论何时完成，看到自己的1已经不是当前的2，就不能再改预览。

失败分支也要检查。否则，B已经读入成功，A稍后才报错，页面仍会突然出现“读取失败”，让人误以为B没有导入成功。

手动编辑同样会增加编号。例如，选A后还没读完，用户已经在预览区写了新内容，那么A回来时也应该被忽略。这里保护的是较新的用户操作，不只是较新的文件选择。

这个办法没有取消底层读取，只是不再采用过期结果。`Blob.text()`没有接收取消信号的参数，不能把操作编号当成取消接口。如果以后增加“读取中”的提示，结束提示前也要核对编号，避免A先结束就关掉B的等待状态。

## 3. 测试要能改变完成顺序

只按“选A、等A读完、再选B”的顺序测试，看不出这个问题。让测试偶尔等几十毫秒，也不如直接控制哪次读取先完成清楚。

可以准备一个暂时不结束的Promise，把它的成功和失败入口留给测试：

```js
function deferred() {
  let resolve, reject;
  const promise = new Promise((ok, fail) => {
    resolve = ok;
    reject = fail;
  });
  return { promise, resolve, reject };
}

const a = deferred();
const b = deferred();
const taskA = importFile({ text: () => a.promise });
const taskB = importFile({ text: () => b.promise });

b.resolve("B");
await taskB;
a.resolve("A");
await taskA;
console.assert(state.preview === "B");
```

这里传进去的不是磁盘上的真实文件，而是一个只提供`text()`方法的测试对象。它让测试明确安排“B先成功，A后成功”，而不是赌哪份文件读得更慢。

还需要另外两组检查，每组都从新的状态开始：

- 先开始读A，再调用`edit("手动修改")`，最后让A成功。预览应当保持“手动修改”。
- 先开始读A和B，让B成功，再用`a.reject(new Error("测试错误"))`让A失败。预览应当仍是B，错误提示应当为空。

在独立示例中去掉编号检查，第一组会变回A，第二组会丢掉手动修改，第三组会留下过期错误。加入检查后，三组分别保留B、手动修改，以及没有旧错误的B。

这些测试检查的是结果更新规则，不代替浏览器里的真实文件选择和读取测试。回到页面上，还可以检查一件具体的事：现在看到的内容和提示，究竟属于哪一次用户操作？
