var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var margin = {
    top: 50,
    right: 50,
    bottom: 100,
    left: 50
  },
  width = w - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom,
  buckets = 6,
  colors = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"].reverse(),
  days = [5611, 8310, 5629, 5628, 5627, 5626, 5625, 5624, 5623, 5621, 5620, 5619, 5618, 56170, 5615, 5614, 5613, 5612, 2832, 2833, 5636,
    5633, 5632, 5631, 5630, 5610, 5751, 5750, 5617, 5585, 5583, 5582, 5581, 5580, 5579, 5578, 45581, 5605, 5547, 5590, 5589, 5588, 5587,
    5650, 5609, 5607, 5606, 5603, 5602, 5601, 5600, 5599, 5598, 5597, 5596, 5595, 5594, 5593, 5592, 5591, 2829, 5586, 5546, 5544, 5543,
    5542, 5541, 5540, 5539, 5538, 5537
  ],
  times = ["4:30:00", "5:00:00", "5:30:00", "6:00:00", "6:30:00", "7:00:00", "7:30:00", "8:00:00", "8:30:00", "9:00:00", "9:30:00",
    "10:00:00", "10:30:00", "11:00:00", "11:30:00", "12:00:00", "12:30:00", "13:00:00", "13:30:00", "14:00:00", "14:30:00", "15:00:00",
    "15:30:00", "16:00:00", "16:30:00", "17:00:00", "17:30:00", "18:00:00", "18:30:00", "19:00:00", "19:30:00", "20:00:00", "20:30:00",
    "21:00:00", "21:30:00", "22:00:00", "22:30:00", "23:00:00", "23:30:00", "24:00:00", "24:30:00", "25:00:00", "25:30:00", "26:00:00",
    "26:30:00"
  ],
  gridSizeX = Math.floor(width / days.length),
  gridSizeY = Math.floor(height / times.length),
  legendElementWidth = gridSizeX * 2;
datasets = ["111.tsv", "data.tsv"];

var svg = d3.select("#chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dayLabels = svg.selectAll(".dayLabel")
  .data(days)
  .enter().append("text")
  .text(function(d) {
    return d;
  })
  .attr("x", 0)
  .attr("y", function(d, i) {
    return i * gridSizeY;
  })
  .style("text-anchor", "end")
  .attr("transform", "translate(-6," + gridSizeX / 1.5 + ")")
  .attr("class", function(d, i) {
    return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis");
  });

var timeLabels = svg.selectAll(".timeLabel")
  .data(times)
  .enter().append("text")
  .text(function(d, i) {
    return i;
  })
  .attr("x", function(d, i) {
    return i * gridSizeX;
  })
  .attr("y", 0)
  .style("text-anchor", "middle")
  .attr("transform", "translate(" + gridSizeX / 4 + ", -6)")
  .attr("class", function(d, i) {
    return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis");
  });

var heatmapChart = function(tsvFile) {
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
      const distinctStopID = [...new Set(data.map(x => x.day))];
      const distinctHalfhour = [...new Set(data.map(x => x.hour))];
      console.log(distinctHalfhour);
      console.log(distinctStopID);
      data.map(function(d) {
        d.day = 1 + distinctStopID.indexOf(d.day);
        d.hour = 1 + distinctHalfhour.indexOf(d.hour);
        if (isNaN(d.value)) {
          d.value = 0;
        }
      })
      thisData = data;
      var colorScale = d3.scale.quantile()
        .domain([0, 1])
        .range(colors);

      var cards = svg.selectAll(".hour")
        .data(data, function(d) {
          return d.day + ':' + d.hour;
        });

      cards.append("title");

      cards.enter().append("rect")
        .attr("x", function(d, i) {
          return (d.hour - 1) * gridSizeX;
        })
        .attr("y", function(d, i) {
          return (d.day - 1) * gridSizeY;
        })
        .attr("rx", 0)
        .attr("ry", 0)
        .attr("class", "hour bordered")
        .attr("width", ((gridSizeX * 3) / 4))
        .attr("height", gridSizeY)
        .style("fill", colors[0]);


      cards.transition().duration(1000)
        .style("fill", function(d) {
          return colorScale(d.value);
        });


      // cards.enter().append("circle")
      //   .attr("cx", function(d) {
      //     return (d.hour - 0.75) * (gridSizeX);
      //   })
      //   .attr("cy", function(d) {
      //     return (d.day - 1) * gridSizeY;
      //   })
      //   .attr("r", (gridSizeX / 4))
      //   .style("fill", "#fff")
      //   .style("stroke", "#000")
      //   .style("stroke-width", 1.5);

      cards.select("title").text(function(d) {
        return d.value;
      });

      cards.exit().remove();

      // var legend = svg.selectAll(".legend")
      //   .data([0].concat(colorScale.quantiles()), function(d) {
      //     return d;
      //   });
      //
      // legend.enter().append("g")
      //   .attr("class", "legend");
      //
      // legend.append("rect")
      //   .attr("x", function(d, i) {
      //     return legendElementWidth * i;
      //   })
      //   .attr("y", height)
      //   .attr("width", legendElementWidth)
      //   .attr("height", gridSizeY / 2)
      //   .style("fill", function(d, i) {
      //     return colors[i];
      //   });
      //
      // legend.append("text")
      //   .attr("class", "mono")
      //   .text(function(d) {
      //     return "≥ " + Math.round(d);
      //   })
      //   .attr("x", function(d, i) {
      //     return legendElementWidth * i;
      //   })
      //   .attr("y", height + gridSizeY);
      //
      // legend.exit().remove();

    });
};

heatmapChart(datasets[0]);

var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
  .data(datasets);

datasetpicker.enter()
  .append("input")
  .attr("value", function(d) {
    return "Dataset " + d
  })
  .attr("type", "button")
  .attr("class", "dataset-button")
  .on("click", function(d) {
    heatmapChart(d);
  });