// This project uses data from CSSEGISandData's Github, availiable here:
//  https://github.com/CSSEGISandData/COVID-19

// Function Space
function saveConfirmedCasesDataset(dataset) { confirmedCasesArr = dataset.data; }
function displayDataset() { console.log(confirmedCasesArr); }

// Importing data from covid 19 github availiable here:
//  https://github.com/CSSEGISandData/COVID-19

//Imported confirmed cases
Papa.parse(`https://raw.githubusercontent.com/CSSEGISandData/COVI
D-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid1
9_confirmed_global.csv`, {
        download: true,
        headers: true,
        complete: function (results) {
            d3.select('body').append('p')
            .text(`Successful loading of data from https://github.com/CSSEGISandData/COVID-19`);
            saveConfirmedCasesDataset(results);
            // Call main after completion of load of data for synchronous JS loading
            main();
        }
    }
);

// Main function is called after
function main() {

    function init() {}

    /** All of this code forks from http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f */
    const format = d3.format(',');

    // Set tooltips
    const tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(d => `<strong>Country: </strong><span class='details'>${d.properties.name}<br></span>
                    <strong>Confirmed Cases: </strong><span class='details'>${format(d.cases)}</span>`);

    const margin = {top: 0, right: 0, bottom: 0, left: 0};
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    var color = d3.scaleThreshold()
    .domain([
        10,
        100,
        500,
        1000,
        5000,
        10000,
        50000,
        100000,
        500000,
        1500000
    ])
    .range([
        'rgb(4,178,231)',
        'rgb(21,158,205)', 
        'rgb(38,138,179)', 
        'rgb(55,118,154)',
        'rgb(72,98,128)',
        'rgb(100,79,102)',
        'rgb(120,59,77)',
        'rgb(180,39,51)',
        'rgb(210,19,25)',
        'rgb(255,0,0)'
    ]);

    const svg = d3.select('.map-cont')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('class', 'map');

    const projection = d3.geoMercator()
        .scale(130)
        .translate( [width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    svg.call(tip);

    var listOfCountries = [];
    var jsonFile;

    window.setInterval(repeatUpdates, 50);

    queue()
    .defer(d3.json, 'src/world_countries.json')
    .await(ready);

    var counter;
    var simSpeed;

    function startChoro() { 
        counter = 1;
        maptimer = setInterval(choroPlay, simSpeed);
    }

    function choroPlay() {
        if (counter > 102)
            window.clearInterval(maptimer);
        updateValues(counter);
        updateDateText(counter);
        counter++;     
    }

    function updateDateText(days) {
        var tD = new Date(2020,1,22);
        tD.setDate(tD.getDate() + Number(days));
        var datestr = "Date displayed: "+tD.getMonth()+"."+tD.getDate() + "." + tD.getFullYear();
        document.getElementById("dateAt").innerHTML = datestr;
    }
    
    function repeatUpdates() {
        var slider = document.getElementById("dayRange");
        var speedslider = document.getElementById("speedAnimation");

        d3.select("#dayRange").on("click", () => {
            console.log(slider.value);
            updateValues(Number(slider.value));
            updateDateText(slider.value);
        });

        d3.select("#speedAnimation").on("click", () => {
            simSpeed = 2000 / Math.sqrt(2*speedslider.value);
            var speedstr = "Simulation speed: "+speedslider.value+"%";
            document.getElementById("speedAt").innerHTML = speedstr;
        }); 

        d3.select("#choroplay").on("click", () => {
            startChoro();
        }); 

    }

    function ready(error, data) {

        // Setting global variables
        jsonFile = data;
        data.features.forEach(x => {

            if(!listOfCountries.includes(x.properties.name)) {
                listOfCountries.push(x.properties.name);
            }
    
        });

        // finding all geometry names, pushing to listOFCountries

        updateValues(100);

        svg.append('g')
            .attr('class', 'countries')
            .selectAll('path')
            .data(data.features)
            .enter().append('path')
            .attr('d', path)
            .style('fill', d => color(d.cases))
            .style('stroke', 'white')
            .style('opacity', 0.8)
            .style('stroke-width', 0.3)
            .on('mouseover',function(d){
                tip.show(d);
                d3.select(this)
                .style('opacity', 1)
                .style('stroke-width', 3);
            })
            .on('mouseout', function(d){
                tip.hide(d);
                d3.select(this)
                .style('opacity', 0.8)
                .style('stroke-width',0.3);
            });

        svg.append('path')
            .datum(topojson.mesh(data.features, (a, b) => a.id !== b.id))
            .attr('class', 'names')
            .attr('d', path);
    }

    function updateValues(date) {

        // find a list of countries and updating its value
        listOfCountries.forEach(nameOfCountry => {
            // Finding the specific country within the list
            jsonFile.features.forEach(y => {
                // If found the country, update its value looping through data
                if (nameOfCountry == y.properties.name) {
                    // Initialize to zero preventing from any missing data
                    y.cases = 0;
                    // Pull from data to update each value
                    confirmedCasesArr.forEach(x => {
                        // If the name matches, add from the parsed data
                        if (x[1] == nameOfCountry || (nameOfCountry == 'USA' && x[1] == 'US')) {
                            y.cases += Number(x[3 + date]); // TODO 4 is a magic nunber, replace with __DATE_
                        }
                    });
                }
            });
        });
        

        //Update Visual fill colors
        d3.select('.countries')
        .selectAll('path')//select all the countries and prepare for a transition to new values
        .style('fill', (d) => {
            return color(d.cases)
        });

    }

    window.onload = init();

}


var script = document.createElement('script'); 
          
script.src =  
"js/stocks.js"; 
  
document.head.appendChild(script) 