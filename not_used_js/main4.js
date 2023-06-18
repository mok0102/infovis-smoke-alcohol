Promise.all([
    d3.csv("../data/smoke.csv"),
    d3.csv("../data/alcohol.csv")
  ]).then(function (data) {
    var smokeData = data[0];
    var alcoholData = data[1];
  
    smokeData.forEach(d => {
      d.TIME = new Date(+d.TIME, 0, 1);
      d.Value = +d.Value;
    });
  
    alcoholData.forEach(d => {
      d.TIME = new Date(+d.TIME, 0, 1);
      d.Value = +d.Value;
    });
  
    drawSmokeLine(smokeData);
    drawAlcoholLine(alcoholData);
  });
  
  var smokeSvg;
  var alcoholSvg;
  
  function drawAlcoholLine(alcoholData) {
    // Set up the chart dimensions
    var margin = { top: 20, right: 20, bottom: 30, left: 50 };
    var width = 600 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
  
    // Create the SVG element
    alcoholSvg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    // Define the scales and axes
    var xScale = d3.scaleTime()
      .domain(d3.extent(alcoholData, function (d) { return d.TIME; }))
      .range([0, width]);
  
    var yScale = d3.scaleLinear()
      .domain([0, d3.max(alcoholData, function (d) { return d.Value; })])
      .range([height, 0]);
  
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
  
    // Add the x-axis
    alcoholSvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
  
    // Add the y-axis
    alcoholSvg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value");
  
    // Add X axis label
    alcoholSvg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .style("text-anchor", "middle")
      .text("Year");
  
    // Add Y axis label
    alcoholSvg.append("text")
      .attr("class", "axis-label")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 50)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .text("Alcohol");
  
    const cScale = d3.scaleOrdinal()
      .range(d3.schemeSet3);
  
    // Data grouping
    const alcoholGroup = d3.group(alcoholData, d => d.LOCATION);
  
    // Create a tooltip element
    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
    // Define the line function
    var line = d3.line()
      .x(function (d) { return xScale(d.TIME); })
      .y(function (d) { return yScale(d.Value); });
  
    // Draw the lines
    alcoholSvg.selectAll(".line")
      .data(Array.from(alcoholGroup))
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("d", function (d) { return line(d[1]); })
      .style("stroke", function (d) { return cScale(d[0]); });
  
    // Add a legend
    var legend = alcoholSvg.selectAll(".legend")
      .data(Array.from(alcoholGroup))
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });
  
    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 3)
      .style("fill", function (d) { return cScale(d[0]); });
  
    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 6)
      .style("text-anchor", "end")
      .text(function (d) { return d[0]; });
  
    // Add the brush feature
    var brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("end", brushended);
  
    alcoholSvg.append("g")
      .attr("class", "brush")
      .call(brush);
  
    function brushended() {
    //   if (!d3.event.sourceEvent || !d3.event.selection) return;  
  
      var selectedRange = d3.event.selection.map(xScale.invert);
  
      // Filter the data based on the selected range
      var filteredData = alcoholData.filter(function (d) {
        return d.TIME >= selectedRange[0] && d.TIME <= selectedRange[1];
      });
  
      // Redraw the lines with the filtered data
      alcoholSvg.selectAll(".line")
        .data(Array.from(d3.group(filteredData, d => d.LOCATION)))
        .transition()
        .attr("d", function (d) { return line(d[1]); });
    }
  }

  function drawSmokeLine(smokeData) {
    // Set up the chart dimensions
    var margin = { top: 20, right: 20, bottom: 30, left: 50 };
    var width = 600 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    // Create the SVG element
    smokeSvg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define the scales and axes
    var xScale = d3.scaleTime()
      .domain(d3.extent(smokeData, function (d) { return d.TIME; }))
      .range([0, width]);

    var yScale = d3.scaleLinear()
      .domain([0, d3.max([d3.max(smokeData, function (d) { return d.Value; })])])
      .range([height, 0]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // Add the x-axis
    smokeSvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // Add the y-axis
    smokeSvg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value");

    // Add X axis label
    smokeSvg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2 - 10)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Year");

    // Add Y axis label
    smokeSvg.append("text")
        .attr("class", "axis-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 50)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Smoke");

    const cScale = d3.scaleOrdinal()
      .range(d3.schemeSet3);

    // Define the line functions
    var line = d3.line()
      .x(function (d) { return xScale(d.TIME); })
      .y(function (d) { return yScale(d.Value); });

    var smokeLine = d3.line()
      .x(function (d) { return xScale(d.TIME); })
      .y(function (d) { return yScale(d.Value); });

    // data grouping
    const smoke_group = d3.group(smokeData, d=>d.LOCATION);

    // Create a tooltip element
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);

    // Draw the line
    smokeSvg.selectAll(".line")
        .data(smoke_group)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return cScale(d[0]) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
            return d3.line()
            .x(function(d) { return xScale(d.TIME); })
            .y(function(d) { return yScale(d.Value); })
            (d[1])
        })
        .on("mouseover", function(event, d){

            d3.select(this).attr("stroke-width", 4); // Increase the stroke width of the line

            var mouseX = event.pageX - margin.left; // Calculate the mouse x-coordinate relative to the chart
            var mouseY = event.pageY - margin.top; // Calculate the mouse y-coordinate relative to the chart

            var xValue = xScale.invert(mouseX); // Get the x value from the xScale
            var bisect = d3.bisector(function(d) { return d.TIME; }).left;
            var index = bisect(d[1], xValue); // Find the index of the data point closest to the x value

            var dataPoint = d[1][index]; // Get the specific data point
            var year = dataPoint.TIME;
            var alcohol = dataPoint.Value;

            // Show tooltip or perform other interactions
            tooltip.style("opacity", 1)
                .html("Country: " + d[0] + "<br/>Year: " + year + "<br/>Smoke consumption: " + alcohol)
                // .style("left", (mouseX + 10) + "px") // Position the tooltip slightly to the right of the mouse cursor
                // .style("top", (mouseY + 10) + "px"); // Position the tooltip slightly below the mouse cursor
                .style("left", (d3.pointer(event)[0] + margin.left) + "px")
                .style("top", (d3.pointer(event)[1] + margin.top) + "px");
        })
        
        .on("mouseout", function(d){
            // Hide tooltip or revert other interactions
            d3.select(this).attr("stroke-width", 1.5); // Increase the stroke width of the line
            tooltip.style("opacity", 0);
        });

    // Draw the labels for lines
    smokeSvg.selectAll(".text")        
        .data(smoke_group)
        .enter()
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 13)
        .attr("class","label")
        .attr("x", function(d) { return xScale(d[1][d[1].length-1].TIME); }  )
        .attr("y", function(d) { return yScale(d[1][d[1].length-1].Value); })
        .attr("fill", function(d) { return cScale(d[0])})
        .attr("dy", ".75em")
        .text(function(d) { return d[0]; }); 

    // Legend    
    const legend = d3.select("#legend")
            .append("svg")
            .attr('width', width)
            .attr('height', 70)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
    legend.append("text").attr("x", 0).attr("y", 18).text("Smoke Per Year").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
}