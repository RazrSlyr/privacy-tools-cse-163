var myBrush;
let h = 400;
margin = {
    left: 75,
    right: 200,
    top: 75,
    bottom: 75
};
margin2 = {
    left: 75,
    right: 200,
    top: 400,
    bottom: 20
};

// Creates the SVG everything will be drawn on
// provided a width, height, and margins
function createSvg(h, margin, id) {
    let w = parseFloat(d3.select(`#${id}`).style("width"));
    let svg = d3.select(`#${id}`)
        .attr("height", h + margin.top + margin.bottom + 50) //TODO
        .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .attr("width", w)

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
    focus = svg.select(".focus")
    // Draws X Axis
    focus.append("g")
        // Note: Adding this class does nothing functionally
        // However, it is useful for organizational purposes
        .attr("class", "x axis")
        .call(xAxis) // calls the Axis function to draw it
        .attr("transform", "translate(0, " + h + ")"); // moves axis to bottom

    // Draws Y Axis
    focus.append("g")
        // Note: Adding this class does nothing functionally
        // However, it is useful for organizational purposes
        .attr("class", "y axis")
        .call(yAxis) // calls the Axis function to draw it


}

// Converts all the strings in the data to numbers, when date is in YYYY-MM format
function convertDataWithMonth(d, i, columns) {
    // iterate starting at 1 to ignore the time column
    for (let j = 1; j < columns.length; j++) {
        // google trends data contains "<1" entries
        d[columns[j]] = d[columns[j]] == "<1"
            ? 0
            : parseFloat(d[columns[j]]); // This converts all the columns back to numbers
    }
    d.time = d3.timeParse("%Y-%m")(d.Month);
    return d;
}

// Converts all the strings in the data to numbers, when date is in YYYY format
function convertDataWithYear(d, i, columns) {
    for (let j = 1; j < columns.length; j++) {
        d[columns[j]] = parseFloat(d[columns[j]]); // This converts all the columns back to numbers
    }
    d.time = d3.timeParse("%Y")(d.Year);
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
function drawLines(svg, data, apps, xScale, yScale, line, f) {
    let appNames = data.columns.slice(1); // Slice cuts off the time category
    // Creates a "scale" that maps the app names to different colors
    let colorScale = d3.scaleOrdinal()
        .domain(appNames)
        .range(d3.schemeCategory10);


    let app = svg.select(".focus")
        .selectAll("why") //Why
        .data(apps)
        .enter()
        .append("g")
        .attr("class", (d) => "app " + d.id);


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
function drawTitles(svg, w, h, xlabel, ylabel, title) {
    // adds main title
    svg.append("text")
        .attr("class", "chart title")
        .attr("x", (w - margin.left - margin.right) / 2) // positions at the middle top
        .attr("y", 0)
        .text(title)
        .attr("text-anchor", "middle"); // centers text 

    // adds x-axis title
    svg.append("text")
        .attr("class", "axis title")
        .attr("x", w - margin.left - margin.right)
        .attr("dx", "1.5em")
        .attr("dy", "0.5em")
        .attr("y", h)
        .text(xlabel)

    // adds the y-axis title
    svg.append("text")
        .attr("class", "axis title")
        .text(ylabel)
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

function updateEventInfoBox(d) {
    if (d) {
        d3.select("#event-info-name").text(d.name);
        d3.select("#event-info-date")
            .text(d.date.toDateString() + ".")
            .attr("datetime", d.date.toISOString());
        d3.select("#event-info-description").text(d.description);
        d3.select("#event-info-source")
            .attr("href", d.source)
            .text("(source)");
    } else {
        d3.select("#event-info-date").text("").attr("datetime", null);
        d3.select("#event-info-description").text("Select an event above to view more details");
        d3.select("#event-info-source").attr("href", null).text("");
    }
}

let eventLineArgs = [];

function drawEventLines(svg, xScale, height, selectedEvent, selection) {
    if (eventLineArgs.find(a => a[0] == svg) === undefined) {
        eventLineArgs.push([svg, xScale, height]);
    }

    console.log("IN DRAWEVENTLINEES", selectedEvent);
    if (selection === undefined) {
        selection = svg.selectAll(".event")
            .data(eventsData)
            .join("line");
    }
    selection
        .attr("x1", d => xScale(d.date))
        .attr("x2", d => xScale(d.date))
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke-width", d => d.name == selectedEvent ? "2px" : "1px")
        .style("stroke", d => d.name == selectedEvent ? "red" : "rgba(0, 0, 0, 0.5)")
        .on("mouseover", (_, d) => {
        })
        .on("mouseout", () => {
        });
    return selection;
}

function drawContext(svg, data, apps, xScale2, yScale2, context) {
    let appNames = data.columns.slice(1); // Slice cuts off the time category
    // Creates a "scale" that maps the app names to different colors
    let colorScale = d3.scaleOrdinal()
        .domain(appNames)
        .range(d3.schemeCategory10);

    var line2 = d3
        .line()
        .x(function (d) {
            return xScale2(d.time);
        })
        .y(function (d) {
            return yScale2(d.stat);
        })
        .curve(d3.curveBasis);

    var contextlineGroups = context
        .selectAll("g")
        .data(apps)
        .enter()
        .append("g");

    var contextLines = contextlineGroups
        .append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line2(d.values);
        })
        .style("stroke", (d) => colorScale(d.id)) // uses the colorScale to give each country its own color
        .attr("clip-path", "url(#clip)")
        .style("stroke-width", 1);


    context
        .append("g")
        .attr("class", "x axis2")
        .attr("transform", "translate(0," + h2 + ")")
        .call(d3.axisBottom(xScale2));



    // let app = svg.select(".focus")
    //     .selectAll("why") //Why
    //     .data(apps)
    //     .enter()
    //     .append("g")
    //     .attr("class", (d) => "app " + d.id);


    // app.append("path")
    //     .attr("class", (d) => "line " + d.id) // unlike other classes, this one actually has attributes. it removes the fill
    //     .attr("d", (d) => line(d.values)) // sets the x and y using the line function
    //     .style("stroke", (d) => colorScale(d.id)) // uses the colorScale to give each country its own color
    //     .style("stroke-width", 1);

}


let colorScaleApps = d3.scaleOrdinal();
let colorScaleSM = d3.scaleOrdinal();
let colorScaleVPN = d3.scaleOrdinal();
let colorScaleSE = d3.scaleOrdinal();

// Combines all the helper functions to draw the completed chart
async function drawChart(file, svg, convertData, xlabel, ylabel, title, colorScale) {
    const data = await d3.csv(file, convertData);
    const apps = getApps(data);
    //width = 1300 - margin.left - margin.right,
    //height = 500 - margin.top - margin.bottom,
    h2 = 100;

    // define color scale
    let appNames = data.columns.slice(1);
    colorScale.domain(appNames).range(d3.schemeCategory10);

    let colorScalee = d3.scaleOrdinal()
        .domain(appNames)
        .range(d3.schemeCategory10);

    // Color all the buttons
    // TODO (ben) possibly have d3 generate these buttons?
    for (let i = 0; i < apps.length; i++) {
        console.log(`button.${apps[i].id.split(" ").join("")}`);
        d3.select(`button.${apps[i].id.split(" ").join("")}`).style("background-color", colorScale(apps[i].id));
        d3.select(`button.${apps[i].id.split(" ").join("")}`).style("border", `2px solid ${colorScale(apps[i].id)}`);
    }

    let w = svg.attr("width");
    console.log(w);


    // // Get's the lowest and highest year. Will be used for xScale
    let xExtents = d3.extent(data, (d) => d.time);

    // // Get's the lowest and highest values. Will be used for yScale
    // // This is done through two layers of iteration, first getting the min/max
    // // of each app then getting the min/max of all the mins and maxes
    let yMin = d3.min(apps, (c) => d3.min(c.values, (d) => d.stat));
    let yMax = d3.max(apps, (c) => d3.max(c.values, (d) => d.stat));
    console.log(yMin);
    console.log(yMax);
    console.log(apps);

    svg
        .append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", w - margin.left - margin.right)
        .attr("height", h);

    var line = d3
        .line()
        .x(function (d) {
            return xScale(d.time);
        })
        .y(function (d) {
            return yScale(d.stat);
        })
        .curve(d3.curveBasis);

    //   var focus = svg
    //     .append("g")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //   var context = svg
    //     .append("g")
    //     .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var focus = svg
        .append("g")
        .attr("transform", "translate(0, 0)")
        .attr("class", "focus");

    var context = svg
        .append("g")
        .attr("transform", "translate(0, 400)");

    let xScale = d3.scaleTime()
        .domain(xExtents)
        .range([0, w - margin.left - margin.right]);
    let yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([h, 0]); // order is reversed to make the bottom smaller than top

    var xScale2 = d3.scaleTime()
        .domain(xExtents)
        .range([0, w - margin.left - margin.right]);

    var yScale2 = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([75, 0]); // TODO: Dynamic

    drawGrid(svg, xScale, yScale, w, h);
    drawAxes(svg, xScale, yScale, h);
    drawTitles(svg, w, h, xlabel, ylabel, title);

    drawLines(svg, data, apps, xScale, yScale, line, focus);
    drawContext(svg, data, apps, xScale2, yScale2, context);
    myBrush = d3.brushX().extent([[xScale.range()[0], 0], [xScale.range()[1], 75]]).on("start brush end", brushed);

    context
        .append("g")
        .attr("class", "x brush")
        .call(myBrush)
        .selectAll("rect")
        .attr("y", -7)
        .attr("height", h2 + 7);
    drawEventLines(context, xScale2, 75);

    function brushed(event) {
        var s = event.selection;

        xScale.domain(event.selection === null ? xScale2.domain() : [xScale2.invert(s[0]), xScale2.invert(s[1])]);

        focus.selectAll("path.line").attr("d", function (d) {
            return line(d.values);
        });
        focus.select(".x.axis").call(d3.axisBottom(xScale));
        focus.select(".y.axis").call(d3.axisLeft(yScale));
    }
}

function toggleLine(event, colorScale) {
    let target = d3.select(event.target);
    let classes = target.attr("class").split(" ");
    let appName = classes[classes.length - 1];
    // Check if line needs to be turned on or off
    console.log("box toggled");
    if (target.attr("active") == "True") {
        target.attr("active", "False");
        d3.select(`.line.${appName}`).style("stroke-width", 0);
        target.style("background-color", "white");
    } else {
        target.attr("active", "True");
        d3.select(`.line.${appName}`).style("stroke-width", 1);
        target.style("background-color", colorScale(appName));
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

let eventsData = [];
let barScales = [];
let barChartData = []

function makeBarChart(chart_data, event_name) {
    let svg_w = parseFloat(d3.select(`#${chart_data.id}`).style("width"));
    let svg_h = parseFloat(d3.select(`#${chart_data.id}`).style("height"));

    let width = svg_w - 150;
    let height = svg_h - 150;

    // define scales
    var xScale = d3.scaleBand()
        .domain(chart_data.app_names)
        .rangeRound([0, width])
        .padding(0.1);
    var yScale = d3.scaleLinear()
        .domain([0, chart_data.max_y])
        .range([height, 0]);

    console.log(chart_data.max_y);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale).ticks(5);


    // create chart
    let chart = d3.select(`#${chart_data.id}`)
        .append("g")
        .attr("transform", `translate(${75}, ${75})`)
        .style("width", width)
        .style("height", height)


    // draw y-axis
    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll("text")
        .attr("dy", "-.5em")
        .style("text-anchor", "end")
        .attr("fill", "black")
        .attr("font-size", "15px");

    // draw x-axis
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("dx", "0.75em")
        .attr("dy", "1.25em")
        .style("text-anchor", "end")
        .attr("font-size", "15px")
        .style("transform", "rotate(-15deg)");

    // adds y-axis text
    chart.append("text")
        .text(chart_data.axis_name)
        .style("transform", "rotate(-90deg)")
        .attr("y", "-3.5em")
        .attr("x", "-14.5em")
        .attr("font-size", "15px")


    let yGridLines = d3.axisRight()
        .scale(yScale)
        .ticks("5") // sets number of ticks to 5
        .tickFormat("") // removes text from ticks
        .tickSize(width); // makes each tick cover all the horizontal space


    // add y gridlines
    chart.append("g")
        .attr("class", "grid") // this allows us to apply some css to make it look like a background grid
        .call(yGridLines);

    // If there is no event, this is sufficient
    if (event_name.trim() == "No Event") {
        return;
    }

    let event = null;
    for (let i = 0; i < eventsData.length; i++) {
        if (eventsData[i].name == event_name) {
            event = eventsData[i];
            break;
        }
    }

    // create bisector to get the necessary data
    let bisector = d3.bisector((d) => d.time).center;
    let index = bisector(chart_data.data, event.date);
    let data = chart_data.data[index]
    // delete the time data, we don't need it anymore
    let deleteFirst = true;
    for (let i = 0; i < chart_data.app_names.length; i++) {
        // First column is already deleted?
        console.log(`Comparing ${chart_data.app_names[i]} to ${Object.keys(data)[0]}`);
        if (chart_data.app_names[i] == Object.keys(data)[0]) {
            // true
            deleteFirst = false;
            break;
        }
    }
    if (deleteFirst) {
        delete data[Object.keys(data)[0]];
    }

    // if the time column is still there, delete it
    if (Object.keys(data)[Object.keys(data).length - 1] == "time") {
        delete data[Object.keys(data)[Object.keys(data).length - 1]];
    }


    // now we have the neccessary data and we can plot the bars
    for (let i = 0; i < Object.keys(data).length; i++) {
        let name = Object.keys(data)[i];
        chart.append("rect")
            .attr("x", xScale(name))
            .attr("y", yScale(data[name]))
            .attr("width", xScale.bandwidth())
            .attr("height", height - yScale(data[name]))
            .attr("fill", chart_data.color_scale(name));
    }


}

// async function so we can load the events data first before any chart
(async () => {
    eventsData = await d3.csv("events.csv", row => ({
        ...row,
        date: d3.timeParse("%Y-%m-%d")(row.date),
    }));







    let awarness_chart = createSvg(h, margin, "awareness");
    drawChart("./awareness.csv", awarness_chart, convertDataWithMonth, "Year", "Google Trends Results", "Google Trends for Various Privacy Tools", colorScaleApps);
    let social_media_chart = createSvg(h, margin, "socialmedia")
    drawChart("./sm_monthly_users.csv", social_media_chart, convertDataWithYear, "Year", "Monthly Users (in Millions)", "Monthly Social Media Users", colorScaleSM);
    let search_engine_chart = createSvg(h, margin, "searchengines")
    drawChart("./search_engine.csv", search_engine_chart, convertDataWithMonth, "Year", "Market Share (%)", "Market Share of Various Search Engines", colorScaleSE);



    d3.selectAll("button.app")
        .on("click", (e) => {
            toggleLine(e, colorScaleApps);
        });

    d3.selectAll("button.sm")
        .on("click", (e) => {
            toggleLine(e, colorScaleSM);
        });

    d3.selectAll("button.se")
        .on("click", (e) => {
            toggleLine(e, colorScaleSE);
        });

    // Grabbing all the data here for the creation of the bar charts
    const awareness_data = await d3.csv("./awareness.csv", convertDataWithMonth);
    const social_media_data = await d3.csv("./sm_monthly_users.csv", convertDataWithYear);
    const search_engine_data = await d3.csv("./search_engine.csv", convertDataWithMonth);


    const apps_awareness = getApps(awareness_data);
    const apps_sm = getApps(social_media_data);
    const apps_search_engine = getApps(search_engine_data);

    // defining the information needed for each bar chart
    barChartData = [
        // Awareness Data
        {
            id: "awareness-bar",
            axis_name: "Google Trends Results",
            max_y: d3.max(apps_awareness, (c) => d3.max(c.values, (d) => d.stat)),
            app_names: awareness_data.columns.slice(1),
            data: awareness_data,
            data_no_convert: awareness_data,
            color_scale: colorScaleApps
        },
        // Social Media Data 
        {
            id: "socialmedia-bar",
            axis_name: "Monthly Users (in Millions)",
            max_y: d3.max(apps_sm, (c) => d3.max(c.values, (d) => d.stat)),
            app_names: social_media_data.columns.slice(1),
            data: social_media_data,
            color_scale: colorScaleSM
        },
        // Search Engine Market Share Data
        {
            id: "searchengines-bar",
            axis_name: "Market Share (%)",
            max_y: d3.max(apps_search_engine, (c) => d3.max(c.values, (d) => d.stat)),
            app_names: search_engine_data.columns.slice(1),
            data: search_engine_data,
            color_scale: colorScaleSE
        },
    ];

    // creating bar chart skeleton
    for (let i = 0; i < barChartData.length; i++) {
        let chartData = barChartData[i];
        makeBarChart(chartData, "No Event");
    }

    // Generate dropdown that lets you select event
    d3.select("#event-selector")
        .on("change", (d) => {
            let selected = d3.select("#event-selector").property("selectedOptions")[0];
            let selectedName = d3.select(selected).html();
            // delete all current charts
            for (let i = 0; i < barChartData.length; i++) {
                console.log(barChartData[i].id);
                d3.select(`#${barChartData[i].id}`)
                    .select("g")
                    .remove();
                makeBarChart(barChartData[i], selectedName);
            }

            for (const i in eventLineArgs) {
                let a = eventLineArgs[i];
                const args = a[3] ? [a[0], a[1], a[2], selectedName, a[3]] : [...a, selectedName];
                const selection = drawEventLines(...args);
                eventLineArgs[i].push(selection);
            }

            updateEventInfoBox(eventsData.find(e => e.name == selectedName));
        })
        .selectAll("option")
        .data([
            { name: "No Event" },
            ...eventsData,
        ])
        .enter()
        .append("option")
        .html((d) => d.name);




    // Grabbing date-time for event
    // For test, will use first event
    // let bisectDate = d3.bisector(function (d) { return d.time; }).center;
    // console.log(awareness_data);
    // let index = bisectDate(awareness_data, eventDate);
    // console.log(awareness_data[index]);

})();
