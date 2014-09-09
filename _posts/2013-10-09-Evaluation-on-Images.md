---
layout: post
title:  "Evaluation on Images"
date:   2013-10-09 07:54:23
---

I implement an interesting tool to calculate the harmony of pictures.

It is based on the algorithm described in former post

It can used to compare two similar pictures,

e.g.

1. Two color scheme for the webpage you created

2. A photo before & after adjustment

There is little meaning for compare the score for two absolutely different picture.

Ok, let have a look at the demo evaluation page.

Lower score indicates better performance.

[Evaluation Page for Picture’s Harmony Score!](/res/Image%20Harmony%20Evaluation.html)

The first two pairs of examples is provided by the paper which propose this algorithm, it appears that pictures keep align to the theory do have better(aka lower) score. Pictures with lower scores do look better than the ones with higher scores.

But

1.The ones have score 0 doesn’t necessary have a perfect performance because there are still difference for pictures keep align to the hue wheel which can be study for more.

2.The most harmony ones are not necessary the attractive ones. Some ugly ones might got more attention.

It remind me of the following joke…

![Joke](/images/2013-10-09.jpg)