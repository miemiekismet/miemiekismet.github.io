---
layout: post
title:  "Automatic adjustment on color scheme"
date:   2014-07-30 14:52:23
---

I found such a problem when I played with cocos2d-js:

{% highlight javascript %}
for (var i in goods_today) {
	var cur_good = goods_today[i];
	var good_label = cc.LabelTTF.create(goods_name[cur_good] + ":" + prices_today[i], "Arial", 20);
	var good_item = cc.MenuItemLabel.create(good_label, function() {this.buyIn(cur_good);}, that);
	market_list.addChild(good_item);
}
{% endhighlight %}

It turned out that every MenuItemLabel got the last value of cur_good for its parameter for buyIn.

For example, in "for" loop, cur_good got value 0, 1, 2, 3, but when I click these four MenuItemLabels, they all called buyIn(3).

To explain the problem, there are two principles should be explained first.

<strong>1.Scope</strong>

{% highlight javascript %}{}, if(){}, for(){}{% endhighlight %} does not mean a scope in javascript, only function(){} give us a scope.
e.g.
{% highlight javascript %}
var name="global";  
if(true){  
    var name="local";  
    alert(name);
}  
alert(name);
{% endhighlight %}
Both alert will give us "local", because if(){} does not make var "local" a local variable, so "global" is overwrited.

So
for (var i in goods_today){}
equals to
var i;
for (i in goods_today)

<strond>2.Scope Chain</strond>
The following codes explain how functions find variables.
when b() executes, it follows the sequence of b()->a()->window, b() find name in b(), and output "Scope3"
when c() executes, it follows the sequence of c()->a()->window, c() can not find name in c(), but find name in a(), and output "Scope2"
{% highlight javascript %}
var name = "Scope1";
function a() {
	var name = "Scope2";
	function b() {
		var name = "Scope3";
		alert(name);
	}
	function c() {
		alert(name);
	}
	b();	//-->"Scope3"
	c();	//-->"Scope2"
}
a();
{% endhighlight %}

That explains why I got 4 "buyIn(3)" 

So I need to put these codes into a function to create a scope:
{% highlight javascript %}
for (var i in goods_today) {
	(function(that, good){
		var cur_good = goods_today[good];
		var good_label = cc.LabelTTF.create(goods_name[cur_good] + ":" + prices_today[idx], "Arial", 20);
		var good_item = cc.MenuItemLabel.create(good_label, function() {this.buyIn(cur_good);}, that);
		market_list.addChild(good_item);
	})(this, i)
}
{% endhighlight %}
Now it works well~