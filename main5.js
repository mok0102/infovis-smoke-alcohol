var curYear = 1980;
var smokeSvg;
var alcoholSvg;
var mapSvg;
var bubbleSvg;

var joinedData;

var smokeData;
var alcoholData;
var populationData;
var gdpData;

var isPlaying = false;

var curState = "all";

var selectedCountries;

const cScale = d3.scaleOrdinal()
    .range(d3.schemeSet3)
    // .range(d3.schemeCategory10)

var colorScale = d3.scaleSequential(d3.interpolateBlues)
    // .domain([0, d3.max(populationData, d=>d.Value)])
    .domain([-20, 20])

    // var colorScale = d3.scaleSequential(d3.interpolateBlues) // for population
    // // .domain([0, d3.max(populationData, d=>d.Value)])
    // .domain([0, 400])

Promise.all([
    d3.csv("smoke.csv"),
    d3.csv("alcohol.csv"),
    d3.csv("population.csv"),
    d3.csv("gdp_growth.csv"),
    d3.csv("smoke_alcohol_pop_merged.csv")
  ]).then(function (data) {
    smokeData = data[0];
    alcoholData = data[1];
    populationData = data[2];
    gdpData =data[3];

    // Parse the data
    var parseDate = d3.timeParse("%Y");
    smokeData.forEach(function (d) {
        d.TIME = parseDate(d.TIME);
        d.Value = +d.Value;
    });

    smokeData = smokeData.filter(function(d){
        return parseInt(new Date(d.TIME).getFullYear()) % 5 ===0;
    })

    

    alcoholData.forEach(function(d){
        d.TIME = parseDate(d.TIME);
        d.Value = +d.Value;
    })

    alcoholData = alcoholData.filter(function(d){
        return parseInt(new Date(d.TIME).getFullYear()) % 5 ===0;
    })

    populationData.forEach(function(d){
        d.TIME = parseDate(d.TIME);
        d.Value = +d.Value;
    })

    // Merge the datasets using the map
    var mergedData = data[4];
    mergedData.forEach(d => {
        d.TIME = parseDate(d.TIME);
        d.Smokers_Value = +d.Smokers_Value;
        d.Alcohol_Value = +d.Alcohol_Value;
        d.Population_Value = +d.Population_Value;
    })

    // Assuming you have an array of countries called 'countries'
    const checkboxContainer = d3.select("#scrollable-list");
    selectedCountries = checkboxContainer
                .selectAll("input[type='checkbox']")
                .nodes()
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.parentNode.textContent.trim());

    const countries = Array.from(new Set(smokeData.map(d => d.LOCATION)));
    checkboxContainer
        .selectAll("label")
        .data(countries)
        .enter()
        .append("div")
            .append("label")
            .style("display", "flex")
            .style("flex-wrap", "wrap")
            .style("font-weight", "normal")
            .style("justify-content", "center")
        .text(d => d)
        .append("input")
        .attr("type", "checkbox")
        .property("checked", true)
        .on("change", updateall);
        // .attr("value", d => d);s


    function updateall(){
        selectedCountries = checkboxContainer
            .selectAll("input[type='checkbox']")
            .nodes()
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.parentNode.textContent.trim());

        if (selectedCountries.includes("Select All")) return;

        d3.selectAll("#chart svg").remove()
        d3.selectAll("#legend text").remove()
        d3.selectAll("#otherchart svg").remove()
        const tmp_smokeData = smokeData.filter(d => selectedCountries.includes(d.LOCATION));
            const tmp_alcoholData = alcoholData.filter(d => selectedCountries.includes(d.LOCATION));
            const tmp_mergedData = mergedData.filter(d => selectedCountries.includes(d.Country));
            const tmp_gdpData = gdpData.filter(d => selectedCountries.includes(d.Code));
            if(curState=="all"){
                const play = d3.select("#play").property("disabled", true)
                drawSmokeLine(tmp_smokeData);
                drawAlcoholLine(tmp_alcoholData);
                drawBubble(tmp_mergedData);
                d3.json("countries.geojson").then(function(geodata){
                    // drawMap(tmp_populationData, geodata);
                    drawGdpMap(tmp_gdpData, geodata);
                })
    
            }
            else if(curState=="bubble"){
                console.log("herre!!!")
                const play = d3.select("#play").property("disabled", false)
                drawSmokeLine(tmp_smokeData, norm=true);
                drawAlcoholLine(tmp_alcoholData, norm=true);
                drawBubble(tmp_mergedData);
                d3.json("countries.geojson").then(function(geodata){
                    // drawMap(tmp_populationData, geodata);
                    drawGdpMap(tmp_gdpData, geodata)
                })
            }
    }

    // Select All checkbox functionality
    const selectAllCheckbox = d3.select("#select-all");
    
    
    selectAllCheckbox.on("change", function () {
        checkboxContainer.selectAll("input[type='checkbox']").property("checked", this.checked);

        if (selectAllCheckbox.property("checked")){
            d3.selectAll("#chart svg").remove()
            d3.selectAll("#legend text").remove()
            d3.selectAll("#otherchart svg").remove()
            if(curState=="all"){
                const play = d3.select("#play").property("disabled", true)
                drawSmokeLine(smokeData);
                drawAlcoholLine(alcoholData);
                drawBubble(mergedData);
                d3.json("countries.geojson").then(function(geodata){
                    // drawMap(populationData, geodata);
                    drawGdpMap(gdpData, geodata);
                })
    
            }
            else if(curState=="bubble"){
                const play = d3.select("#play").property("disabled", false)
                drawSmokeLine(smokeData, norm=true);
                drawAlcoholLine(alcoholData, norm=true);
                drawBubble(mergedData);
                d3.json("countries.geojson").then(function(geodata){
                    // drawMap(populationData, geodata);
                    drawGdpMap(gdpData, geodata)
                })
            }

        }
        else{
            console.log("here!")
            selectedCountries = checkboxContainer
                .selectAll("input[type='checkbox']")
                .nodes()
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.parentNode.textContent.trim());

            console.log(selectedCountries)
            d3.selectAll("#chart svg").remove()
            d3.selectAll("#legend text").remove()
            d3.selectAll("#otherchart svg").remove()

        
            if (selectedCountries.includes("Select All")) return;

            const tmp_smokeData = smokeData.filter(d => selectedCountries.includes(d.LOCATION));
            const tmp_alcoholData = alcoholData.filter(d => selectedCountries.includes(d.LOCATION));
            const tmp_mergedData = mergedData.filter(d => selectedCountries.includes(d.Country));
            const tmp_gdpData = gdpData.filter(d => selectedCountries.includes(d.Code));
            if(curState=="all"){
                const play = d3.select("#play").property("disabled", true)
                drawSmokeLine(tmp_smokeData);
                drawAlcoholLine(tmp_alcoholData);
                drawBubble(tmp_mergedData);
                d3.json("countries.geojson").then(function(geodata){
                    // drawMap(tmp_populationData, geodata);
                    drawGdpMap(tmp_gdpData, geodata);
                })
    
            }
            else if(curState=="bubble"){
                const play = d3.select("#play").property("disabled", false)
                drawSmokeLine(tmp_smokeData, norm=true);
                drawAlcoholLine(tmp_alcoholData, norm=true);
                drawBubble(tmp_mergedData);
                d3.json("countries.geojson").then(function(geodata){
                    // drawMap(tmp_populationData, geodata);
                    drawGdpMap(tmp_gdpData, geodata)
                })
            }
        }
    });
    // const play = d3.select("#play").property("disabled", true)

    drawSmokeLine(smokeData, norm=true);
    drawAlcoholLine(alcoholData, norm=true);
    drawBubble(mergedData, norm=true);
    d3.json("countries.geojson").then(function(geodata){
        // drawMap(populationData, geodata);
        drawGdpMap(gdpData, geodata);
    })

    // Add a text element for displaying the year
    var yearText = d3.select("#slider-container")
        .append("text")
        .attr("id", "year-text")
        // .attr("x", +20)
        // .attr("y", +10)
        .style("margin-left", '20px')
        .text("Year: " + curYear);

    // Initialize the slider with the range of years
    var slider = document.getElementById('slider');
    noUiSlider.create(slider, {
        start: 1960,
        connect: [true, false],
        step: 1,
        range: {
            'min': 1960,
            'max': 2020
        },
        pips: {
            mode: 'values',
            values: [1960, 2020],
            density: 1
          }
        });

    slider.noUiSlider.set(curYear);

    // Listen for slider value changes
    slider.noUiSlider.on('change', function(values) {
        var startYear = parseInt(values[0]);

        curYear = startYear;
        yearText.text("Year: " + curYear);

        d3.selectAll("#chart svg").remove()
        d3.selectAll("#legend text").remove()
        d3.selectAll("#otherchart svg").remove()
        selectedCountries = checkboxContainer
                .selectAll("input[type='checkbox']")
                .nodes()
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.parentNode.textContent.trim());

        const tmp_smokeData = smokeData.filter(d => selectedCountries.includes(d.LOCATION));
        const tmp_alcoholData = alcoholData.filter(d => selectedCountries.includes(d.LOCATION));
        const tmp_mergedData = mergedData.filter(d => selectedCountries.includes(d.Country));
        const tmp_populationData = populationData.filter(d => selectedCountries.includes(d.LOCATION));
        const tmp_gdpData = gdpData.filter(d => selectedCountries.includes(d.Code))

        if(curState=="all"){
            const play = d3.select("#play").property("disabled", true)
            drawSmokeLine(tmp_smokeData);
            drawAlcoholLine(tmp_alcoholData);
            drawBubble(tmp_mergedData);
            d3.json("countries.geojson").then(function(geodata){
                // drawMap(tmp_populationData, geodata);
                drawGdpMap(tmp_gdpData, geodata);
            })

        }
        else if(curState=="bubble"){
            const play = d3.select("#play").property("disabled", false)
            drawSmokeLine(tmp_smokeData, norm=true);
            drawAlcoholLine(tmp_alcoholData, norm=true);
            drawBubble(tmp_mergedData);
            d3.json("countries.geojson").then(function(geodata){
                // drawMap(tmp_populationData, geodata);
                drawGdpMap(tmp_gdpData, geodata)
            })
        }
    });

    const bubble = d3.select("#bubble")
        .on("click", function(d){
        curState = "bubble";
        const play = d3.select("#play").property("disabled", false)
        d3.selectAll("#chart svg").remove()
        d3.selectAll("#legend text").remove()
        d3.selectAll("#otherchart svg").remove()

        selectedCountries = checkboxContainer
                .selectAll("input[type='checkbox']")
                .nodes()
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.parentNode.textContent.trim());
        
        const tmp_smokeData = smokeData.filter(d => selectedCountries.includes(d.LOCATION));
        const tmp_alcoholData = alcoholData.filter(d => selectedCountries.includes(d.LOCATION));
        const tmp_mergedData = mergedData.filter(d => selectedCountries.includes(d.Country));
        const tmp_populationData = populationData.filter(d => selectedCountries.includes(d.LOCATION));
        const tmp_gdpData = gdpData.filter(d => selectedCountries.includes(d.Code));

        drawSmokeLine(tmp_smokeData, norm=true);
        drawAlcoholLine(tmp_alcoholData, norm=true);
        drawBubble(tmp_mergedData);
        d3.json("countries.geojson").then(function(geodata){
            // drawMap(tmp_populationData, geodata);
            drawGdpMap(tmp_gdpData, geodata);
        })
        })

    const line = d3.select("#line")
        .on("click", function(d){
            const play = d3.select("#play").property("disabled", true)

        curState = "all"
        d3.selectAll("#chart svg").remove()
        d3.selectAll("#legend text").remove()
        d3.selectAll("#otherchart svg").remove()

        selectedCountries = checkboxContainer
                .selectAll("input[type='checkbox']")
                .nodes()
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.parentNode.textContent.trim());

        const tmp_smokeData = smokeData.filter(d => selectedCountries.includes(d.LOCATION));
        const tmp_alcoholData = alcoholData.filter(d => selectedCountries.includes(d.LOCATION));
        const tmp_mergedData = mergedData.filter(d => selectedCountries.includes(d.Country));
        const tmp_populationData = populationData.filter(d => selectedCountries.includes(d.LOCATION));
        const tmp_gdpData = gdpData.filter(d => selectedCountries.includes(d.Code));
        drawSmokeLine(tmp_smokeData);
        drawAlcoholLine(tmp_alcoholData);
        drawBubble(tmp_mergedData);
        d3.json("countries.geojson").then(function(geodata){
            // drawMap(tmp_populationData, geodata);
            drawGdpMap(tmp_gdpData, geodata);
        })
        })

    var geo;
     d3.json("countries.geojson").then(function(geodata){
        geo = geodata;
    })

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);
    
    var colorScale = d3.scaleSequential(d3.interpolateBlues)
        // .domain([0, d3.max(populationData, d=>d.Value)])
        .domain([-30, 30])

    // Create a scale for x-axis 
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d.Smokers_Value), d3.max(data, d=>d.Smokers_Value)])
        .range([0, width])

    // Create a scale for y-axis
    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d.Alcohol_Value), d3.max(data, d=>d.Alcohol_Value)])
        .range([height, 0])

    var sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.Population_Value)*0.01])
        .range([3, 10]);

    const playbtn = d3.select("#play")
    
    .on("click", function(d){
        if (isPlaying) {
            // Pause the animation if already playing
            clearInterval(interval);
            isPlaying = false;
            d3.select(this).style("background-color", "red");
            d3.select(this).text("Not Playing")
            
          } 
        else {
            // Start the animation if not already playing
            isPlaying = true;
            d3.select(this).style("background-color", "aqua");
            d3.select(this).text("Playing")
            currentYear = curYear;
            
            interval = setInterval(function() {
              // Increment the current year
              currentYear++;

        
              // Check if the current year exceeds the endYear
              if (currentYear > 2020) {
                clearInterval(interval);
                isPlaying = false;
                d3.select(this).style("background-color", "red");
                d3.select(this).text("Not Playing")
                return;
              }

              yearText.text("Year: " + curYear);
        
              // Set the slider value to the current year
              slider.noUiSlider.set(currentYear);
              curYear = currentYear;
              const tmp_mergedData = mergedData.filter(d => selectedCountries.includes(d.Country));

            //   const tmppop = populationData.filter(function(d){
            //     return new Date(d.TIME).getFullYear()==curYear && selectedCountries.includes(d.LOCATION);
            //     });
            
            // const jjoinData = d3.group(populationData.filter(function(d){
            //     return new Date(d.TIME).getFullYear()==curYear-1 && selectedCountries.includes(d.LOCATION);
            //     }), d=>d.LOCATION)
                
                bubbleSvg.selectAll('circle')
                    .filter(function(bubbled){
                        return bubbled && curYear-1 === parseInt(new Date(bubbled.TIME).getFullYear());
                    })
                    .transition()
                    .duration(200)
                    .attr("r", 3)
                    .attr("fill", d=> cScale(d.Country))
                    .attr("stroke", "none");

                bubbleSvg.selectAll('circle')
                    .filter(function(bubbled){
                        console.log(curYear, parseInt(new Date(bubbled.TIME).getFullYear()))
                        return bubbled && curYear === parseInt(new Date(bubbled.TIME).getFullYear());
                    })
                    .transition()
                    .duration(200)
                    .attr("r", function(d){
                        return d3.min([(d.Population_Value)*0.1+10, 15])
                        // return 15
                    })
                    // .attr("stroke", d=> cScale(d.Country))
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    
                    
                    

                // Join population data with location coordinates
                const tmp_gdpData = gdpData.filter(d => selectedCountries.includes(d.Code));
                tmp_gdpData.forEach(function(d){
                    d.LOCATION = d.Code
                    d.TIME = curYear;
                    d.Value = +d[curYear.toString()];
                    // console.log(d.LOCATION, d.TIME, d.Value)
                })

                joinedData = d3.group(tmp_gdpData, d => d.LOCATION);

                mapSvg.selectAll('path')
                    .transition()
                    .duration(200)
                    .attr("fill", function(dd) {
                        var location = dd.properties.ISO_A3;
                        var population = joinedData.get(location);
                        // console.log(location);
                        // if (population) console.log(population[0].Value);
                        return colorScale(population ? +population[0].Value: 0);
                    })
                    .attr("stroke", "#fff")
            
              
            }, 1000); // Adjust the interval duration (in milliseconds) as needed
          }
    });
})

function drawGdpMap(gdpData, geojsonData){
    gdpData.forEach(function(d){
        d.LOCATION = d.Code
        d.TIME = curYear;
        d.Value = +d[curYear.toString()];
        // console.log(d.LOCATION, d.TIME, d.Value)
    })

    var margin = { top: 20, right: 20, bottom: 30, left: 0};
    width = 600 - margin.left - margin.right,
    height = 300;// - margin.top - margin.bottom;

    // Create an SVG container
    mapSvg = d3.select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
          .attr("transform", `translate(${0},${5})`);

    // Create a projection
    var projection = d3.geoMercator()
      .fitSize([width, height], geojsonData);

    // Create a path generator
    var path = d3.geoPath()
      .projection(projection);

    // Join population data with location coordinates
    joinedData = d3.group(gdpData, d => d.LOCATION);

    // Define color scale
    // var colorScale = d3.scaleSequential(d3.interpolateBlues)

    // Create a tooltip element
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);

    // Draw the map
    mapSvg.selectAll("path")
      .data(geojsonData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function(dd) {
        var location = dd.properties.ISO_A3;
        var gdp = joinedData.get(location);
        // console.log(location);
        // if (population) console.log(population[0].Value);
        return colorScale(gdp ? +gdp[0].Value : 0);
        
      })
      // Add mouseover event listener
    .on("mouseover", function(event, dd) {
        // Calculate the position of the tooltip
        var x = event.pageX + 10;
        var y = event.pageY + 10;

        const location = dd.properties.ISO_A3;
        const population = joinedData.get(location);

        // Highlight the country
        d3.select(this)
            .transition()
            .duration(200)
            .attr("fill", cScale(dd.properties.ISO_A3))
            .attr("stroke", "#fff")

        smokeSvg.selectAll('path')
            .filter(function(smoked){
                return smoked && dd.properties.ISO_A3 == smoked[0];
            })
            .transition()
            .duration(200)
            .attr("stroke-width", 8);

        alcoholSvg.selectAll('path')
            .filter(function(alcohold){
                return alcohold && dd.properties.ISO_A3 == alcohold[0];
            })
            .transition()
            .duration(200)
            // .attr("stroke", "black")
            .attr("stroke-width", 8);

        bubbleSvg.selectAll('circle')
            .filter(function(bubbled){
                return bubbled && dd.properties.ISO_A3 == bubbled.Country;
            })
            .transition()
            .duration(200)
            .attr("stroke", d => cScale(d.Country))
            .attr("stroke-width", 5)
            // .attr("fill", "orange");
  
        // Set the content and position of the tooltip
        // if (population!=null){
        tooltip.html("Country: " + location + "<br/>Year: " + curYear + "<br/>Gdp Growth: " + (population ? population[0].Value : "N/A"))
            .style("left", x + "px")
            .style("top", y + "px")
            .style("opacity", 1);
        // }
      })
      .on("mouseout", function() {

        // Restore the original style of the country
        d3.select(this)
            .transition()
            .duration(200)
            .attr("fill", function(dd) {
                var location = dd.properties.ISO_A3;
                var population = joinedData.get(location);
                return colorScale(population ? +population[0].Value : 0);
            })
            .attr("stroke", "none");

        bubbleSvg.selectAll('circle')
            .transition()
            .duration(200)
            .attr("fill", d=> cScale(d.Country))
            .attr("stroke", "none");


        smokeSvg.selectAll('path')
            .transition()
            .duration(200)
            // .attr("stroke-width", 1+norm*0.5);
            .attr("stroke-width", function(d){
                if(curState=="bubble") return 1;
                else return 1.5;
            })

        alcoholSvg.selectAll('path')
            .transition()
            .duration(200)
            // .attr("stroke", d=>cScale(d.LOCATION))
            // .attr("stroke-width", 1+norm*0.5);
            .attr("stroke-width", function(d){
                if(curState=="bubble") return 1;
                else return 1.5;
            })
        // Hide the tooltip on mouseout
        tooltip.style("opacity", 0);
      });

      if (curState=="choropleth"){
        d3.select("#otherchart div")
            // .style("flex", "1 100%")
            // .style("max-width", "100%")
            .style("margin-left", "10px")
    }
}

function drawMap(populationData, geojsonData){

    populationData = populationData.filter(function(d){
        return new Date(d.TIME).getFullYear()==curYear;
    });

    var margin = { top: 20, right: 20, bottom: 30, left: 0};
    width = 600;// - margin.left - margin.right,
    height = 300;// - margin.top - margin.bottom;

    // Create an SVG container
    mapSvg = d3.select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
          .attr("transform", `translate(${0},${5})`);

    // Create a projection
    var projection = d3.geoMercator()
      .fitSize([width, height], geojsonData);

    // Create a path generator
    var path = d3.geoPath()
      .projection(projection);

    // Join population data with location coordinates
    joinedData = d3.group(populationData, d => d.LOCATION);

    // Define color scale
    // var colorScale = d3.scaleSequential(d3.interpolateBlues)
    colorScale = d3.scaleSequential(d3.interpolateBlues)
        // .domain([0, d3.max(populationData, d=>d.Value)])
        .domain([0, 400])

    // Create a tooltip element
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);

    // Draw the map
    mapSvg.selectAll("path")
      .data(geojsonData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function(dd) {
        var location = dd.properties.ISO_A3;
        var population = joinedData.get(location);
        // console.log(location);
        // if (population) console.log(population[0].Value);
        return colorScale(population ? +population[0].Value : 0);
        
      })
      // Add mouseover event listener
    .on("mouseover", function(event, dd) {
        // Calculate the position of the tooltip
        var x = event.pageX + 10;
        var y = event.pageY + 10;

        const location = dd.properties.ISO_A3;
        const population = joinedData.get(location);

        // Highlight the country
        d3.select(this)
            .transition()
            .duration(200)
            .attr("fill", cScale(dd.properties.ISO_A3))
            .attr("stroke", "#fff")

        smokeSvg.selectAll('path')
            .filter(function(smoked){
                return smoked && dd.properties.ISO_A3 == smoked[0];
            })
            .transition()
            .duration(200)
            .attr("stroke-width", 8);

        alcoholSvg.selectAll('path')
            .filter(function(alcohold){
                return alcohold && dd.properties.ISO_A3 == alcohold[0];
            })
            .transition()
            .duration(200)
            // .attr("stroke", "black")
            .attr("stroke-width", 8);

        bubbleSvg.selectAll('circle')
            .filter(function(bubbled){
                return bubbled && dd.properties.ISO_A3 == bubbled.Country;
            })
            .transition()
            .duration(200)
            .attr("stroke", d => cScale(d.Country))
            .attr("stroke-width", 5)
            // .attr("fill", "orange");
  
        // Set the content and position of the tooltip
        // if (population!=null){
        tooltip.html("Country: " + location + "<br/>Year: " + curYear + "<br/>Population: " + (population ? population[0].Value : "N/A"))
            .style("left", x + "px")
            .style("top", y + "px")
            .style("opacity", 1);
        // }
      })
      .on("mouseout", function() {

        // Restore the original style of the country
        d3.select(this)
            .transition()
            .duration(200)
            .attr("fill", function(dd) {
                var location = dd.properties.ISO_A3;
                var population = joinedData.get(location);
                return colorScale(population ? +population[0].Value : 0);
            })
            .attr("stroke", "none");

        bubbleSvg.selectAll('circle')
            .transition()
            .duration(200)
            .attr("fill", d=> cScale(d.Country))
            .attr("stroke", "none");


        smokeSvg.selectAll('path')
            .transition()
            .duration(200)
            // .attr("stroke-width", 1.5);//
            .attr("stroke-width", d=>{
                if(norm) return 1;
                else return 1.5;
            })

        alcoholSvg.selectAll('path')
            .transition()
            .duration(200)
            // .attr("stroke", d=>cScale(d.LOCATION))
            // .attr("stroke-width", 1.5);//
            .attr("stroke-width", d=>{
                if(norm) return 1;
                else return 1.5;
            })
        // Hide the tooltip on mouseout
        tooltip.style("opacity", 0);
      });

      if (curState=="choropleth"){
        d3.select("#otherchart div")
            // .style("flex", "1 100%")
            // .style("max-width", "100%")
            .style("margin-left", "10px")
    }

  }
    

function drawBubble(data) {    

    var margin = { top: 20, right: 0, bottom: 30, left: 50 };
    width = 550 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    // Define the position of the chart 
    bubbleSvg = d3.select("#bubblechart")
       .append("svg")
       .attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a scale for x-axis 
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d.Smokers_Value), d3.max(data, d=>d.Smokers_Value)])
        .range([0, width])

    // Create a scale for y-axis
    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d.Alcohol_Value), d3.max(data, d=>d.Alcohol_Value)])
        .range([height, 0])

    var sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.Population_Value)])
        .range([5, 50]);

    // data = data.filter(function(d){
    //     return new Date(d.TIME).getFullYear()==curYear;
    // });

    // Define the position of each axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Draw axes 
    bubbleSvg.append("g")
        .attr('class', 'x-axis')
        .attr("stroke-width", 1.5)
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    bubbleSvg.append("g")
        .attr('class', 'y-axis')
        .attr("stroke-width", 1.5)
        .call(yAxis)

    // Add X axis label
    bubbleSvg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Smoke");

    // Add Y axis label
    bubbleSvg.append("text")
        .attr("class", "axis-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Alcohol");

    // Create a tooltip element
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);
    
    // var colorScale = d3.scaleSequential(d3.interpolateBlues)
    //         .domain([0, 400])

    // Add circles representing the countries as bubbles
    bubbleSvg.selectAll("circle")
        .data(data)
        .enter()
        
        .append("circle")
        .attr("cx", function(d) {
            // console.log(d.or_female)
            return xScale(d.Smokers_Value);
        })
        .attr("cy", function(d) {
            // return yScale(getValue(d.LOCATION, alcoholData));
            return yScale(d.Alcohol_Value);
        })
        // .attr("r", d=> sizeScale(d.Population_Value))
        .attr("r", d=>3)
        .attr("fill", d=>cScale(d.Country))
        .attr("opacity", 1)
        .on("mouseover", function(event, d){
            d3.select(this)
                .transition()
                .duration(200)
                // .style("fill", "orange")
                .attr("r", 10);

            smokeSvg.selectAll('path')
                .filter(function(smoked){
                    return smoked && d.Country == smoked[0];
                })
                .transition()
                .duration(200)
                .attr("stroke-width", 8);

            alcoholSvg.selectAll('path')
                .filter(function(alcohold){
                    return alcohold && d.Country == alcohold[0];
                })
                .transition()
                .duration(200)
                // .attr("stroke", "black")
                .attr("stroke-width", 8);

            mapSvg.selectAll('path')
                .filter(function(mapd){
                    // console.log(d[0], mapd.properties.ISO_A3);
                    return mapd && d.Country == mapd.properties.ISO_A3;
                })
                .transition()
                .duration(200)
                .attr("fill", cScale(d.Country))
                .attr("stroke", "#fff")
        
            tooltip.style("opacity", 1)
                .html("Country: " + d.Country + "<br/>Year: " + new Date(d.TIME).getFullYear() + "<br/>smoke: " + d.Smokers_Value + "<br/>alcohol: " + d.Alcohol_Value +"<br/>population: " + d.Population_Value)
                .style("left", (d3.pointer(event)[0] + margin.left) + "px")
                .style("top", (d3.pointer(event)[1] + 400) + "px");
        })
        .on("mouseout", function(d){
            d3.select(this)
              .transition()
              .duration(200)
            //   .attr("r", d=>sizeScale(d.Population_Value))
                .attr("r", d=>3)
              .style("fill", d=>cScale(d.Country));

            smokeSvg.selectAll('path')
              .transition()
              .duration(200)
            //   .attr("stroke-width", 1.5);
            .attr("stroke-width", function(d){
                if(curState=="bubble") return 1;
                else return 1.5;
            })
  
            alcoholSvg.selectAll('path')
              .transition()
              .duration(200)
              // .attr("stroke", d=>cScale(d.LOCATION))
            //   .attr("stroke-width", 1.5);
            .attr("stroke-width", function(d){
                if(curState=="bubble") return 1;
                else return 1.5;
            })

            mapSvg.selectAll('path')
              .transition()
              .duration(200)
              .attr("fill", function(mapd){
                  var location = mapd.properties.ISO_A3;
                  var population = joinedData.get(location);
                  // console.log(location)
                  return colorScale(population ? +population[0].Value : 0);
              })
              .attr("stroke", "none")

            // Remove tooltip
            tooltip.style("opacity", 0);
        });

}

function drawAlcoholLine(alchoholData, norm=false) {
    // Set up the chart dimensions
    var margin = { top: 20, right: 20, bottom: 30, left: 80 };
    var width = 600 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;

    var save_alcoholData = alchoholData;

    if (norm){
        var groupedData = d3.group(alchoholData, d => d.LOCATION);

        // Calculate minimum and maximum values for each country's alcohol values
        var countryStats = new Map();
        groupedData.forEach(function(values, country) {
            var alcoholValues = values.map(d => parseFloat(d.Value));
            var minValue = d3.mean(alcoholValues);
            var maxValue = d3.deviation(alcoholValues);
            countryStats.set(country, { minValue: minValue, maxValue: maxValue });
        });

        // Normalize the alcohol values for each country
        alchoholData.forEach(function(d) {
            var country = d.LOCATION;
            var alcoholValue = parseFloat(d.Value);
            var stats = countryStats.get(country);
            var normalizedValue = (alcoholValue - stats.minValue) / (stats.maxValue)// - stats.minValue);
            d.normalizedValue = +normalizedValue;
            // console.log(d.normalizedValue);
        });
    }

    // Create the SVG element
    alcoholSvg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define the scales and axes
    var xScale = d3.scaleTime()
      .domain(d3.extent(alchoholData, function (d) { return d.TIME; }))
      .range([0, width]);

    // var yScale = d3.scaleLinear()
    //   .domain([d3.min([d3.min(alchoholData, function (d) { return d.Value; })]), d3.max([d3.max(alchoholData, function (d) { return d.Value*0.735; })])])
    //   .range([height, 0]);

    var yScale = d3.scaleLinear()
      .domain([d3.min([d3.min(alchoholData, function (d) { 
        if (norm) return d.normalizedValue*1.2;
        else return d.Value; 
    })]), d3.max([d3.max(alchoholData, function (d) { 
            // return d.Value*0.735; 
            if (norm) return d.normalizedValue*1.2;
            else return d.Value; 
        })])])
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
      .attr("stroke-width", 1.5)
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
        .attr("stroke-width", 1.5)
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Year");

    // Add Y axis label
    alcoholSvg.append("text")
        .attr("class", "axis-label")
        .attr("stroke-width", 1.5)
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

    const joinedData = d3.group(gdpData, d => d.Code);

    // const lineScale = d3.scaleSequentialLog(d3.interpolatePuBuGn)
    //     .domain([0, 20])

    // Draw the line
    alcoholSvg.selectAll(".line")
        .data(alchohol_group)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ 
            if (norm){ 
                // return "#69b3a2"
                var location = d[0];
                var gdp = joinedData.get(location);
                // console.log(joinedData)
                // console.log(gdp)
                // console.log(gdp[0][curYear])
                // if (gdp[0][curYear]>5 && gdp[0][curYear]) return "orange";
                // else return "#69b3a2";
                return colorScale(gdp ? +gdp[0][curYear] : 0);
            }
            else return cScale(d[0]) ;
        })
        .attr("stroke-width", d=>{
            if(norm) return 1;
            else return 1.5;
        })
        .attr("d", function(d){
            return d3.line()
            .x(function(d) { return xScale(d.TIME); })
            .y(function(d) { 
                if (norm) return yScale(d.normalizedValue);
                else return yScale(d.Value); 
            })
            (d[1])
        })
        .on("mouseover", function(event, d){

            d3.select(this).attr("stroke-width", 8); // Increase the stroke width of the line    

            var mouseX = event.pageX - margin.left; // Calculate the mouse x-coordinate relative to the chart
            var mouseY = event.pageY - margin.top; // Calculate the mouse y-coordinate relative to the chart

            var xValue = xScale.invert(d3.pointer(event)[0]);
            // var xValue = xScale.invert(mouseX); // Get the x value from the xScale
            var bisect = d3.bisector(function(d) { return d.TIME; }).left;
            var index = bisect(d[1], xValue); // Find the index of the data point closest to the x value            

            var dataPoint = d[1][index]; // Get the specific data point
            var year = dataPoint.TIME.getFullYear();
            var alcohol = dataPoint.Value;

            smokeSvg.selectAll('path')
                .filter(function(smoked){
                    return smoked && d[0] == smoked[0];
                })
                .transition()
                .duration(200)
                .attr("stroke-width", 8);

            // Highlight the country
            // d3.select(this)
            mapSvg.selectAll('path')
                .filter(function(mapd){
                    // console.log(d[0], mapd.properties.ISO_A3);
                    return mapd && d[0] == mapd.properties.ISO_A3;
                })
                .transition()
                .duration(200)
                .attr("fill", cScale(d[0]))
                .attr("stroke", "#fff")

            bubbleSvg.selectAll('circle')
                .filter(function(bubbled){
                    return bubbled && d[0] == bubbled.Country;
                })
                .transition()
                .duration(200)
                .attr("stroke", d => cScale(d.Country))
                .attr("stroke-width", 5)
            

            // Show tooltip or perform other interactions
            tooltip.style("opacity", 1)
                .html("Country: " + d[0] + "<br/>Year: " + year + "<br/>Alcohol consumption: " + alcohol)
                // .style("left", (d3.pointer(event)[0] + margin.left) + "px")
                // .style("top", (d3.pointer(event)[1]) + "px");
                .style("left", mouseX + margin.left*0.8 + "px")
                .style("top", mouseY + margin.top*0.8 + "px");
        })
        
        .on("mouseout", function(d){
            d3.select(this)
                .transition()
                .duration(200)
                .attr("stroke-width", d=>{
                    if(norm) return 1;
                    else return 1.5;
                }) // Increase the stroke width of the line   

            smokeSvg.selectAll('path')
                .transition()
                .duration(200)
                .attr("stroke-width", d=>{
                    if(norm) return 1;
                    else return 1.5;
                })

            // var colorScale = d3.scaleSequential(d3.interpolateBlues)
            //     .domain([0, 400])

            mapSvg.selectAll('path')
                .transition()
                .duration(200)
                .attr("fill", function(mapd){
                    var location = mapd.properties.ISO_A3;
                    var population = joinedData.get(location);
                    // console.log(location)
                    return colorScale(population ? +population[0].Value : 0);
                })
                .attr("stroke", "none")

            bubbleSvg.selectAll('circle')
                .transition()
                .duration(200)
                .attr("stroke", "none")

            tooltip.style("opacity", 0);
        });

    // Draw the labels for lines
    alcoholSvg.selectAll(".text")        
        .data(alchohol_group)
        .enter()
        .append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 13)
        .attr("class","label")
        .attr("x", function(d) { return xScale(d[1][d[1].length-1].TIME); }  )
        .attr("y", function(d) { 
            if (norm) return yScale(d[1][d[1].length-1].normalizedValue);
            else return yScale(d[1][d[1].length-1].Value); })
        .attr("fill", function(d) {
            if (norm){ 
                // return "#69b3a2"
                var location = d[0];
                var gdp = joinedData.get(location);
                // console.log(joinedData)
                // console.log(gdp)
                // console.log(gdp[0][curYear])
                // if (gdp[0][curYear]>5 && gdp[0][curYear]) return "orange";
                // else return "#69b3a2";
                return colorScale(gdp ? +gdp[0][curYear] : 0);
            }
            else return cScale(d[0]) ;
        })
        .attr("dy", ".75em")
        .text(function(d) { 
            return d[0]
         }); 

    // Create a new group for the tick lines
    var tickLines = alcoholSvg.append("g").attr("class", "tick-lines");

    // Select the tick elements and create a selection for the tick lines
    var tickElements = alcoholSvg.selectAll(".x.axis .tick");
    console.log(tickElements)

    // Append a line for each tick
    tickLines
    .selectAll(".tick-line")
    .data(tickElements.data())
    .enter()
    .append("line")
    .attr("class", "tick-line")
    .attr("x1", function (d) {
        return xScale(d);
    })
    .attr("x2", function (d) {
        return xScale(d);
    })
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", "#ccc")
    .style("stroke-width", 1);
    
         
    // Legend    
    // const legend = d3.select("#legend")
    //         .append("svg")
    //         .attr('width', width)
    //         .attr('height', 70)
    //             .append("g")
    //             .attr("transform", `translate(${margin.left + 50},${margin.top})`);

    // // legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
    // legend.append("text").attr("x", 18).attr("y", 18).text("Alcohol Per Year").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
}

function drawSmokeLine(smokeData, norm=false) {
    // Set up the chart dimensions
    var margin = { top: 20, right: 20, bottom: 30, left: 100 };
    // var width = 600 - margin.left - margin.right;
    // var height = 400 - margin.top - margin.bottom;
    var width = 600 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;

    // var save_smokeData = smokeData;

    if (norm){
        var groupedData = d3.group(smokeData, d => d.LOCATION);

        // Calculate minimum and maximum values for each country's alcohol values
        var countryStats = new Map();
        groupedData.forEach(function(values, country) {
            var alcoholValues = values.map(d => parseFloat(d.Value));
            var minValue = d3.mean(alcoholValues);
            var maxValue = d3.deviation(alcoholValues);
            countryStats.set(country, { minValue: minValue, maxValue: maxValue });
        });

        // Normalize the alcohol values for each country
        smokeData.forEach(function(d) {
            var country = d.LOCATION;
            var alcoholValue = parseFloat(d.Value);
            var stats = countryStats.get(country);
            var normalizedValue = (alcoholValue - stats.minValue) / (stats.maxValue);// - stats.minValue);
            d.normalizedValue = +normalizedValue;
        });
    }

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
      .domain([d3.min([d3.min(smokeData, function (d) { 
        if (norm) return d.normalizedValue;
        else return d.Value; 
    })]), d3.max([d3.max(smokeData, function (d) { 
        if (norm) return d.normalizedValue;
        else return d.Value; 
    })])])
      .range([height, 0]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // Add the x-axis
    smokeSvg.append("g")
      .attr("class", "x axis")
    //   .attr("stroke-width", 1.5)
        .attr("stroke-width", d=>{
            if(norm) return 1;
            else return 1.5;
        })
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // Add the y-axis
    smokeSvg.append("g")
      .attr("class", "y axis")
    //   .attr("stroke-width", 1.5)
    .attr("stroke-width", d=>{
        if(norm) return 1;
        else return 1.5;
    })
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

    // Define the line functions
    var line = d3.line()
      .x(function (d) { return xScale(d.TIME); })
      .y(function (d) { 
        return yScale(d.Value); 
    });

    var smokeLine = d3.line()
      .x(function (d) { return xScale(d.TIME); })
      .y(function (d) { 
        return yScale(d.Value); 
    });

    // data grouping
    const smoke_group = d3.group(smokeData, d=>d.LOCATION);

    // Create a tooltip element
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);

    const joinedData = d3.group(gdpData, d=>d.Code);

    // Draw the line
    smokeSvg.selectAll(".line")
        .data(smoke_group)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ 
            if (norm){
                var location = d[0];
                var gdp = joinedData.get(location);
                // console.log(joinedData)
                // console.log(gdp)
                // console.log(gdp[0][curYear])
                // if (gdp[0][curYear]>5 && gdp[0][curYear]) return "orange";
                // else return "#69b3a2";
                return colorScale(gdp ? +gdp[0][curYear] : 0);
            }
            return cScale(d[0]) 
        })
        // .attr("stroke-width", 1.5)
        .attr("stroke-width", d=>{
            if(norm) return 1;
            else return 1.5;
        })
        .attr("d", function(d){
            return d3.line()
            .x(function(d) { return xScale(d.TIME); })
            .y(function(d) { 
                if (norm) return yScale(d.normalizedValue);
                else return yScale(d.Value); 
            })
            (d[1])
        })
        .on("mouseover", function(event, d){

            d3.select(this)
                .transition()
                .duration(100)
                .attr("stroke-width", 8); // Increase the stroke width of the line

            var mouseX = event.pageX - margin.left; // Calculate the mouse x-coordinate relative to the chart
            var mouseY = event.pageY - margin.top; // Calculate the mouse y-coordinate relative to the chart

            var xValue = xScale.invert(d3.pointer(event)[0]);
            var bisect = d3.bisector(function(d) { return d.TIME; }).left;
            var index = bisect(d[1], xValue); // Find the index of the data point closest to the x value

            var dataPoint = d[1][index]; // Get the specific data point
            var year = dataPoint.TIME.getFullYear();
            var alcohol = dataPoint.Value;

            alcoholSvg.selectAll('path')
                .filter(function(smoked){
                    return smoked && d[0] == smoked[0];
                })
                .transition()
                .duration(100)
                .attr("stroke-width", 8);

            mapSvg.selectAll('path')
                .filter(function(mapd){
                    // console.log(d[0], mapd.properties.ISO_A3);
                    return mapd && d[0] == mapd.properties.ISO_A3;
                })
                .transition()
                .duration(200)
                .attr("fill", cScale(d[0]))
                .attr("stroke", "#fff")

            bubbleSvg.selectAll('circle')
                .filter(function(bubbled){
                    return bubbled && d[0] == bubbled.Country;
                })
                .transition()
                .duration(200)
                .attr("stroke", d => cScale(d.Country))
                .attr("stroke-width", 5)

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
            d3.select(this)
                .transition()
                .duration(100)
                .attr("stroke-width", d=>{
                    if(norm) return 1;
                    else return 1.5;
                }) // Increase the stroke width of the line
            tooltip.style("opacity", 0);
            alcoholSvg.selectAll('path')
                .transition()
                .duration(100)
                .attr("stroke-width", d=>{
                    if(norm) return 1;
                    else return 1.5;
                })

            // var colorScale = d3.scaleSequential(d3.interpolateBlues)
            // .domain([0, 400])

            mapSvg.selectAll('path')
                .transition()
                .duration(200)
                .attr("fill", function(mapd){
                    var location = mapd.properties.ISO_A3;
                    var population = joinedData.get(location);
                    // console.log(location)
                    return colorScale(population ? +population[0].Value : 0);
                })
                .attr("stroke", "none")

            bubbleSvg.selectAll("circle")
                .attr("stroke", "none")
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
        .attr("y", function(d) { 
            if (norm) return yScale(d[1][d[1].length-1].normalizedValue);
            else return yScale(d[1][d[1].length-1].Value); })
        .attr("fill", function(d) { 
            if (norm){
                var location = d[0];
                var gdp = joinedData.get(location);
                return colorScale(gdp ? +gdp[0][curYear] : 0);
            }
            else return cScale(d[0])})
        .attr("dy", ".75em")
        .text(function(d) { return d[0]; }); 

    // // Legend    
    // const legend = d3.select("#legend")
    //         .append("svg")
    //         .attr('width', width)
    //         .attr('height', 70)
    //             .append("g")
    //             .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // // legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
    // legend.append("text").attr("x", 0).attr("y", 18).text("Smoke Per Year").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
    
    // Create a new group for the tick lines
    var tickLines = smokeSvg.append("g").attr("class", "tick-lines");

    // Select the tick elements and create a selection for the tick lines
    var tickElements = smokeSvg.selectAll(".x.axis .tick");
    console.log(tickElements)

    // Append a line for each tick
    tickLines
    .selectAll(".tick-line")
    .data(tickElements.data())
    .enter()
    .append("line")
    .attr("class", "tick-line")
    .attr("x1", function (d) {
        return xScale(d);
    })
    .attr("x2", function (d) {
        return xScale(d);
    })
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", "#ccc")
    .style("stroke-width", 1);
}