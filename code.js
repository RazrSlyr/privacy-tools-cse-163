let w = parseFloat(d3.select("#linechart").style("width"));
let h = 400;
margin = {
    left: 75,
    right: 200,
    top: 75,
    bottom: 75
};

// Creates the SVG everything will be drawn on
// provided a width, height, and margins
function createSvg(w, h, margin) {
    let svg = d3.select("#linechart")
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .attr("width", w - margin.left - margin.right)
        .attr("height", h);
    return svg;
}



// Provided scales and an SVG, draws axes
function drawAxes(svg, xScale, yScale, h) {
    // Creates xAxis
    let xAxis = d3.axisBottom()
        .scale(xScale);
    // Creates yAxis
    let yAxis = d3.axisLeft()
        .scale(yScale);

    // Draws X Axis
    svg.append("g")
        // Note: Adding this class does nothing functionally
        // However, it is useful for organizational purposes
        .attr("class", "x axis")
        .call(xAxis) // calls the Axis function to draw it
        .attr("transform", "translate(0, " + h + ")"); // moves axis to bottom

    // Draws Y Axis
    svg.append("g")
        // Note: Adding this class does nothing functionally
        // However, it is useful for organizational purposes
        .attr("class", "y axis")
        .call(yAxis) // calls the Axis function to draw it


}

// Converts all the strings in the data to numbers
function convertData(d, i, columns) {
    for (let j = 1; j < columns.length; j++) {
        d[columns[j]] = +d[columns[j]]; // This converts all the columns back to numbers
    }
    d.time = d3.timeParse("%Y-%m-%d")(d.Month);
    return d;
}

// Takes in coverted data, returns structure
// where each country has its own array of years 
// and energy consumptions
function getApps(data) {
    
    let appNames = data.columns.slice(1); // Slice cuts off the Year category
    let apps = appNames.map((id) => {
        return {
            id: id, // This stores the name of the country
            values: data.map((d) => {
                return { time: d.time, stat: d[id] }
            })
            // The code above maps every data point to an object containing
            // the year of that data point and the energy consumption for that country
            // in that data point
        }
    });
    return apps;
}

// Given the country data, draws all the lines
function drawLines(svg, data, apps, xScale, yScale) {
    let appNames = data.columns.slice(1); // Slice cuts off the time category
    // Creates a "scale" that maps the app names to different colors
    let colorScale = d3.scaleOrdinal()
        .domain(appNames)
        .range(d3.schemeCategory10);

    // let's make a group with a class "app appName" for every country 
    let app = svg.selectAll(".app")
        .data(apps)
        .enter()
        .append("g")
        .attr("class", (d) => "app " + d.id);
    // Note: adding these classes does nothing for functionality
    // It helps readability, however

    // We need to draw the lines now. However, before we can do that
    // we need to define the line we will be drawing. We can do this by using
    // d3.line
    let line = d3.line()
        .curve(d3.curveBasis) // curves the line
        .x((d) => xScale(d.time)) // This sets the x to the time but properly scaled
        .y((d) => yScale(d.stat)) // This sets the y to the stat being measured but properly scaled

    // using this line, we can add the paths for each country
    app.append("path")
        .attr("class", (d) => "line " + d.id) // unlike other classes, this one actually has attributes. it removes the fill
        .attr("d", (d) => line(d.values)) // sets the x and y using the line function
        .style("stroke", (d) => colorScale(d.id)) // uses the colorScale to give each country its own color
        .style("stroke-width", 1);

    // adds text to the end of every path
    // this is, in part, taken from https://bl.ocks.org/mbostock/3884955
    // app.append("text")
    //     // set position of text
    //     .attr("y", (d) => yScale(d.values[d.values.length - 1].stat))
    //     .attr("x", (d) => xScale(d.values[d.values.length - 1].time))
    //     .attr("class", (d) => d.id)
    //     .style("font", "1em Roboto")
    //     .attr("dx", "0.1em")
    //     .attr("dy", "0.35em")
    //     .attr("fill", (d) => colorScale(d.id))
    //     .text((d) => { return d.id; });



}

// Draws the Chart Title and Axis Titles
function drawTitles(svg, w, h) {
    // adds main title
    svg.append("text")
        .attr("class", "chart title")
        .attr("x", (w - margin.left - margin.right) / 2) // positions at the middle top
        .attr("y", 0)
        .text("Google Trends for Various Privacy Tools")
        .attr("text-anchor", "middle"); // centers text 

    // adds x-axis title
    svg.append("text")
        .attr("class", "axis title")
        .attr("x", w - margin.left - margin.right)
        .attr("dx", "1.5em")
        .attr("dy", "0.5em")
        .attr("y", h)
        .text("Year")

    // adds the y-axis title
    svg.append("text")
        .attr("class", "axis title")
        .text("Google Trends Results")
        .attr("text-anchor", "middle") // centers text
        .attr("transform", "rotate(-90), translate(-" + h / 2 + ", -50)"); // positions on the left, rotated so the text is vertical


}

function drawGrid(svg, xScale, yScale, w, h) {

    // define how the x grid lines are going to look
    let xGridLines = d3.axisBottom()
        .scale(xScale)
        .ticks("5") // sets number of ticks to 5
        .tickFormat("") // removes text from ticks
        .tickSize(h); // makes each tick cover all the vertical space. negative to make it go down

    // add x grid lines
    svg.append("g")
        .attr("class", "grid") // this allows us to apply some css to make it look like a background grid
        .call(xGridLines);

    let yGridLines = d3.axisRight()
        .scale(yScale)
        .ticks("5") // sets number of ticks to 5
        .tickFormat("") // removes text from ticks
        .tickSize(w - margin.left - margin.right); // makes each tick cover all the horizontal space

    svg.append("g")
        .attr("class", "grid") // this allows us to apply some css to make it look like a background grid
        .call(yGridLines);


}

let colorScale;

// Combines all the helper functions to draw the completed chart
async function drawChart() {
    const data = await d3.csv("./awareness.csv", convertData);
    const apps = getApps(data);
    let svg = createSvg(w, h, margin);
    console.log(data);
    console.log(apps);

    // define color scale
    let appNames = data.columns.slice(1);
    colorScale = d3.scaleOrdinal()
        .domain(appNames)
        .range(d3.schemeCategory10);

    // Color all the buttons
    for (let i = 0; i < apps.length; i++) {
        console.log(`button.${apps[i].id.split(" ").join("")}`);
        d3.select(`button.${apps[i].id.split(" ").join("")}`).style("background-color", colorScale(apps[i].id));
        d3.select(`button.${apps[i].id.split(" ").join("")}`).style("border", `2px solid ${colorScale(apps[i].id)}`);
    }

    // // Get's the lowest and highest year. Will be used for xScale
    let xExtents = d3.extent(data, (d) => d.time);

    // // Get's the lowest and highest energy consumption. Will be used for yScale
    // // This is done through two layers of iteration, first getting the min/max
    // // of each app then getting the min/max of all the mins and maxes
    let yMin = d3.min(apps, (c) => d3.min(c.values, (d) => d.stat));
    let yMax = d3.max(apps, (c) => d3.max(c.values, (d) => d.stat));
    console.log(yMin);
    console.log(yMax);


    let xScale = d3.scaleTime()
        .domain(xExtents)
        .range([0, w - margin.left - margin.right]);

    let yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([h, 0]); // order is reversed to make the bottom smaller than top

    drawGrid(svg, xScale, yScale, w, h);
    drawAxes(svg, xScale, yScale, h);
    drawTitles(svg, w, h);  

    drawLines(svg, data, apps, xScale, yScale);

}

function toggleLine(event) {
    let target = d3.select(event.target);
    let classes = target.attr("class").split(" ");
    let appName = classes[classes.length - 1];
    console.log(appName);
    // Check if line needs to be turned on or off
    console.log("box toggled");
    if (target.attr("active") == "True") {
        target.attr("active", "False"); 
        d3.select(`.line.${appName}`).style("stroke-width", 0);
        target.style("background-color", "white");
        target.style("border", `2px solid ${colorScale(appName)}`);
    } else {
        target.attr("active", "True"); 
        d3.select(`.line.${appName}`).style("stroke-width", 1);
        target.style("background-color", colorScale(appName));
        
        target.style("border", "2px solid white");
    }


    // if (!target.property("checked")) {
    //     d3.select(`.line.${target.attr("class")}`).style("stroke-width", 0);
    //     target.style("background-color", "green");
    //     // d3.select(`text.${target.attr("class")}`).style("font", "0em Roboto");
    // } else {
    //     d3.select(`.line.${target.attr("class")}`).style("stroke-width", 1);
    //     // d3.select(`text.${target.attr("class")}`).style("font", "1em Roboto");
    // }
}

d3.selectAll("button")
    .on("click", toggleLine);
drawChart();