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
  height = 1000 - margin.top - margin.bottom,

  // make an array of colors
  colors = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"].reverse(),
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
  datasets = ["heatmap/111.tsv", "data.tsv"];


// streamgraph("../streamgraph/111bysource.csv");
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