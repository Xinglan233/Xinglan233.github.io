---
title: '同一个汉字，为什么分两次读取就乱码了？'
description: '同一个汉字的UTF-8字节分在两块时，为什么单独解码会乱码？用三个字节看懂流式解码和输入结束。'
publishDate: 2026-11-25T12:04:00+08:00
tags: ['计算机网络', 'UTF-8', '字符编码', '流式解码']
language: '中文'
draft: false
comment: false
---

「开」用UTF-8编码是三个字节：`E5 BC 80`。如果一次只读到`E5 BC`，下一次才读到`80`，原始数据一点没丢。但把每块单独解码，最后看到的却是两个`�`。问题不在编码选错了，而在于把「这次读完了」当成了「后面没有了」。

## 1. 字节块不等于字符

`E5`是一个三字节序列的开头。第一块的`E5 BC`只给了前两个字节，还不能拼出「开」。第二块的`80`是续字节，单独出现也不是完整字符。默认的`decode()`把每次传入的数据当作一次完整输入，所以这两次各输出一个替换字符`�`。

```js
const first = Uint8Array.of(0xe5, 0xbc);
const second = Uint8Array.of(0x80);
const decoder = new TextDecoder();

console.log(decoder.decode(first));  // �
console.log(decoder.decode(second)); // �
```

[![把「开」的UTF-8字节E5 BC和80分开解码，两块各输出一个替换字符；同一解码器流式处理时先返回空字符串，收到80后输出「开」。只收到E5 BC便到末尾时，默认收尾输出替换字符，严格模式抛出TypeError。](/images/blog/utf8-character-split-across-chunks/utf8-character-split-across-chunks.png)](/images/blog/utf8-character-split-across-chunks/utf8-character-split-across-chunks.png)

## 2. 让同一个解码器接着读

用同一个`TextDecoder`，在每一块上设置`stream: true`。第一块暂时没有字符可输出，返回空字符串。第二块到达后，解码器接着上一块的状态处理，于是输出「开」。确认没有下一块时，再调用一次不带参数的`decode()`收尾。

```js
const streaming = new TextDecoder();
let text = streaming.decode(first, { stream: true });   // ""
text += streaming.decode(second, { stream: true });     // "开"
text += streaming.decode();                            // ""
console.log(text);                                   // 开
```

这里保留的是解码状态，不是等到整个文件收齐才一次性处理。能解出来的文字会先返回，块末尾还没凑齐的序列才留到下一次。

## 3. 真少了一个字节呢？

如果只收到`E5 BC`，随后输入真的结束，流式调用仍然先返回空字符串。区别出现在最后的`decode()`：默认模式输出一个`�`，而用`new TextDecoder("utf-8", { fatal: true })`创建的严格解码器会在这个例子里抛出`TypeError`。[WHATWG Encoding标准](https://encoding.spec.whatwg.org/#interface-textdecoder)

读到半个字时，空字符串不是错误，也不是处理完成。只要还有下一块，最后一个字节就可能补上。真的到末尾了，才知道它到底有没有来。
