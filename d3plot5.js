// Formats date in spanish
var es_ES = {
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["€", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%d/%m/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    "shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
    "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
};

//For string printing the date with format
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var ES = d3.timeFormatDefaultLocale(es_ES);

/**
 * ********** Begins the graph var assingemnts
 */

// Starts the SVG object, adds margins
var svg = d3.select("svg"),
    margin = { top: 20, right: 20, bottom: 110, left: 40 },
    margin2 = { top: 430, right: 20, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

// Assigns the function timeParse for formating the date serie
var parseDate = d3.timeParse("%Y-%m-%d");

// Intialize the scales to the x and y axis
var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);

svg.append("g")
    .attr("class", "myYaxis")

// From D3 Brush, intialize the object in the little graph
var brush = d3.brushX().extent([
    [0, 0],
    [width, height2]
]).on("brush end", brushed);

// From D3 zoom initializes 
// I had problem with the zoom element and the tooltips, so I deactivated the zoom

var zoom = d3.zoom().scaleExtent([1, Infinity]).translateExtent([
    [0, 0], width, height
]).extent([
    [0, 0],
    [width, height]
]).on("zoom", zoomed);

// Drawn areas data variables
var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.Fecha_pd); })
    .y0(height)
    .y1(function(d) { return y(d.Data); });

var area2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(d.Fecha_pd); })
    .y0(height2)
    .y1(function(d) { return y2(d.Data); });

// Draws the zooom rectangle 
svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);




// The focus variable helps to draw the information on the zoomed object
var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Stablish the second graphic  and paints it
var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

/**
 *  The D3 read data on promise
 * 
 */
// The function d3 to read the CVS, on promise
d3.csv("homicidios_es_19.csv", type, function(error, data) {
    if (error) throw error;

    // Creates the Data Selector
    var allGroup = d3.map(data, function(d) { return (d.Entidad) }).keys()
    console.log(allGroup);

    // Creates in the html the Selector
    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function(d) { return d; }) // text showed in the menu
        .attr("value", function(d) { return d; }) // corresponding value returned by the button


    // With the data selector creates the info to use
    var dataFilter = data.filter(function(d) { return d.Entidad == 'Aguascalientes' });

    // Draws the domain for both graphics, the full and the little rectangle
    x.domain(d3.extent(dataFilter, function(d) { return d.Fecha_pd }));
    y.domain([0, d3.max(dataFilter, function(d) { return d.Data })]);

    x2.domain(x.domain());
    y2.domain(y.domain());

    /// Tooltips CSS style
    var Tooltip = d3.select(".message")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "3px")
        .style("padding", "5px");


    // Servs to draw the new area that is in focus apending the data
    focus.append("path")
        .datum(dataFilter)
        .attr("class", "area")
        .transition().duration(2000)
        .attr("d", area)

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    // Draws the area of the second graphic
    context.append("path")
        .datum(dataFilter)
        .attr("class", "area")
        .attr("d", area2);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    // draws the rectangle with data // Set to 0 0
    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", 0)
        .attr("height", 0)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);

    svg.append("linearGradient")
        .attr("id", "area-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(0))
        .attr("x2", 0).attr("y2", d3.max(dataFilter, function(d) { return d.Data }))
        .selectAll("stop")
        .data([
            { offset: "0%", color: "white" },
            { offset: "20%", color: "#FFFFFF" },
            { offset: "45%", color: "#EEEEEE" },
            { offset: "55%", color: "#DDDDDD" },
            { offset: "70%", color: "#CCCCCC" },
            { offset: "100%", color: "#BBBBBB" }
        ])
        .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });

    /**
     * Fuction to update the graph with the new filtered Data
     */
    // A function that update the chart
    function update(selectedGroup) {

        // Create new data with the selection

        var dataFilter = data.filter(function(d) { return d.Entidad == selectedGroup })
        yAxis = d3.axisLeft(y);
        x.domain(d3.extent(dataFilter, function(d) { return d.Fecha_pd }));
        y.domain([0, d3.max(dataFilter, function(d) { return d.Data })]);
        y2.domain(y.domain());

        svg.select(".gradientUnits")
            .attr("x1", 0).attr("y1", y(0))
            .attr("x2", 0).attr("y2", d3.max(dataFilter, function(d) { return d.Data }))
            .selectAll("stop")
            .data([
                { offset: "0%", color: "white" },
                { offset: "20%", color: "#FFFFFF" },
                { offset: "45%", color: "#EEEEEE" },
                { offset: "55%", color: "#DDDDDD" },
                { offset: "70%", color: "#CCCCCC" },
                { offset: "100%", color: "#BBBBBB" }
            ])
            .enter().append("stop")
            .attr("offset", function(d) { return d.offset; })
            .attr("stop-color", function(d) { return d.color; });

        // Servs to draw the new area that is in focus apending the data
        focus.datum(dataFilter).select(".area").transition().duration(2000).attr("d", area);

        focus.select(".axis--x").call(xAxis);

        focus.select(".axis--y").transition().duration(1000).call(yAxis);

        // Draws the area below the line
        context.datum(dataFilter).select(".area").transition().duration(1000).attr("d", area2);

        context.select(".axis--x").call(xAxis);

        context.select(".brush").call(brush).call(brush.move, x.range());


        focus.selectAll("circle")
            .data(dataFilter)
            .attr("cx", function(d) { return x(d.Fecha_pd) })
            .attr("cy", function(d) { return y(d.Data) })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
            // run the updateChart function with this selected option
        update(selectedOption)
    })



    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        Tooltip
            .style("opacity", 1)
    }


    var mousemove = function(d) {
        Tooltip
            .html("Entidad: " + "<strong>" + d.Entidad + "</strong>" + "<br/>" + "# homicidios: " + d.Data + "<br/>" +
                "Fecha: " + d.Fecha_pd.toLocaleDateString("es-ES", { year: 'numeric', month: 'long' }))
            .style("left", (d3.mouse(this)[0] + 70) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function(d) {
        Tooltip
            .style("opacity", 0)
    }

    // Add the points
    focus.append("g")
        .selectAll("dot")
        .data(dataFilter)
        .enter()
        .append("circle")
        .attr("class", "myCircle")
        .attr("cx", function(d) { return x(d.Fecha_pd) })
        .attr("cy", function(d) { return y(d.Data) })
        .attr("r", 2)
        .attr("stroke", "#000000")
        .attr("stroke-width", 3)
        .attr("fill", "white")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    var xi = x.domain()[0];
    var xf = x.domain()[1];
    console.log(xi, xf);

    const bisectDate = d3.bisector(d => d.Fecha_pd.year).left;
    // Get the index of the xValue relative to the dataSet
    const dataIndex = bisectDate(dataFilter, xi, 1);

    console(dataIndex);


});

function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.select(".area").attr("d", area);
    focus.select(".axis--x").call(xAxis);

    focus
        .selectAll('circle')
        .attr("cx", function(d) { return x(d.Fecha_pd) })
        .attr("cy", function(d) { return y(d.Data) })
        // .attr("r", 2)
        // .attr("stroke", "#69b3a2")
        // .attr("stroke-width", 3)
        // .attr("fill", "white")



    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    // focus.select(".area").attr("d", area);
    // focus.select(".axis--x").call(xAxis);
    // context.select(".brush").call(brush.move, x.range().map(t.invertX, t));

}

function type(d) {
    d.Fecha_pd = parseDate(d.Fecha_pd);
    d.Data = +d.Data;
    return d;
}