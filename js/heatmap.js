// // heatmapChart: data (tsv) ---> svg
// // renders the heatmap
// var heatmapChart = function(tsvFile) {
//   // read the tsv
//   d3.tsv(tsvFile,
//     // accessor
//     function(d) {
//       return {
//         stoppair: {
//           last: +d.stop_id,
//           next: +d.nextstop
//         },
//         stop: +d.stop_id,
//         nextstop: +d.nextstop,
//         day: +d.stop_sequence,
//         hour: d.halfhour,
//         value: (+d.paxhoursuncomfortable) / (+d.paxhourstotal),
//         checkpoint: d.checkpoint_id
//       };
//     },
//     // call back
//     function(error, data) {
//       const distinctPairs = [...new Set(data.map(x => x.stoppair))];
//       const distinctStopID = [...new Set(data.map(x => x.day))];
//       const distinctValues = [...new Set(data.map(x => x.value))];
//       days = distinctStopID;
//       gridSizeY = Math.floor(height / distinctStopID.length);
//       console.log(distinctPairs);
//       // make svg in the chart div
//       var svg = d3.select("#chart").append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//       // create group for stop ID labels
//       var dayLabelsGroup = svg.append("g");
//       var dayLabels = dayLabelsGroup.selectAll(".dayLabel")
//         .data(data)
//         .enter().append("text")
//         // anonymous function
//         // TO DO: either get rid of this or make it a real function
//         .text(function(d) {
//           return d.checkpoint;
//         })
//         .attr("x", 0)
//         .attr("y", function(d, i) { // stop id, position ---> where on grid it goes
//           return i * gridSizeY;
//         })
//         .style("text-anchor", "end")
//         .attr("transform", "translate(10," + gridSizeX / 1.5 + ")");
//
//       svg.append("text")
//         .attr("transform", "rotate(-90)")
//         .attr("y", 0 - (margin.left))
//         .attr("x", 0 - (height / 2))
//         .attr("dy", "1em")
//         .style("text-anchor", "middle")
//         .text("Stops");
//       // create group for x axis labels
//       // important for refresh function used for resizing
//       var timeLabelsGroup = svg.append('g').classed('x', true)
//         .attr("transform", (d, i) => {
//           return "translate(" + (i * gridSizeX + 5) + ", -12)";
//         });
//       var timeLabels = timeLabelsGroup.selectAll(".timeLabel")
//         .append('g')
//         .data(times)
//         .enter().append("text")
//         .text(function(d, i) { // right now it's just showing position not time seg
//           // TO DO
//           // regex times to make sure that modulo starts at 4 am and goes every 2 hours
//           if (((i + 1) % 2) == 0) {
//             if (d.indexOf(':') !== -1) {
//               //split and get
//               var y = d.split(':')[0];
//               if (parseInt(y) > 12 && parseInt(y) < 24) {
//                 return `${parseInt(y) - 12}p`;
//               } else if (parseInt(y) > 24) {
//                 return `${parseInt(y) - 24}a`;
//               } else if (parseInt(y) == 24) {
//                 return "12a";
//               } else if (parseInt(y) == 12) {
//                 return "12p";
//               } else {
//                 return `${y}a`;
//               }
//             }
//           }
//         })
//         .attr("x", function(d, i) { // time seg, position ---> where on grid it goes
//           return i * gridSizeX;
//         })
//         .attr("y", 0)
//         .style("text-anchor", "end")
//         // .attr("transform", function(d) {
//         //   var xRot = d3.select(this).attr("x");
//         //   var yRot = d3.select(this).attr("y");
//         //   return `rotate(-60, ${xRot}, ${yRot} )` //ES6 template literal to set x and y rotation points
//         // })
//         // give each text element the .xLab clas
//         .classed('xLab', true);
//
//
//       // find distinct stop ids in the data
//       // find distinct half hours in the data
//       const distinctHalfhour = [...new Set(data.map(x => x.hour))];
//       // for testing:
//       // console.log(distinctHalfhour);
//       // console.log(distinctStopID);
//       testData = distinctHalfhour;
//       // give each piece of data it's coordinates
//       data.map(function(d) {
//         d.day = 1 + distinctStopID.indexOf(d.day);
//         d.hour = 1 + distinctHalfhour.indexOf(d.hour);
//         // remove NaN values and give them "0"
//         // TO DO:
//         // replace empty values with little arrows
//         if (isNaN(d.value)) {
//           d.value = 0;
//         }
//       })
//       // store this data in a global variable for testing
//       // get rid of this eventually
//       // refresh is dependent on this
//       thisData = data;
//       var nestHour = d3.nest()
//         .key(function(d) {
//           return d.hour;
//         })
//         .entries(thisData);
//
//
//
//
//       // scale the colors based on quantiles in the data
//       // check with Anna to see if this is best approach
//       var colorScale = d3.scale.quantile()
//         .domain([0.001, d3.max(distinctValues)])
//         .range(colors);
//
//       // create "cards" ---> rectangles that represent a segement on route at given time
//       var cards = svg.selectAll(".hour")
//         .data(data);
//
//       // append a rectangle to each card
//       cards.enter().append("rect")
//         .attr("x", function(d, i) { // place this rect properly in grid X
//           return (d.hour - 1) * gridSizeX;
//         })
//         .attr("y", function(d, i) { // place this rect properly in grid Y
//           return (d.day - 1) * gridSizeY;
//         })
//         .attr("rx", 0)
//         .attr("ry", 0)
//         .attr("class", "hour")
//         .attr("width", ((gridSizeX * 3) / 4)) // width is currently 75% of grid size
//         .attr("height", gridSizeY) // keeps the routes continuous
//         .style("stroke", "black")
//         .style("stroke-width", "0")
//         .style("fill", function(d) { // color based on the value of the card
//           if (d.value > 0) {
//             return colorScale(d.value);
//           } else {
//             return "#FEF0D9";
//           }
//         })
//         .on("mouseover", function(d) {
//           d3.select(this).style("stroke-width", "2");
//           div.transition()
//             .duration(100)
//             .style("opacity", 1);
//           div.html(d.value.toFixed(2) + " UPH")
//             .style("left", (d3.event.pageX) + "px")
//             .style("top", (d3.event.pageY - 28) + "px");
//         })
//         .on("mouseout", function(d) {
//           d3.select(this).style("stroke-width", "0");
//           div.transition()
//             .duration(500)
//             .style("opacity", 0);
//         });;
//     });
// };
