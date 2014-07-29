---
layout: post
title:  "Automatic adjustment on color scheme"
date:   2013-09-15 07:54:23
---
Recently I am studying on how to create a color scheme automatically, so I collected some information related to color theory.
When we create a color scheme, we have full control on colors. How can we make sure the combination of the colors is harmony?
Let’s start with the basic.

<strong>Hue</strong>

There are three primary color(red, yellow, blue), and combinations of them, which can be described in a hue wheel:

![HueWheel](/images/2013-09-15-1.gif)

Colors on the opposite position =, e.g. red and green, are called complimentary colors. They make strong conflict with each other as we all know, but they are not necessary can not work well with each other, because colors have two other properties：

<strong>HSaturation</strong>

Saturation describe the strength of a color. Colors with low saturate have low contrast with each other.

![Saturation](/images/2013-09-15-2.png)

<strong>Value</strong>

Value describe the brightness of a color. The difference between so called light blue and dark blue is their value.

![Value](/images/2013-09-15-3.png)

Now we got the color space we called “HSV”. Although color space “RGB” we know it for better, but an rgb value is hard to understood by human.(But a “RGB” space can be easily displayed on a 2-dimension picture, so it’s wildly used on computers)


So what’s the secret of good looking color schemes?


Two main rules sounds simple and works well:

1. The relationship between colors’ hue.

The following is a harmonic templates on the hue wheel. A collection of colors that fall into the gray areas is considered to be harmonic. The templates may be rotated by an arbitrary angle. The harmony score can be calculated by formula (1), which adds up the distance between the hue of each pixel and the hue of the template.

![HueWheels](/images/2013-09-15-4.png)

![Formular](/images/2013-09-15-5.png)

2.The relationship between colors’ saturation and value.

Generally speaking, colors look good together when their values are varied, but their saturations are similar.
Let’s get some example and see what happens:

![Example](/images/2013-09-15-6.jpg)

The left scheme has the exactly same hues of the right scheme. But the left one has similar value for colors which makes people feel tired to see it. That is to say, they are all bright or all dark forcing your eyes struggle to find the defining line between each hue.

So if you want a nice color scheme,

1. Choose several dominant colors representing the style you need.

2. Adjust the hue of the dominant colors to some hue template given above.

3. Add other colors while keep align to the hue template.

4. Make the saturation of the colors to be similar and vary the value of the colors.

And see what happens.

Some example with “before” and “after” will be added soon. :D


Reference: “Color Harmonization,” by Daniel Cohen-Or et al., ACM Transactions on Graphics (TOG), Volume 25:3, July 2006. Proceedings of ACM SIGGRAPH 2006, pp. 624