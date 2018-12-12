function createGraph(data, day) {
    const margin = {top: 50, right: 10, bottom: 80, left: 60};
    const width = document.documentElement.clientWidth - margin.left - margin.right - 20;
    const height = 550 - margin.top - margin.bottom;
    const colours = ["#ff8600","#0098ec","#fee200","#ff76ce","#3aec5c","#ff012c","#f8f8f8"];

    var xScale = d3.scaleLinear()
        .domain([0, 24])
        .range([0, width]);

    var combinedArray = data[1]
    if (day === undefined)
        combinedArray.concat(data[2], data[3], data[4], data[5], data[6], data[7]);
    
    var yScale = d3.scaleLinear()
        .domain([0, d3.max((day === undefined ? combinedArray : data[day]), d => d.count)])
        .range([height, 0]);
    
    var line = d3.line()
        .x(function(d) { return xScale(d.hour); })
        .y(function(d) { return yScale(d.count); })
        .curve(d3.curveMonotoneX);

    var svg = d3.select('#graph')
        .append('svg')
        .attrs({
            id: 'plot',
            width: width + margin.left + margin.right,
            height: height + margin.top + margin.bottom
        })
        .append('g')
        .attrs({
            transform: 'translate(' + margin.left + ', ' + margin.top + ')'
        });
    
    svg.append('g')
        .attrs({
            class: 'x axis',
            transform: 'translate(0, ' + height + ')'
        })
        .call(d3.axisBottom(xScale));
    svg.append('g')
        .attrs({
            class: 'y axis'
        })
        .call(d3.axisLeft(yScale));
    
    svg.append('g')
        .attr('class', 'grid')
        .call(
            d3.axisLeft(yScale).ticks(5)
            .tickSize(-width)
            .tickFormat('')
        );

    var lines = svg.append('g').attr('class', 'data');
    if (day === undefined) {
        for (var i = 7; i > 0; i--) {
            lines.append('path')
                .datum(data[i])
                .attrs({
                    class: 'line',
                    d: line,
                })
                .styles({
                    stroke: colours[i-1]
                });
        }
    } else {
        lines.append('path')
            .datum(data[day])
            .attrs({
                class: 'line',
                d: line
            })
            .styles({
                stroke: colours[parseInt(day)-1]
            });
    }

    var days = {1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun'};
    var legend = d3.select('#plot')
        .append('g')
        .attrs({
            transform: 'translate(' + (width/2 + margin.left) + ', ' + (height + margin.top + margin.bottom/2) + ')',
            width: 100,
            height: 10
        });
    
    if (day === undefined) {
        for (var i = 0; i < 7; i++) {
            legend.append('rect')
                .attrs({
                    width: 20,
                    height: 10,
                    rx: 5,
                    ry: 5,
                    fill: colours[i],
                    x: (i-3) * 50 - 10
                });
            legend.append('text')
                .attrs({
                    x: (i-3) * 50 + 12,
                    y: 5,
                    'alignment-baseline': 'central',
                    'dominant-baseline': 'central',
                    fill: 'whitesmoke',
                    'font-size': 12
                })
                .text(days[i+1]);
        }
    }
}
