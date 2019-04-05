// Viz.js
// ===============

// Declare initial variables
// -------------------------
// find width of view
// TO DO:
// figure out why mobile gets so tiny and fix this
function parentWidth(elem) {
  return elem.parentElement.clientWidth;
}


var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
w = parentWidth(document.getElementById('chart')) * 0.9;
// define margin
var margin = {
  top: 50,
  right: 10,
  bottom: 50,
  left: 30
}
// if (w >= 768) {
//   w = w * .9;
//   var margin = {
//     top: 50,
//     right: 50,
//     bottom: 150,
//     left: 50
//   };
// }



var width = w - margin.left - margin.right,
  height = 900 - margin.top - margin.bottom,

  // make an array of colors
  colors = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E"].reverse(),
  buckets = colors.length,

  // TO DO:
  // abstract this so that it finds this based on given data
  // days ----> stop IDs that populate y axis labels
  days = [5611, 8310, 5629, 5628, 5627, 5626, 5625, 5624, 5623, 5621, 5620, 5619, 5618, 56170, 5615, 5614, 5613, 5612, 2832, 2833, 5636,
    5633, 5632, 5631, 5630, 5610, 5751, 5750, 5617, 5585, 5583, 5582, 5581, 5580, 5579, 5578, 45581, 5605, 5547, 5590, 5589, 5588, 5587,
    5650, 5609, 5607, 5606, 5603, 5602, 5601, 5600, 5599, 5598, 5597, 5596, 5595, 5594, 5593, 5592, 5591, 2829, 5586, 5546, 5544, 5543,
    5542, 5541, 5540, 5539, 5538, 5537
  ],
  // Does this need to be abstracted? will we want this to be consistent or based on data?
  // ASK AP
  // times ----> the half hours that data is aggregated to
  times = ["4:30:00", "5:00:00", "5:30:00", "6:00:00", "6:30:00", "7:00:00", "7:30:00", "8:00:00", "8:30:00", "9:00:00", "9:30:00",
    "10:00:00", "10:30:00", "11:00:00", "11:30:00", "12:00:00", "12:30:00", "13:00:00", "13:30:00", "14:00:00", "14:30:00", "15:00:00",
    "15:30:00", "16:00:00", "16:30:00", "17:00:00", "17:30:00", "18:00:00", "18:30:00", "19:00:00", "19:30:00", "20:00:00", "20:30:00",
    "21:00:00", "21:30:00", "22:00:00", "22:30:00", "23:00:00", "23:30:00", "24:00:00", "24:30:00", "25:00:00", "25:30:00", "26:00:00",
    "26:30:00"
  ],
  // the sizes that the grid will be
  gridSizeX = Math.floor(width / times.length),
  gridSizeY = Math.floor(height / days.length),
  // datasets to pull from (to be replaced by back end)
  datasets = ["heatmap/route1dudley.tsv"];

var n = 6, // number of layers
  m = times.length, // number of samples per layer
  colorrange = ["#ec5206",
    "#afd35a",
    "#155126",
    "#43dcc5",
    "#028b93"
  ],
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
  .domain([0, 20])
  .range([(height / 3), 0]);

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
  .attr("height", (height / 3));

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
    .duration(2000)
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

      transition(crowding1);
    });
};
streamgraph("../streamgraph/1bysource.csv");
// call heatmap on the tsv for the 111
heatmapChart(datasets[0]);

// whenever window resizes, call function resize
d3.select(window).on('resize', resize);

// resize the chart based on window width change
function resize() {
  data = thisData;
  // update width based on the width of the chart element
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  w = parentWidth(document.getElementById('chart')) * 0.9;


  // apply margins
  var width = w - margin.left - margin.right;
  // calculate grid size for new width
  var gridSizeX = Math.floor(width / times.length);

  // create variable for svg
  var svg = d3.select("#chart").selectAll('svg');

  // resize svg according to new width
  svg.transition()
    .duration(100)
    //  .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("width", width);

  var timeLabels = svg.selectAll('.xLab');
  timeLabels.transition()
    .duration(100)
    .attr("x", function(d, i) {
      return i * gridSizeX;
    })
    .attr("transform", "translate(0, 0)")
    .attr("transform", function(d, i) {
      return `rotate(-60, ${i * gridSizeX}, ${0} )` //ES6 template literal to set x and y rotation points
    });

  // select all rectangles and change their width
  var cards = svg.selectAll("rect");
  cards.transition()
    .duration(100)
    .attr("width", (gridSizeX * 3) / 4)
    .attr("x", function(d, i) {
      return (d.hour - 1) * gridSizeX;
    });
}