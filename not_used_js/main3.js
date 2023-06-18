Promise.all([
    d3.csv("../data/smoke.csv"),
    d3.csv("../data/alcohol.csv"),
    d3.csv("../data/population.csv")
  ]).then(function (data) {
    var smokeData = data[0];
    var alcoholData = data[1];
    var populationData = data[2];

    smokeData.forEach(d => {
        d.Time = +d.TIME;
        d.Value = +d.Value;
    });

    alcoholData.forEach(d => {
      d.Time = +d.TIME;
      d.Value = +d.Value;
  });

    populationData.forEach(d => {
      d.TIME = new Date(+d.TIME, 0, 1);
      d.Value = +d.Value;
    });

    // Parse the data
    var parseDate = d3.timeParse("%Y");
    smokeData.forEach(function (d) {
      d.TIME = parseDate(d.TIME);
      d.Value = +d.Value;
    });

    alcoholData.forEach(function (d) {
      d.TIME = parseDate(d.TIME);
      d.Value = +d.Value;
    });

    drawLine(smokeData, alcoholData);
    // drawAlcoholLine(alcoholData);

    const bubble = d3.select("#bubble")
      .on("click", function(d){
        d3.selectAll("#chart svg").remove()
        d3.selectAll("#legend text").remove()
        drawBubble(smokeData, alcoholData, populationData);
      })

    const line = d3.select("#line")
      .on("click", function(d){
        d3.select("#chart svg").remove()
        // d3.select("#legend text").remove()
        drawLine(smokeData, alcoholData);
      })
})

function drawBubble(smokeData, alcoholData, populationData) {

  smokeData = smokeData.filter(d => d.TIME.getFullYear() === 2020);
  alcoholData = alcoholData.filter(d => d.TIME.getFullYear() === 2020);
  populationData = populationData.filter(d => d.TIME.getFullYear() === 2020);

  const margin = {top: 5, right: 30, bottom: 50, left: 100},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // Define the position of the chart 
    const svg = d3.select("#chart")
       .append("svg")
       .attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a scale for x-axis 
    const xScale = d3.scaleLinear()
        .domain([d3.min(smokeData, d=>d.Value), d3.max(smokeData, d=>d.Value)])
        .range([0, width])

    // Create a scale for y-axis
    const yScale = d3.scaleLinear()
        .domain([d3.min(alcoholData, d=>d.Value), d3.max(alcoholData, d=>d.Value)])
        .range([height, 0])

    const cScale = d3.scaleOrdinal()
        .range(d3.schemeSet3);

    var sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(populationData, d => d.Value)])
        .range([5, 100]);

    // Define the position of each axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Draw axes 
    svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr('class', 'y-axis')
        .call(yAxis)

    // Add X axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Smoke");

    // Add Y axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 50)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Alcohol");

    // Create a tooltip element
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);
        

    // Add circles representing the countries as bubbles

    svg.selectAll("circle")
        .data(smokeData)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            // console.log(d.or_female)
            return xScale(d.Value);
        })
        .attr("cy", function(d) {
            return yScale(getValue(d.LOCATION, alcoholData));
        })
        .attr("r", d=> sizeScale(getValue(d.LOCATION, populationData)))
        .attr("fill", d=>cScale(d.LOCATION))
        .attr("opacity", 1)
        .on("mouseover", function(event, d){
            d3.select(this)
            .transition()
            .duration(200)
            .style("fill", "orange")
            .attr("r", sizeScale(getValue(d.LOCATION, populationData)));
        

            tooltip.style("opacity", 1)
                .html("Country: " + d.LOCATION + "<br/>smoke: " + d.Value + "<br/>alcohol: " + getValue(d.LOCATION, alcoholData) +"<br/>population: " + getValue(d.LOCATION, populationData))
                .style("left", (d3.pointer(event)[0] + margin.left) + "px")
                .style("top", (d3.pointer(event)[1] + 170) + "px");
        })
        .on("mouseout", function(d){
            d3.select(this)
              .transition()
              .duration(200)
              .style("fill", d=>cScale(d.LOCATION))
              // .attr("r", sizeScale(getValue(d.LOCATION, populationData)));
              // .attr("r", sizeScale(getValue(d.LOCATION, populationData)));

            // Remove tooltip
            tooltip.style("opacity", 0);
        });

    function getValue(location, Data) {
      var Value = Data.find(function (d) { return d.LOCATION === location; });
      if (!Value) console.log(Value, location, Data);
      return Value ? Value.Value : 0;
    }

}

var smokeSvg;
var alcoholSvg;

function drawLine(smokeData, alchoholData) {
    // Set up the chart dimensions
    var margin = { top: 20, right: 20, bottom: 30, left: 50 };
    var width = 600 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    // Create the SVG element
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    
    const smoke = svg
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
    smoke.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // Add the y-axis
    smoke.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value");

    // Add X axis label
    smoke.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2 - 10)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Year");

    // Add Y axis label
    smoke.append("text")
        .attr("class", "axis-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 50)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Smoke");

    const cScale = d3.scaleOrdinal()
      .range(d3.schemeSet3);

    // data grouping
    const smoke_group = d3.group(smokeData, d=>d.LOCATION);

    // Create a tooltip element
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);

    // Draw the line
    smoke.selectAll(".line")
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
                .style("left", (mouseX + margin.left*0.8) + "px") // Position the tooltip slightly to the right of the mouse cursor
                .style("top", (mouseY + margin.top*0.8) + "px"); // Position the tooltip slightly below the mouse cursor
                // .style("left", (d3.pointer(event)[0] + margin.left) + "px")
                // .style("top", (d3.pointer(event)[1] ) + "px");
        })
        
        .on("mouseout", function(d){
            // Hide tooltip or revert other interactions
            d3.select(this).attr("stroke-width", 1.5); // Increase the stroke width of the line
            tooltip.style("opacity", 0);
        });

    // Draw the labels for lines
    smoke.selectAll(".text")        
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
    // var legend = d3.select("#legend")
    //         .append("svg")
    //         .attr('width', width)
    //         .attr('height', 70)
    //             .append("g")
    //             .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
    // legend.append("text").attr("x", 0).attr("y", 18).text("Smoke Per Year").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');

    // Create the SVG element
    // alcoholSvg = d3.select("#chart")
    //   .append("svg")
    //   .attr("width", width + margin.left + margin.right)
    //   .attr("height", height + margin.top + margin.bottom)
    const alcohol = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + 300 + "," + margin.top + ")");

    // Define the scales and axes
    var xScale = d3.scaleTime()
      .domain(d3.extent(alchoholData, function (d) { return d.TIME; }))
      .range([0, width]);

    var yScale = d3.scaleLinear()
      .domain([0, d3.max([d3.max(alchoholData, function (d) { return d.Value; })])])
      .range([height, 0]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // Add the x-axis
    alcohol.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // Add the y-axis
    alcohol.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value");

    // Add X axis label
    alcohol.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Year");

    // Add Y axis label
    alcohol.append("text")
        .attr("class", "axis-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 50)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Alcohol");

    // data grouping
    const alchohol_group = d3.group(alchoholData, d=>d.LOCATION);

    // Create a tooltip element
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);

    // Draw the line
    alcohol.selectAll(".line")
        .data(alchohol_group)
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
            
            // here fix
            var xValue = xScale.invert(mouseX + 600); // Get the x value from the xScale
            var bisect = d3.bisector(function(d) { return d.TIME; }).left;
            var index = bisect(d[1], xValue); // Find the index of the data point closest to the x value

            var dataPoint = d[1][index]; // Get the specific data point
            var year = dataPoint.TIME;
            var alcohol = dataPoint.Value;
            

            // Show tooltip or perform other interactions
            tooltip.style("opacity", 1)
                .html("Country: " + d[0] + "<br/>Year: " + year + "<br/>Alcohol consumption: " + alcohol)
                .style("left", mouseX + margin.left*0.8 + "px")
                .style("top", mouseY + margin.top*0.8 + "px");
        })
        
        .on("mouseout", function(d){

            d3.select(this).attr("stroke-width", 1.5); // Increase the stroke width of the line   
            tooltip.style("opacity", 0);
        });

    // Draw the labels for lines
    alcohol.selectAll(".text")        
        .data(alchohol_group)
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
    // legend = d3.select("#legend")
    //         .append("svg")
    //         .attr('width', width)
    //         .attr('height', 70)
    //             .append("g")
    //             .attr("transform", `translate(${margin.left + 50},${margin.top})`);

    // legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
    // legend.append("text").attr("x", 18).attr("y", 18).text("Alcohol Per Year").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
}