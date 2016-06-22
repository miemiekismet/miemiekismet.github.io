
var margin = {top: 30, right: 0, bottom: 0, left: 0},
    width = 960,
    height = 500 - margin.top - margin.bottom,
    formatNumber = d3.format(",d"),
    transitioning;

var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

var treemap = d3.layout.treemap()
    .children(function(d, depth) { return depth ? null : d._children; })
    .sort(function(a, b) { return b.value - a.value; }) // Small ones on the top.
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
    .round(false);

var svg = d3.select("#map").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");

var disable_layer = d3.select("#fighting_layer")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .attr("z-index", 1)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");
var grandparent = svg.append("g")
    .attr("class", "grandparent");

grandparent.append("rect")
    .attr("y", -margin.top)
    .attr("width", width)
    .attr("height", margin.top);

grandparent.append("text")
    .attr("x", 9)
    .attr("y", 9 - margin.top)
    .attr("dy", "1em");

d3.json("map.json", function(root) {
  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

  function initialize(root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  function accumulate(d) {
    return (d._children = d.children)
        ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
        : d.value;
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d._children) {
      treemap.nodes({_children: d._children});
      d._children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {
    var hero_level = GetHeroLevel();
    if (d.parent) {
      grandparent
          .datum(d.parent)
          .on("click", transition)
        .select("text")
          .text("你在:[" + name(d) + "] 点击回到:[" + name(d.parent) + "]");
    } else {
      grandparent
          .datum(d.parent)
          .on("click", transition)
        .select("text")
          .text("你在:[" + name(d) + "]");
    }

    var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d._children)
      .enter().append("g");

    g.filter(function(d) { return d._children; })
        .classed("children", true)
        .on("click", transition);

    g.filter(function(d) { return !d._children && d.type == "MONSTER";})
        .classed("children", true);
    g.filter(function(d) { return !d._children && d.type == "MONSTER" && d.required_level <= hero_level; })
        .classed("locked", false)
        .on("click", function(d) {
          Fight(d, transition);
        });

    g.filter(function(d) { return !d._children && d.type == "ITEM";})
        .classed("children", true)
        .classed("item", true)
        .on("click", function(d) {
          Purchase(d, transition);
        });

    g.filter(function(d) { return d.beaten; })
        .classed("beaten", true);

    g.selectAll(".child")
        .data(function(d) { return d._children || [d]; })
      .enter().append("rect")
        .attr("class", "child")
        .call(rect);

    g.append("rect")
        .attr("class", "parent")
        .call(rect)
      .append("title")
        .text(function(d) { return formatNumber(d.value); });

    // Top layer: text, images.
    g.filter(function(d) {return !d._children && d.type == "ITEM" && d.ITEM_TYPE == "ATK";})
        .classed("locked", true)
        .append("image")
        .attr("xlink:href", "sword.png")
        .call(image);
    g.filter(function(d) {return !d._children && d.type == "ITEM" && d.ITEM_TYPE == "DEF";})
        .classed("locked", true)
        .append("image")
        .attr("xlink:href", "shield.png")
        .call(image);
    g.filter(function(d) {return !d._children && d.type == "ITEM" && d.ITEM_TYPE == "HP";})
        .classed("locked", true)
        .append("image")
        .attr("xlink:href", "hp.png")
        .call(image);

    g.filter(function(d) { return !d._children && d.type == "MONSTER" && d.required_level > hero_level; })
        .classed("locked", true)
        .append("image")
        .attr("xlink:href", "locked.png")
        .call(image);
    g.filter(function(d) { return !d._children && d.type == "MONSTER" && d.required_level <= hero_level; })
        .classed("unlocked", true)
        .append("image")
        .attr("xlink:href", "unlocked.png")
        .call(image);
    g.append("text")
        .attr("dy", ".75em")
        .text(function(d) {
          if (d._children) {
            return d.name;
          } else if (d.type == "MONSTER") {
            return d.name + " HP: " + d.value;
          } else if (d.type == "ITEM") {
            return d.name + " +" + d["ITEM_TYPE"] + ": " + d["ITEM_VALUE"] + " PRICE: $" + d.value;
          }
        })
        .call(text);

    function transition(d, disable_dur) {
      // disable_dur got 1 in on click case(extra param for mysterious usage), so we explicitly check === true here.
      var duration_time = disable_dur === true ? 0 : 750;
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(duration_time),
          t2 = g2.transition().duration(duration_time);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);
      // Fade-in images.
      g2.selectAll("image").style("opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);
      t1.selectAll("image").call(image).style("opacity", 0);
      t2.selectAll("image").call(image).style("opacity", 1);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }

    return g;
  }

  function text(text) {
    text.attr("x", function(d) { return x(d.x) + 30; })
        .attr("y", function(d) { return y(d.y) + 13; });
  }

  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
  }

  function image(image) {
    image.attr("x", function(d) { return x(d.x) + 6; })
         .attr("y", function(d) { return y(d.y) + 6; })
         .attr("width", function(d) { return 20; })
         .attr("height", function(d) { return 20; });
  }

  function name(d) {
    return d.parent
        ? name(d.parent) + " / " + d.name
        : d.name;
  }
});
