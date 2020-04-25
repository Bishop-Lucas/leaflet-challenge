// @TODO: YOUR CODE HERE!

// Width of box
var width = parseInt(d3.select("#scatter").style("width"));

// Height of box
var height = width - width / 3.9;

// Margin spacing
var margin = 20;
var labelArea = 110;
// padding
var tPadB = 40;
var tPadL = 40;

var labelArea = 110;
// Graph canvas
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart")

// Circle radius and function
var circRadius;
function GetR() {
    if (width <= 530){
        circRadius = 5;
    }
    else {
        circRadius = 10;
    }
}
GetR();

// Create Labels
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

function xTextRefresh() {
    xText.attr(
      "transform",
      "translate(" +
        ((width - labelArea) / 2 + labelArea) +
        ", " +
        (height - margin - tPadB) +
        ")"
    );
}
xTextRefresh();

xText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("In Poverty (%)");
xText
    .append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Age (Median)");
xText
    .append("text")
    .attr("y", 26)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Household Income (Median)");

var leftTX = margin + tPadL;
var leftTY = (height + labelArea) / 2 - labelArea;

svg.append("g").attr("class", "yText");

var yText = d3.select(".yText");

function yTextRefresh() {
    yText.attr(
        "transform",
        "translate(" + leftTX + "," + leftTY + ")rotate(-90)"
    );
}
yTextRefresh();

yText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");
yText
    .append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");
yText
    .append("text")
    .attr("y", 26)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");

// Import csv
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
})

// Create visualization
function visualize(theData) {
    var curX = "poverty";
    var curY = "obesity";
    var xMin;
    var yMin;
    var xMax;
    var yMax;

    var toolTip = d3
        .tip()
        .attr("class", "d3-tip")
        .offset([40, -60])
        .html(function(d) {
            var theX;
            var theState = "<div>" + d.state + "</div>";
            var theY = "<div>" + curY + ": " + d[curY] + "%</div>";
            
            if (curX === "poverty") {
                theX = "<div>" + curX + ": " + d[curX] + "%</div>";
            }
            else {
                theX = "<div>" +
                curX +
                ": " +
                parseFloat(d[curX]).toLocaleString("en") +
                "</div>";
            }
            return theState + theX + theY;
        });
    svg.call(toolTip);

    function xMinMax() {
        xMin = d3.min(theData, function(d) {
            return parseFloat(d[curX]) * 0.90;
        });
        xMax = d3.max(theData, function(d) {
            return parseFloat(d[curX]) * 1.10;
        });
    }

    function yMinMax() {
        yMin = d3.min(theData, function(d) {
            return parseFloat(d[curY]) * 0.90;
        });
        yMax = d3.max(theData, function(d) {
            return parseFloat(d[curY]) * 1.10;
        });
    }

    function labelChange(axis, clickedText) {
        d3
            .selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
        clickedText.classed("inactive", false).classed("active", true);
    }
    
    yMinMax();
    xMinMax();

    var xScale = d3
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width -margin]);
    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    function tickCount() {
        if (width <= 500) {
          xAxis.ticks(5);
          yAxis.ticks(5);
        }
        else {
          xAxis.ticks(10);
          yAxis.ticks(10);
        }
      }
      tickCount();
    
    svg
      .append("g")
      .call(xAxis)
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
    svg
      .append("g")
      .call(yAxis)
      .attr("class", "yAxis")
      .attr("transform", "translate(" + (margin + labelArea) + ", 0)");
    
    var theCircles = svg.selectAll("g theCircles").data(theData).enter();

    theCircles
        .append("circle")
        // These attr's specify location, size and class.
        .attr("cx", function(d) {
            return xScale(d[curX]);
        })
        .attr("cy", function(d) {
            return yScale(d[curY]);
        })
        .attr("r", circRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        // Hover rules
        .on("mouseover", function(d) {
        // Show the tooltip
            toolTip.show(d, this);
        // Highlight the state circle's border
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
        // Remove the tooltip
            toolTip.hide(d);
        // Remove highlight
            d3.select(this).style("stroke", "#e3e3e3");
        });
    
    theCircles
        .append("text")
        // We return the abbreviation to .text, which makes the text the abbreviation.
        .text(function(d) {
          return d.abbr;
        })
        // Now place the text using our scale.
        .attr("dx", function(d) {
          return xScale(d[curX]);
        })
        .attr("dy", function(d) {
            return yScale(d[curY]) + circRadius / 2.5;
        })
        .attr("font-size", circRadius)
        .attr("class", "stateText")
        // Hover Rules
        .on("mouseover", function(d) {
          // Show the tooltip
          toolTip.show(d);
          // Highlight the state circle's border
          d3.select("." + d.abbr).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
          // Remove tooltip
          toolTip.hide(d);
          // Remove highlight
          d3.select("." + d.abbr).style("stroke", "#e3e3e3");
        });

    d3.selectAll(".aText").on("click", function() {
       var self = d3.select(this);

        if (self.classed("inactive")) {
        var axis = self.attr("data-axis");
        var name = self.attr("data-name");

        if (axis === "x") {
            curX = name;
            xMinMax();

            xScale.domain([xMin, xMax]);

            svg.select(".xAxis").transition().duration(300).call(xAxis);

            d3.selectAll("circle").each(function() {
                d3
                    .select(this)
                    .transition()
                    .attr("cx", function(d) {
                    return xScale(d[curX]);
                    })
                    .duration(300);
                });

            d3.selectAll(".stateText").each(function() {
                d3
                    .select(this)
                    .transition()
                    .attr("dx", function(d) {
                    return xScale(d[curX]);
                    })
                    .duration(300);
                });

            labelChange(axis, self);
        }
        else {
            curY = name;
            yMinMax();
            yScale.domain([yMin, yMax]);
            svg.select(".yAxis").transition().duration(300).call(yAxis);
            d3.selectAll("circle").each(function() {
                d3
                    .select(this)
                    .transition()
                    .attr("cy", function(d) {
                    return yScale(d[curY]);
                    })
                    .duration(300);
                });
            d3.selectAll(".stateText").each(function() {
                d3
                    .select(this)
                    .transition()
                    .attr("dy", function(d) {
                    return yScale(d[curY]) + circRadius / 3;
                    })
                    .duration(300);
                });
            labelChange(axis, self);
            }
        }
    });
    d3.select(window).on("resize", resize);

    function resize() {
        width = parseInt(d3.select("#scatter").style("width"));
        height = width - width / 3.9;
        leftTY = (height + labelArea) / 2 - labelArea;

        svg.attr("width", width).attr("height", height);

        xScale.range([margin + labelArea, width - margin]);
        yScale.range([height - margin - labelArea, margin]);

        svg
        .select(".xAxis")
        .call(xAxis)
        .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

        svg.select(".yAxis").call(yAxis);

        tickCount();

        xTextRefresh();
        yTextRefresh();

        GetR();

        d3
        .selectAll("circle")
        .attr("cy", function(d) {
            return yScale(d[curY]);
        })
        .attr("cx", function(d) {
            return xScale(d[curX]);
        })
        .attr("r", function() {
            return circRadius;
        });

        d3
        .selectAll(".stateText")
        .attr("dy", function(d) {
            return yScale(d[curY]) + circRadius / 3;
        })
        .attr("dx", function(d) {
            return xScale(d[curX]);
        })
        .attr("r", circRadius / 3);
    }
}