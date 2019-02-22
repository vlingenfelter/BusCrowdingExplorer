// Viz.js
// ===============

// Declare initial variables
// -------------------------
// find width of view
// TO DO:
// figure out why mobile gets so tiny and fix this
var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
// define margin
var margin = {
  top: 30,
  right: 30,
  bottom: 30,
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
  gridSizeX = Math.floor(width / days.length),
  gridSizeY = Math.floor(height / times.length),
  // datasets to pull from (to be replaced by back end)
  datasets = ["heatmap/111.tsv", "data.tsv"];


// heatmapChart: data (tsv) ---> svg
// renders the heatmap
var heatmapChart = function(tsvFile) {
  // read the tsv
  d3.tsv(tsvFile,
    // accessor
    function(d) {
      return {
        day: +d.stop_id,
        hour: d.halfhour,
        value: (+d.paxhoursuncomfortable) / (+d.paxhourstotal)
      };
    },
    // call back
    function(error, data) {

      // make svg in the chart div
      var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // create group for stop ID labels
      var dayLabelsGroup = svg.append("g");
      var dayLabels = dayLabelsGroup.selectAll(".dayLabel")
        .data(days)
        .enter().append("text")
        // anonymous function
        // TO DO: either get rid of this or make it a real function
        .text(function(d) {
          return d;
        })
        .attr("x", 0)
        .attr("y", function(d, i) { // stop id, position ---> where on grid it goes
          return i * gridSizeY;
        })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSizeX / 1.5 + ")");

      // create group for x axis labels
      // important for refresh function used for resizing
      var timeLabelsGroup = svg.append('g').classed('x', true);
      var timeLabels = timeLabelsGroup.selectAll(".timeLabel")
        .data(times)
        .enter().append("text")
        .text(function(d, i) { // right now it's just showing position not time seg
          return i;
        })
        .attr("x", function(d, i) { // time seg, position ---> where on grid it goes
          return i * gridSizeX;
        })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSizeX / 4 + ", -6)")
        // give each text element the .xLab class
        .classed('xLab', true);


      // find distinct stop ids in the data
      const distinctStopID = [...new Set(data.map(x => x.day))];
      // find distinct half hours in the data
      const distinctHalfhour = [...new Set(data.map(x => x.hour))];
      // for testing:
      // console.log(distinctHalfhour);
      // console.log(distinctStopID);

      // give each piece of data it's coordinates
      data.map(function(d) {
        d.day = 1 + distinctStopID.indexOf(d.day);
        d.hour = 1 + distinctHalfhour.indexOf(d.hour);
        // remove NaN values and give them "0"
        // TO DO:
        // replace empty values with little arrows
        if (isNaN(d.value)) {
          d.value = 0;
        }
      })
      // store this data in a global variable for testing
      // get rid of this eventually
      // refresh is dependent on this
      thisData = data;

      // scale the colors based on quantiles in the data
      // check with Anna to see if this is best approach
      var colorScale = d3.scale.quantile()
        .domain([0, 1])
        .range(colors);

      // create "cards" ---> rectangles that represent a segement on route at given time
      var cards = svg.selectAll(".hour")
        .data(data);

      // append a rectangle to each card
      cards.enter().append("rect")
        .attr("x", function(d, i) { // place this rect properly in grid X
          return (d.hour - 1) * gridSizeX;
        })
        .attr("y", function(d, i) { // place this rect properly in grid Y
          return (d.day - 1) * gridSizeY;
        })
        .attr("rx", 0)
        .attr("ry", 0)
        .attr("class", "hour")
        .attr("width", ((gridSizeX * 3) / 4)) // width is currently 75% of grid size
        .attr("height", gridSizeY) // keeps the routes continuous
        .style("fill", function(d) { // color based on the value of the card
          return colorScale(d.value);
        });
    });
};

// call heatmap on the tsv for the 111
heatmapChart(datasets[0]);

// whenever window resizes, call function resize
d3.select(window).on('resize', resize);

// resize the chart based on window width change
function resize() {
  data = thisData;
  // update width based on the width of the chart element
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (w >= 768) {
    w = w * .9;
  }

  // apply margins
  var width = w - margin.left - margin.right;
  // calculate grid size for new width
  var gridSizeX = Math.floor(width / days.length);

  // create variable for svg
  var svg = d3.select("#chart").select('svg');

  // resize svg according to new width
  svg.transition()
    .duration(100)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("width", width);

  // resize the labels for the time segements
  var timeLabels = svg.selectAll('.xLab');
  timeLabels.transition()
    .duration(100)
    .attr("x", function(d, i) {
      return i * gridSizeX;
    })
    .attr("transform", "translate(" + gridSizeX / 4 + ", -6)");

  // select all rectangles and change their width
  var cards = svg.selectAll("rect");
  cards.transition()
    .duration(100)
    .attr("width", (gridSizeX * 3) / 4)
    .attr("x", function(d, i) {
      return (d.hour - 1) * gridSizeX;
    });
}