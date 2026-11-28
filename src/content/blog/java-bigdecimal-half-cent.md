---
title: '同一笔电费，Java为什么算出两个金额？'
description: '用同一笔充电费用比较double和BigDecimal在半分钱门槛两侧的舍入结果。'
publishDate: 2026-11-28T14:13:00+08:00
tags: ['Java EE', 'Java', 'BigDecimal', '浮点数', '金额舍入']
language: '中文'
draft: false
comment: false
---

在一个充电计费的小例子里，充了0.50度电，单价2.01元。纸上算出1.005元，按四舍五入保留到分，应付1.01元。但先用`double`相乘，再交给`BigDecimal`舍入，这次得到的是1.00元。

## 1. 先看舍入前的数

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

class HalfCent {
    public static void main(String[] args) {
        String energy = "0.50", price = "2.01";
        BigDecimal exact = new BigDecimal(energy).multiply(new BigDecimal(price));
        double product = Double.parseDouble(energy) * Double.parseDouble(price);

        for (BigDecimal amount : new BigDecimal[] {
                exact, new BigDecimal(product), BigDecimal.valueOf(product)
        }) {
            System.out.println(amount + " -> " + amount.setScale(2, RoundingMode.HALF_UP));
        }
    }
}
```

在独立的OpenJDK 21示例中，三种写法得到：

```text
1.0050 -> 1.01
1.00499999999999989341858963598497211933135986328125 -> 1.00
1.005 -> 1.01
```

![同一笔金额用十进制字符串或double计算，在半分钱门槛两侧得到不同结果。](/images/blog/java-bigdecimal-half-cent/half-cent-mindmap.png)

## 2. 差的不是舍入规则，是输入

这三行都用了`HALF_UP`。对这笔正金额，1.005元刚好是从1.00元进到1.01元的门槛。`double`能精确表示0.50，但不能精确表示2.01。乘法得到的二进制近似值略低于1.005，而`new BigDecimal(product)`忠实保留了这个近似值。它没有把1.005舍错，而是根本没收到精确的1.005。

`BigDecimal.valueOf(product)`这次又得到了1.01，因为它通过`Double.toString`转换，而这个`double`恰好显示为`1.005`。这只是本例的结果，不能靠它把之前用`double`算出的金额还原成原始十进制值。[Java BigDecimal文档](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html)

## 3. 金额从入口就用十进制

如果原始值来自表单，就从十进制字符串建`BigDecimal`；如果来自数据库的`DECIMAL`列，可以用JDBC的`getBigDecimal`读取。中间保持十进制运算，到计费规则指定的步骤再明确精度和舍入方式。

这也和事务是两回事。事务能保证扣余额和写账单一起成功或失败，却不会替程序发现这笔金额少算了一分。
