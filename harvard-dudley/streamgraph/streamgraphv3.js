var streamgraph = function(csvFile) {
  d3.csv(csvFile,
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

    });
};