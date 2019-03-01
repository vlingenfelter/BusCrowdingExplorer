var n = 6, // number of layers
  m = times.length, // number of samples per layer
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
  .domain([0, 30])
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
    });
};