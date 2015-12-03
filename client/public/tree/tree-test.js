factories.factory('d3Factory', d3Service);

d3Service.$inject =  ['$document', '$q', '$rootScope'];

function d3Service($document, $q, $rootScope) {

  function expand(d){
      var children = (d.children)?d.children:d._children;
      if (d._children) {
          d.children = d._children;
          d._children = null;
      }
      if(children)
        children.forEach(expand);
  }
  //took out of drawTree because not using in there, only being called in collapse all
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  //trial way with passing in repo, but same as root?
  function expandAll(repo){
    // JSON.parse(repo)
    console.log('expand')
    expand(repo);
    update(repo);
  }
  //trial way with passing in repo, but same as root?
  function collapseAll(repo){
    // JSON.parse(repo)
    repo.children.forEach(collapse);
    collapse(repo);
    update(repo);
  }

  //old way
  function expandAll(){
    expand(root);
    update(root);
  }

  //old way
  function collapseAll(){
    root.children.forEach(collapse);
    collapse(root);
    update(root);
  }

var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

function drawTree(repo){

  var i = 0,
      duration = 750,
      root;

  var tree = d3.layout.tree()
      .size([height, width]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("#repo-tree").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  root = JSON.parse(repo);
  console.log('root in drawTree: '+root)
  root.x0 = height / 2;
  root.y0 = 0;

  function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("click", click)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        .text(function(d) { return d.name; })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }//end update

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    console.log(d)
    update(d);
  }

  function mouseover(d) {
    d3.select(this).append("text")
      .attr("class", "hover")
      .attr('transform', function(d){
          return 'translate(5, -10)';
      })
      .text(d.name + ": " + d.id);
  }

  // Toggle children on click.
  function mouseout(d) {
      d3.select(this).select("text.hover").remove();
  }


  update(root);

  // d3.select(self.frameElement).style("height", "800px");
}
  var service = {
    drawTree: drawTree,
    expandAll: expandAll,
    collapseAll: collapseAll
  };

  return service;
}
