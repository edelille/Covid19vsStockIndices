//Code forked and modified from https://bl.ocks.org/phvaillant/53b90038b9c5ac5f6b817a4f63fbc2af
stocksMains();

function stocksMains() {

  var margin = {top: 80, right: 80, bottom: 80, left: 80},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var parse = d3.timeParse("%Y-%m-%d");

  // Scales and axes. Note the inverted domain for the y-scale: bigger is up!
  var x = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([0, width]),
      xAxis = d3.axisBottom(x)
        .tickSize(-height),
      yAxis = d3.axisLeft(y)
        .tickArguments(4);


  // An area generator, for the light fill.
  var area = d3.area()
      .curve(d3.curveMonotoneX)
      .x(function(d) { return x(d.date); })
      .y0(height)
      .y1(function(d) { return y(d.price); });

  // A line generator, for the dark stroke.
  var line = d3.line()
      .curve(d3.curveMonotoneX)
      .x(d => { 
        return x(d.Date); 
      })
      .y(d => { 
        console.log(d.Close);
        console.log(y(d.Close));
        return y(d.Close); 
      });

  var dji = n225 = hsi = [];


  //Scrape data, set into functions for sake of sequence
  d3.csv("src/^DJI.csv", function(error, data) {
    data.forEach(d => { 
      d.Date = parse(d.Date); //parse(d.Date);
      d.Close = Number(d.Close);
    });

    dji = data;
    N225parse();
  });

  function N225parse() {
    d3.csv("src/^N225.csv", function(error, data) {
      data.forEach(d => { 
        d.Date = parse(d.Date); //parse(d.Date);
        d.Close = Number(d.Close);
      });

      n225 = data;
      HSIparse();
    });
  }

  function HSIparse() {
    d3.csv("src/^HSI.csv", function(error, data) {
      data.forEach(d => { 
        d.Date = parse(d.Date);// d.Date = parse(d.Date);
        d.Close = Number(d.Close);
      });

      hsi = data;
      displayData();
    });
  }

  function displayData() {
    console.log(dji);
    console.log(n225);
    console.log(hsi);

    // Compute the minimum and maximum date, and the maximum price.
    x.domain([dji[0].Date, dji[dji.length - 1].Date]);
    y.domain([0, d3.max(dji, function(d) { 
      return d.price; 
    })]).nice();

    
    // Add an SVG element with the desired dimensions and margin.
    var svg = d3.select(".multi-line-chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      
    svg.append("h1").text("Hello from p")

    // Add the clip path.
    svg.append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    // Add the x-axis.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the y-axis.
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + 0 + ",0)")
        .call(yAxis);

    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll('.line')
    .data([dji, n225, hsi])
    .enter()
      .append('path')
        .attr('class', 'line')
        .style('stroke', function(d) {
          return colors(Math.random() * 50);
        })
        .attr('clip-path', 'url(#clip)')
        .attr('d', function(d) {
          console.log(line(d));
          return line(d);
        })

    /**
    svg.selectAll('.line')
      .data([dji, n225, hsi])
      .enter()
        .append('path')
          .attr('class', 'line')
          .style('stroke', function(d) {
            return colors(Math.random() * 50);
          })
          .attr('clip-path', 'url(#clip)')
          .attr('d', function(d) {
            //TODO create array of [[date, Close], ...]
            // d[1] is the first entry attributes: Date, Close
            const resLine = [];
            d.forEach(x => {

              resLine.push([x.Date, x.Close])
            })

            console.log("resLine: "+resLine);
            return line(d);
          })
    */

    /* Add 'curtain' rectangle to hide entire graph */
    var curtain = svg.append('rect')
      .attr('x', -1 * width)
      .attr('y', -1 * height)
      .attr('height', height)
      .attr('width', width)
      .attr('class', 'curtain')
      .attr('transform', 'rotate(180)')
      .style('fill', '#ffffff');
      
    /* Optionally add a guideline */
    var guideline = svg.append('line')
      .attr('stroke', '#333')
      .attr('stroke-width', 0)
      .attr('class', 'guide')
      .attr('x1', 1)
      .attr('y1', 1)
      .attr('x2', 1)
      .attr('y2', height)
      
    /* Create a shared transition for anything we're animating */
    var t = svg.transition()
      .delay(750)
      .duration(6000)
      .ease(d3.easeLinear)
      .on('end', function() {
        d3.select('line.guide')
          .transition()
          .style('opacity', 0)
          .remove()
      });
    
    t.select('rect.curtain')
      .attr('width', 0);
    t.select('line.guide')
      .attr('transform', 'translate(' + width + ', 0)')

    d3.select("#show_guideline").on("change", function(e) {
      guideline.attr('stroke-width', this.checked ? 1 : 0);
      curtain.attr("opacity", this.checked ? 0.75 : 1);
    })

  }

  // Parse dates and numbers. We assume values are sorted by date.
  function type(d) {
    d.date = parse(d.date);
    d.price = +d.price;
    return d;
  }
}