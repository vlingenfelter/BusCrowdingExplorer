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
      var timeLabelsGroup = svg.append('g').classed('x', true)
        .attr("transform", (d, i) => {
          return "translate(" + (i * gridSizeX + 5) + ", -36)";
        });
      var timeLabels = timeLabelsGroup.selectAll(".timeLabel")
        .append('g')
        .data(times)
        .enter().append("text")
        .text(function(d, i) { // right now it's just showing position not time seg
          // TO DO
          // regex times to make sure that modulo starts at 4 am and goes every 2 hours
          if (((i + 1) % 4) == 0) {
            return d;
          }
        })
        .attr("x", function(d, i) { // time seg, position ---> where on grid it goes
          return i * gridSizeX;
        })
        .attr("y", 0)
        .style("text-anchor", "end")
        .attr("transform", function(d) {
          var xRot = d3.select(this).attr("x");
          var yRot = d3.select(this).attr("y");
          return `rotate(-60, ${xRot}, ${yRot} )` //ES6 template literal to set x and y rotation points
        })
        // give each text element the .xLab clas
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