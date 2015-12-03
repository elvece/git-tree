
factories.factory('d3Factory', d3Service);

d3Service.$inject =  ['$document', '$q', '$rootScope'];

function d3Service($document, $q, $rootScope) {

    var d = $q.defer();

    // *** async load of d3 library *** //
    function onScriptLoad() {
      // Load client in the browser
      $rootScope.$apply(function() {
        d.resolve(window.d3);
      });
    }
    // Create a script tag with d3 as the source and call onScriptLoad callback when it has been loaded
    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = '//cdnjs.cloudflare.com/ajax/libs/d3/3.5.10/d3.min.js';
    scriptTag.onreadystatechange = function () {
      if (this.readyState === 'complete') {
        onScriptLoad();
      }
    };
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    //global toggle of tree

    // function ToggleTree() {
    //   console.log('toggle')
    //   this.expand = null;
    //   this.collapse = null;
    //   return { expand: this.expand,
    //            collapse: this.collapse
    //          };
    // }

    // *** creates tree *** //
    function drawTree(data){
      console.log('in draw tree, root not available')
      d3().then(function(d3) {
        console.log('in then, root undefined because not defined yet')

        var margin = {top: 0, right: 120, bottom: 20, left: 58},
            width = 1200 - margin.right - margin.left,
            height = 800 - margin.top - margin.bottom;

        var i = 0,
            duration = 750,
            root;

        var colors = ["#bd0026", "#fecc5c", "#fd8d3c", "#f03b20", "#B02D5D",
            "#9B2C67", "#982B9A", "#692DA7", "#5725AA", "#4823AF",
            "#d7b5d8", "#dd1c77", "#5A0C7A", "#5A0C7A"];

        var tree = d3.layout.tree()
            .size([height, width]);

        var circles = {};
        var paths = {};
        var labels = {};

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var svg = d3.select("#repo-tree").append("svg")
          .attr("width", width + margin.right + margin.left)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          // console.log('d3factory data: '+data)
          root = JSON.parse(data);
          // root = test;

          root.x0 = height / 2;
          root.y0 = 0;

          function collapse(d) {
            console.log(d)
            if (d.children) {
              d._children = d.children;
              // console.log('d._children: '+JSON.stringify(d._children))
              // console.log('d.children: '+JSON.stringify(d.children))
              d._children.forEach(collapse);
              d.children = null;
            }
          }

          root.children.forEach(collapse);
          update(root);
        // });

        d3.select(self.frameElement).style("height", "500px");

        function update(source) {

          // Compute the new tree layout.
          var nodes = tree.nodes(root).reverse(),
              links = tree.links(nodes);

          var depthCounter = 0;

          // Normalize for fixed-depth.
          nodes.forEach(function(d) {
            d.y = d.depth * 180;
            //sets link color
            if (d.depth == 1) {
              d.linkColor = colors[(depthCounter % (colors.length - 1))];
              depthCounter++;
            }
          });

          //Set link colors based on parent color
          nodes.forEach(function (d) {
              var obj = d;
              while ((obj.source && obj.source.depth > 1) || obj.depth > 1) {
                  obj = (obj.source) ? obj.source.parent : obj.parent;
              }
              d.linkColor = (obj.source) ? obj.source.linkColor : obj.linkColor;

          });

          // Update the nodes…
          var node = svg.selectAll("g.node")
            .data(nodes, function(d) {
              return d.id || (d.id = ++i);
            });

          // Enter any new nodes at the parent's previous position.
          var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
              .on("click", click);

          nodeEnter.append("circle")
              .attr("r", 1e-6)
              // .on("mouseover", function (d) {
              //     node_onMouseOver(d);
              // })
              // .on("mouseout", function (d) {
              // //   node_onMouseOut(d);
              // })
              .style("fill", function(d) {
                circles[d._children] = this;
                return d.source ? d.source.linkColor : d.linkColor;
              })
              .style("fill-opacity", ".8")
              //change?
              .style("stroke", function (d) {
                  return d.source ? d.source.linkColor : d.linkColor;
          });

          nodeEnter.append("text")
              .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
              .attr("dy", "2em")
              .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
              .text(function(d) { return d.name; })
              .style("fill-opacity", 1e-6);

          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

          nodeUpdate.select("circle")
              .attr("r", 7)
              //new to set radius
              // .attr("r", function (d) {
              //   return isNaN(nodeRadius(d[spendField])) ? 2: nodeRadius(d[spendField]);
              // })
              //old
              // .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
              .style("fill", function (d) { return d.source ? d.source.linkColor : d.linkColor })
              .style("fill-opacity", function (d) { return ((d.depth + 1) / 5);});

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

          var rootCounter = 0;

          // Enter any new links at the parent's previous position.
          link.enter().insert("path", "g")
              .attr("class", "link")

              .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
              })
              .style("stroke", function (d, i) {
                  if (d.source.depth === 0) {
                      rootCounter++;
                      return (d.source.children[rootCounter - 1].linkColor);
                  }
                  else {
                      return (d.source) ? d.source.linkColor : d.linkColor;
                  }
              });
              // .style("stroke-width", function (d, i) {
              //   return isNaN(nodeRadius(d.target[spendField])) ? 4: nodeRadius(d.target[spendField])*2;
              // })
              // .style("stroke-opacity", function (d) {
              //   return d.target[spendField] <= 0 ? .1 : ((d.source.depth + 1) / 4.5);
              // })
              // .style("stroke-linecap", "round")
              // .on("mouseover", function (d) {node_onMouseOver(d.source);})
              // .on("mouseout", function (d) { node_onMouseOut(d.source)});

          // Transition links to their new position.
          link.transition()
              .duration(duration)
              .attr("d", diagonal)
              // .style("stroke-width", function (d, i) {
              //   return isNaN(nodeRadius(d.target[spendField])) ? 4: nodeRadius(d.target[spendField])*2;
              // })
              // .style("stroke-opacity", function (d) {
              //     var ret = ((d.source.depth + 1) / 4.5);
              //     if (d.target[spendField] <= 0) ret = 0.1;
              //     return ret;
              // });

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
        }//end update function

        // function node_onMouseOver(d) {

        //   if (typeof d.target != "undefined") {
        //       d = d.target;
        //   }
        //   d3.select(circles[d._children]).transition().style("fill-opacity",0.6);
        //   highlightPath(d);

        //   function highlightPath(d) {
        //     if (d) {
        //         d3.select(paths[d._children]).style("stroke-opacity",function (d) {
        //           return d.target[spendField] <= 0 ? .1 + .3 : ((d.source.depth + 1) / 4.5) + .3;
        //         });
        //         highlightPath(d.parent);
        //     }
        //   }
        // }

        // function node_onMouseOut(d) {
        //   d3.select(circles[d._children]).transition().style("fill-opacity",0.3);
        //   noHighlightPath(d);

        //   function noHighlightPath(d) {
        //     if (d) {
        //         d3.select(paths[d._children]).style("stroke-opacity",function (d) {
        //           return d.target[spendField] <= 0 ? .1 : ((d.source.depth + 1) / 4.5);
        //         });
        //         noHighlightPath(d.parent);
        //     }
        //   }
        // }

        // Toggle children on click.
        function click(d) {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update(d);
        }

        function expand(d){
          var children = (d.children)?d.children:d._children;
          if (d._children) {
              d.children = d._children;
              d._children = null;
          }
          if(children)
            children.forEach(expand);
        }

        // ToggleTree.prototype.expandAll = function() {
        //   console.log('expand')
        //   expand(root);
        //   this.expand = update(root);

        // };
        function expandAll(){
          console.log('expandAll from d3 factory')
          expand(root);
          update(root);
        }

        // ToggleTree.prototype.collapseAll = function() {
        //   console.log('collapse')
        //   root.children.forEach(collapse);
        //   collapse(root);
        //   this.collapse = update(root);
        // };
        function collapseAll(){
            console.log('collapseAll from d3 factory')
            root.children.forEach(collapse);
            collapse(root);
            update(root);
        }


        // Add the clipping path
        svg.append("svg:clipPath").attr("id", "clipper")
            .append("svg:rect")
            .attr('id', 'clip-rect');

        //lucy note - what is this?
        // var layoutRoot = svg
        //     .append("svg:g")
        //     .attr("class", "container")
        //     .attr("transform", "translate(" + maxLabelLength + ",0)");

        // // set the clipping path
        // var animGroup = layoutRoot.append("svg:g")
        //     .attr("clip-path", "url(#clipper)");

        function setupMouseEvents(){
          ui.nodeGroup.on('mouseover', function(d, i){
              d3.select(this).select("circle").classed("hover", true);
          })
              .on('mouseout', function(d, i){
                  d3.select(this).select("circle").classed("hover", false);
              })
              .on('hover', function(nd, i){
                  // Walk parent chain
                  var ancestors = [];
                  var parent = nd;
                  while (!_.isUndefined(parent)) {
                      ancestors.push(parent);
                      parent = parent.parent;
                  }

                  // Get the matched links
                  var matchedLinks = [];
                  ui.linkGroup.selectAll('path.link')
                      .filter(function(d, i)
                      {
                          return _.any(ancestors, function(p)
                          {
                              return p === d.target;
                          });
                      })
                      .each(function(d)
                      {
                          matchedLinks.push(d);
                      });

                  animateParentChain(matchedLinks);
              });
        }

        function animateParentChain(links){
            var linkRenderer = d3.svg.diagonal()
                .projection(function(d)
                {
                    return [d.y, d.x];
                });

            // Links
            ui.animGroup.selectAll("path.selected")
                .data([])
                .exit().remove();

            ui.animGroup
                .selectAll("path.selected")
                .data(links)
                .enter().append("svg:path")
                .attr("class", "selected")
                .attr("d", linkRenderer);

            // Animate the clipping path
            var overlayBox = ui.svg.node().getBBox();

            ui.svg.select("#clip-rect")
                .attr("x", overlayBox.x + overlayBox.width)
                .attr("y", overlayBox.y)
                .attr("width", 0)
                .attr("height", overlayBox.height)
                .transition().duration(500)
                .attr("x", overlayBox.x)
                .attr("width", overlayBox.width);
        }
        //get root expand update collapse
        // return {
        //   root: root,
        //   expand: expand
        // };

        console.log('still in draw tree: '+root)
      });//end then

      // return  {
      //   expandAll: function(){

      //             console.log('expand')
      //             // console.log(root)
      //             expand(root);
      //             update(root);
      //   },
      //   collapseAll: function(){
      //     console.log('collapse')
      //     root.children.forEach(collapse);
      //     collapse(root);
      //     update(root);
      //   }
      // };
      // console.log(expandAll)
      console.log('before return, red error root is not defined')
      // return {
      //   expand: expandAll,
      //   collapse: collapseAll
      // };
      console.log('below return, red error root is not defined')
    }//end draw tree function
      console.log('outside draw tree, root not available')

    // console.log(drawTree())
    function d3(){
      return d.promise;
    }

    var service = {
      drawTree: drawTree,
      d3: d3
    };

    return service;
  }


