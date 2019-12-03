
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
var chosenXAxis = "poverty"; 
var chosenYAxis = "obesity";



// function used for updating x-scale var upon click on axis label
function xScale(newsData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(newsData, d => d[chosenXAxis]) * 0.8,
        d3.max(newsData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

function yScale(newsData, chosenYAxis) {
// create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(newsData, d => d[chosenYAxis]) * 0.8,
        d3.max(newsData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;

}
  
  // function used for updating xAxis var upon click on axis label // xAxis just the handles
  
  function renderxAxis(newXScale, xAxis) { 
    var bottomAxis = d3.axisBottom(newXScale); //adds tick marks to bottom of axis, for y add axisLeft
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  function renderyAxis(newYScale, yAxis) { 
    var leftAxis = d3.axisLeft(newYScale); //adds tick marks to bottom of axis, for y add axisLeft
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
  // function used for updating circles group with a transition to
  // new circles
//   function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]))
      
    return circlesGroup;
    
  }
  
  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
//   function updateToolTip(chosenXAxis, circlesGroup) {


    
    switch (chosenXAxis) {
        case "age":
            var xlabel = "Age (Median):";
            break;
        case "income":
            var xlabel = "Household Income (Median):";
            break;
        default:
            var xlabel = "In Poverty (%):";
            break;

    }

    switch (chosenYAxis) {
        case "smokes":
            var ylabel = "Smokes (%):";
            break;
        case "healthcare":
            var ylabel = "Lacks Healthcare (%):";
            break;
        default:
            var ylabel = "Obese (%):";
            break;

    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        // return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(newsData) {
      toolTip.show(newsData);
    })
      // onmouseout event
      .on("mouseout", function(newsData, index) {
        toolTip.hide(newsData);
      });
  
    return circlesGroup;
  }
  
  d3.csv("/assets/data/data.csv").then(function(newsData, err) {
    if (err) throw err;
  
    
    // parse data // change chart for new data
    newsData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.healthcare = +data.healthcare;
      data.abbr = data.abbr;
    });

    console.log(newsData);
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(newsData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(newsData, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);  
      
    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(newsData)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 12);

   

    circlesGroup.selectAll("circle")
      .append("text")
      .classed("stateText", true)
      .attr("dx", function(d) {
          return xLinearScale(d[chosenXAxis])})
      .attr("dy", function(d) {
          return yLinearScale(d[chosenYAxis])})
      .text(function(d){return d.abbr});
     
        
        


  
    // Create group for  2 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

      var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
  
    var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `rotate(${width / 2}, ${height + 20})`);
  
    // append y axis
    var obeseLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("value", "obesity") 
      .attr("dy", "1em")
      .classed("active", true)
      .text("Obese (%)");

    var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 30 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "smokes") 
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Smokes (%)");

    var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 50 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "healthcare") 
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    // var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;

          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(newsData, chosenXAxis)
          yLinearScale = yScale(newsData, chosenYAxis);
  
          // updates x axis with transition
          xAxis = renderxAxis(xLinearScale, xAxis)
          yAxis = renderyAxis(yLinearScale, yAxis);



          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            console.log(circlesGroup);
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  
          // changes classes to change bold text // make a function
        
          switch (chosenXAxis) {   
            case 'age':
                ageLabel
                .classed("active", true)
                .classed("inactive", false);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
                break;
            case 'income':
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
                incomeLabel
                .classed("active", true)
                .classed("inactive", false);
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
                break;
            default:
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);
                povertyLabel
                .classed("active", true)
                .classed("inactive", false);
                break;

        }
        
        


        }
      });


      ylabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
  
          // replaces chosenXAxis with value
          chosenYAxis = value;

          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(newsData, chosenXAxis)
          yLinearScale = yScale(newsData, chosenYAxis);
  
          // updates x axis with transition
          xAxis = renderxAxis(xLinearScale, xAxis)
          yAxis = renderyAxis(yLinearScale, yAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        //   circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        //   circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text // make a function
            
            switch (chosenYAxis) {   
                case 'smokes':
                    smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    break;
                case 'obesity':
                    smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    obeseLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    break;
                default:
                    smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);    
                    break;

            }


    
            }
      });
  }).catch(function(error) {
    console.log(error);
  });
