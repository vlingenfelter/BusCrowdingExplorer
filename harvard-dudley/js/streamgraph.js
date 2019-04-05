var n = 6, // number of layers
  m = 40, // number of samples per layer
  colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"],
  stack = d3.layout.stack().offset("silhouette"),
  layers0 = stack(d3.range(n).map(function() {
    return bumpLayer(m);
  })),
  layers1 = stack(d3.range(n).map(function() {
    return bumpLayer(m);
  }));

var x = d3.scale.linear()
  .domain([0, m - 1])
  .range([0, width]);

var y = d3.scale.linear()
  .domain([0, 40])
  .range([(height / 10), 0]);

var color = d3.scale.ordinal()
  .range(colorrange);

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var area = d3.svg.area()
  .interpolate("cardinal")
  .x(function(d) {
    return x(d.x);
  })
  .y0(function(d) {
    return y(d.y0);
  })
  .y1(function(d) {
    return y(d.y0 + d.y);
  });

var svg = d3.select("#chart").append("svg")
  .attr("width", width)
  .attr("height", (height / 10));

svg.selectAll("path")
  .data(layers0)
  .enter().append("path")
  .attr("d", area)
  .style("fill", function() {
    return color(Math.random());
  });


// Inspired by Lee Byron's test data generator.
function bumpLayer(n) {
  function bump(a) {
    var x = 1 / (.1 + Math.random()),
      y = 2 * Math.random() - .5,
      z = 10 / (.1 + Math.random());
    for (var i = 0; i < n; i++) {
      var w = (i / n - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
  }

  var a = [],
    i;
  for (i = 0; i < n; ++i) a[i] = 0;
  for (i = 0; i < 5; ++i) bump(a);
  return a.map(function(d, i) {
    return {
      x: i,
      y: Math.max(0, d)
    };
  });
}

function transition(data) {
  d3.selectAll("path")
    .data(data)
    .transition()
    .duration(2500)
    .attr("d", area);
}

// function to get data from csv
var streamgraph = function(csv) {
  // get data
  d3.csv(csv,
    // accessor
    function(d) {
      return {
        direction: +d.direction,
        hour: +d.halfhour,
        total: +d.paxhoursuncomfortable,
        planned_frequency: +d.planned_frequency,
        day_to_day: +d.day_to_day_demand_variability,
        within_day: +d.within_day_demand_variability,
        dropped: +d.dropped_trips,
        headway: +d.headway_variability
      };
    },
    // call back
    function(error, data) {
      // filter by direction
      // TO DO: Abstract this
      data0 = data.filter(d => (d["direction"] === 0))
      data1 = data.filter(d => (d["direction"] === 1))
      // MAP Half HOUR to int
      const distinctHalfhour0 = [...new Set(data0.map(x => x.hour))];
      console.log(distinctHalfhour0);
      data0.map(function(d) {
        d.hour = 1 + distinctHalfhour0.indexOf(d.hour);
        if (isNaN(d.value)) {
          d.value = 0;
        }
      });
      // get the column names
      sources = Object.keys(data0[0]);
      // set up crowding by source array
      crowding0 = [
        [],
        [],
        [],
        [],
        [],
        []
      ];
      // flatten data
      for (var i = 0; i < 6; i++) {
        for (var j = 0; j < distinctHalfhour0.length; j++) {
          crowding0[i].push({
            x: j + 1,
            y: data0[j][sources[i + 3]]
          });
        }
      }

      const distinctHalfhour1 = [...new Set(data1.map(x => x.hour))];
      console.log(distinctHalfhour1);
      data1.map(function(d) {
        d.hour = 1 + distinctHalfhour1.indexOf(d.hour);
        if (isNaN(d.value)) {
          d.value = 0;
        }
      })
      crowding1 = [
        [],
        [],
        [],
        [],
        [],
        []
      ];
      for (var i = 0; i < 6; i++) {
        for (var j = 0; j < distinctHalfhour1.length; j++) {
          crowding1[i].push({
            x: j + 1,
            y: data1[j][sources[i + 3]]
          });
        }
      }

      // call stack type
      crowding0 = stack(crowding0);
      crowding1 = stack(crowding1);
      streamData = data0;

      transition(crowding0);

      // user interaction with the layers
      svg.selectAll(".layer")
        .attr("opacity", 1)
        .on("mouseover", function(d, i) {
          svg.selectAll(".layer").transition()
            .duration(100)
            .attr("opacity", function(d, j) {
              return j != i ? 0.6 : 1;
            })
        })
        .on("mousemove", function(d, i) {

          var color = d3.select(this).style('fill'); // need to know the color in order to generate the swatch

          mouse = d3.mouse(this);
          mousex = mouse[0];
          var invertedx = x.invert(mousex);
          var xDate = century(invertedx.getYear());
          d.values.forEach(function(f) {
            var year = (f.date.toString()).split(' ')[3];
            if (xDate == year) {
              tooltip
                .style("left", tipX(mousex) + "px")
                .html("<div class='year'>" + year + "</div><div class='key'><div style='background:" + color +
                  "' class='swatch'>&nbsp;</div>" + f.key + "</div><div class='value'>" + f.value + " " + awardPlural((f.value)) +
                  "</div>")
                .style("visibility", "visible");
            }
          });
        })
        .on("mouseout", function(d, i) {
          svg.selectAll(".layer").transition()
            .duration(100)
            .attr("opacity", '1');
          tooltip.style("visibility", "hidden");
        });

      // vertical line to help orient the user while exploring the streams
      var vertical = d3.select(".chart." + groupBy + '.' + filterBy)
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "2px")
        .style("height", "460px")
        .style("top", "10px")
        .style("bottom", "30px")
        .style("left", "0px")
        .style("background", "#fcfcfc");

      d3.select(".chart." + groupBy + '.' + filterBy)
        .on("mousemove", function() {
          mousex = d3.mouse(this);
          mousex = mousex[0] + 5;
          vertical.style("left", mousex + "px")
        })
        .on("mouseover", function() {
          mousex = d3.mouse(this);
          mousex = mousex[0] + 5;
          vertical.style("left", mousex + "px")
        });

      // Add 'curtain' rectangle to hide entire graph
      var curtain = svg.append('rect')
        .attr('x', -1 * width)
        .attr('y', -1 * height)
        .attr('height', height)
        .attr('width', width)
        .attr('class', 'curtain')
        .attr('transform', 'rotate(180)')
        .style('fill', '#fcfcfc')

      // Create a shared transition for anything we're animating
      var t = svg.transition()
        .delay(100)
        .duration(1500)
        .ease('exp')
        .each('end', function() {
          d3.select('line.guide')
            .transition()
            .style('opacity', 0)
            .remove()
        });

      t.select('rect.curtain')
        .attr('width', 0);
      t.select('line.guide')
        .attr('transform', 'translate(' + width + ', 0)');

    });
};