var cur_year = 1990 // to 2019

var animationDuration = 1000; // Duration of each animation step in milliseconds
var animationDelay = 2000;
isPlaying = false;


Promise.all([
    d3.csv("../data/or_female_male.csv"),
    d3.csv("../data/or.csv"),
    d3.csv("../data/vs.csv")
  ])
  .then(function(data){

    var or_female_male = data[0].filter(d => !isNaN(d.or_male) && !isNaN(d.or_female) && !isNaN(d.Year) && +d.Year>=1990);
    or_female_male.forEach(d => {
        d.or_male = +d.or_male;
        d.or_female = +d.or_female;
        d.population = +d.population;
        d.Year = +d.Year;
      });

    var or_female = or_female_male.map(d => ({Entity: d.Entity, Year: d.Year, or: d.or_female}));
    var or_male = or_female_male.map(d => ({Entity: d.Entity, Year: d.Year, or: d.or_male}));
    

    var or = data[1].filter(d => !isNaN(d.or) && !isNaN(d.Year));
    or.forEach(d => {
        d.or = +d.or;
        d.Year = +d.Year;
    })

    const vs = data[2];


    // data filter should go here
    var cur_year_or_female_male = or_female_male.filter(d => d.Year == cur_year);

    drawBubble(cur_year_or_female_male);
    drawLine1(or_female);
    drawLine2(or_male);
  })

function drawLine2(data) {

    const margin = {top: 5, right: 30, bottom: 50, left: 50},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    // Define the position of the chart 
    const svg = d3.select("#chart")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        // .attr('width', 800)
        // .attr('height', 600)
          .attr("transform", `translate(${margin.left+600},${margin.top-300})`);

    // data grouping
    const group = d3.group(data, d=>d.Entity);

    // Create a scale for x-axis 
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.Year; }))
        .range([ 0, width ]);

    // Create a scale for y-axis
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.or; })])
        .range([ height, 0 ]);

    const cScale = d3.scaleOrdinal()
        .range(d3.schemeSet3);

    // Define the position of each axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    // Draw axes 
    const xAxisGroup = svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    const yAxisGroup = svg.append("g")
        .attr('class', 'y-axis')
        .call(yAxis)

    // Draw the line
    svg.selectAll(".line")
        .data(group)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return cScale(d[0]) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
            return d3.line()
            .x(function(d) { return xScale(d.Year); })
            .y(function(d) { return yScale(d.or); })
            (d[1])
        })

}

function drawLine1(data) {

    const margin = {top: 5, right: 30, bottom: 50, left: 50},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    // Define the position of the chart 
    const svg = d3.select("#chart")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        // .attr('width', 800)
        // .attr('height', 600)
          .attr("transform", `translate(${margin.left},${margin.top - 300})`);

    // data grouping
    const group = d3.group(data, d=>d.Entity);

    // Create a scale for x-axis 
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.Year; }))
        .range([ 0, width ]);

    // Create a scale for y-axis
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.or; })])
        .range([ height, 0 ]);

    const cScale = d3.scaleOrdinal()
        .range(d3.schemeSet3);

    // Define the position of each axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    // Draw axes 
    const xAxisGroup = svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    const yAxisGroup = svg.append("g")
        .attr('class', 'y-axis')
        .call(yAxis)

    // Draw the line
    svg.selectAll(".line")
        .data(group)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return cScale(d[0]) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
            return d3.line()
            .x(function(d) { return xScale(d.Year); })
            .y(function(d) { return yScale(d.or); })
            (d[1])
        })

}

function drawBubble(data) {
    d3.select("#chart svg").remove()
    d3.select("#legend svg").remove()

    const margin = {top: 5, right: 30, bottom: 50, left: 100},
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // Define the position of the chart 
    const svg = d3.select("#chart")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        // .attr('width', 800)
        // .attr('height', 600)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a scale for x-axis 
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d.or_female), d3.max(data, d=>d.or_female)])
        .range([0, width])

    // Create a scale for y-axis
    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d.or_male), d3.max(data, d=>d.or_male)])
        .range([height, 0])

    const cScale = d3.scaleOrdinal()
        .range(d3.schemeSet3);

    var sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.population)])
        .range([5, 50]);

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
        .text("Alcohol or Drug Use Disorders in Female");

    // Add Y axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 50)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Alcohol or Drug Use Disorders in Male");

    // Create a tooltip element
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);
        

    // Add circles representing the countries as bubbles

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            // console.log(d.or_female)
            return xScale(d.or_female);
        })
        .attr("cy", function(d) {
            // console.log(d.or_male)
            return yScale(d.or_male);
        })
        .attr("r", d=> sizeScale(d.population))
        .attr("fill", d=>cScale(d.Entity))
        .attr("opacity", 1)
        .on("mouseover", function(event, d){
            // Show tooltip or perform other interactions
            tooltip.style("opacity", 1)
                .html("Country: " + d.Entity + "<br/>or_female: " + d.or_female + "<br/>or_male: " + d.or_male)
                .style("left", (d3.pointer(event)[0] + margin.left) + "px")
                .style("top", (d3.pointer(event)[1] + margin.top) + "px");
        })
        .on("mouseout", function(d){
            tooltip.style("opacity", 0);
        });
}