const innerRadius = 100;
const middleRadius = 200;
const outerRadius = 250;
const innerTextRadius = (middleRadius-innerRadius)/2 + innerRadius;
const middleTextRadius = (outerRadius-middleRadius)/2 + middleRadius;
const outerTextRadius = outerRadius + 10;
const xOffset = 300, yOffset = 300;

let totalCount = '61,896'; // !!HARD-CODED VALUE!!

function arcCoordinates(fromPercentage, toPercentage, radius, clockwise = true) {
    let fromX = Math.cos(2 * Math.PI * fromPercentage - Math.PI/2) * radius + xOffset;
    let fromY = Math.sin(2 * Math.PI * fromPercentage - Math.PI/2) * radius + yOffset;
    let toX = Math.cos(2 * Math.PI * toPercentage - Math.PI/2) * radius + xOffset;
    let toY = Math.sin(2 * Math.PI * toPercentage - Math.PI/2) * radius + yOffset;
    
    return {
        fromX: clockwise ? fromX : toX,
        fromY: clockwise ? fromY : toY,
        toX: clockwise ? toX : fromX,
        toY: clockwise ? toY : fromY,
        radius: radius,
        'largeArcFlag': toPercentage - fromPercentage > 0.5 ? 1 : 0,
        'sweepFlag': clockwise ? 1 : 0
    };
}

function svgArc(arcInfo, includeM = true) {
    let d = (includeM ? 'M ' + arcInfo.fromX + ' ' + arcInfo.fromY : '') +
            ' A ' + arcInfo.radius + ' ' + arcInfo.radius + ' 0 ' +
            arcInfo.largeArcFlag + ' ' + arcInfo.sweepFlag + ' ' +
            arcInfo.toX + ' ' + arcInfo.toY;
    return d;
}

function svgSlice(fromPercentage, toPercentage, innerRadius, outerRadius) {
    let outerArc = svgArc(arcCoordinates(fromPercentage, toPercentage, outerRadius, true), true);
    let innerInfo = arcCoordinates(fromPercentage, toPercentage, innerRadius, false);
    let innerArc = svgArc(innerInfo, false);
    
    return outerArc + ' L ' + innerInfo.fromX + ' ' + innerInfo.fromY + ' ' + innerArc + ' Z';
}

d3.selection.prototype.appendSlice = function(fromPercentage, toPercentage, innerRadius, outerRadius) {
    return this.append('path').attr({
        d: svgSlice(fromPercentage, toPercentage, innerRadius, outerRadius),
        //fill: 'none',
        //stroke: 'black'
    });
};

d3.selection.prototype.appendArcText = function(arcInfo, text, clockwise = true) {
    let id = arcInfo.fromX + '' + arcInfo.fromY + '' + arcInfo.toX + '' + arcInfo.toY + clockwise;
    d3.select('#plot').select('defs').append('path').attr({
        d: svgArc(arcInfo),
        id: id
    });
    return this.append('text').append('textPath').attr({
        startOffset: '50%',
        'text-anchor': 'middle',
        'alignment-baseline': 'central',
        'dominant-baseline': 'central',
        'xlink:href': '#' + id,
        href: '#' + id
    }).append('tspan').text(text);
}

function grey(value) {
    let grey = Math.max(0, Math.min(255, Math.round(value)));
    return rgb = 'rgb(' + grey + ',' + grey + ',' + grey + ')';
}

function drawPlot(clusters) {
    let svg = d3.select('#wheelPlot').append('svg').attr({
        width: xOffset*2,
        height: yOffset*2,
        id: 'plot'
    });
    svg.append('defs');
    
    let count = svg.append('text').attr({
        'text-anchor': 'middle',
        'alignment-baseline': 'central',
        'dominant-baseline': 'central',
        'font-size': '48',
        x: xOffset,
        y: yOffset
    }).text(totalCount);
    count.attr({
        'font-size': '' + (count.node().getAttribute('font-size') * (innerRadius*2*0.9) / count.node().textLength.baseVal.value)
    });
    
    var totalPercentage = 0;
    //zones.forEach(zone => {
    clusters.forEach(zone => {
        let g = svg.append('g').attr('class', 'slice');
        let value = zone.distance === 0 ? 40 : (totalPercentage+zone.percent/2)*235;
        g.appendSlice(totalPercentage, totalPercentage += zone.percent,
                    zone.distance === 0 ? innerRadius : middleRadius, zone.distance === 0 ? middleRadius : outerRadius)
            .attr({
            fill: grey(value)
        });
        
        if (zone.distance !== 0) {
            let opposite = (totalPercentage-zone.percent/2) > 0.75;
            
            let x = Math.cos(2 * Math.PI * totalPercentage - Math.PI/2) * (outerRadius + 3) + xOffset;
            let y = Math.sin(2 * Math.PI * totalPercentage - Math.PI/2) * (outerRadius + 3) + yOffset;
            let d = svgArc(arcCoordinates(0, Math.min(0.9999999, totalPercentage), outerTextRadius)) + 
                    ' L ' + x + ' ' + y;
            g.append('path').attr({
                d: d,
                fill: 'transparent',
                stroke: 'black',
                'stroke-width': '2px',
                'pointer-events': 'none',
                visibility: 'hidden',
                class: 'share'
            });
            let outerOpposite = totalPercentage > 0.75;
            g.appendArcText(arcCoordinates(0, Math.min(0.9999999,totalPercentage), outerTextRadius, outerOpposite),
                            (totalPercentage*100).toFixed(1) + '% lives within ' + 
                            (zone.distance/1000).toFixed(zone.distance/1000 >= 9.5 ? 0 : 1) + ' km')
            .attr('dy', outerOpposite ? -4 : 12)
            .select(function() { return this.parentNode; }).attr({ // gets the parent node as d3 selection object
                'font-size': 12,
                'startOffset': !outerOpposite ? '0%' : '100%',
                'text-anchor': !outerOpposite ? 'start' : 'end',
                'alignment-baseline': 'auto',
                'dominant-baseline': 'auto',
                'pointer-events': 'none',
                visibility: 'hidden'
            });
            
            let r = (outerRadius-middleRadius)/2 + middleRadius;
            if (2 * Math.PI * zone.percent * r * 1.5 >  outerRadius - middleRadius) {
                g.appendArcText(arcCoordinates(totalPercentage-zone.percent, totalPercentage, middleTextRadius, opposite),
                                (zone.distance/1000).toFixed(zone.distance/1000 >= 9.5 ? 0 : 1) + ' km').attr({
                    'font-size': 10,
                    fill: value > 220 ? 'slategrey' : 'white'
                });
            } else if (2 * Math.PI * zone.percent * middleRadius >= 10) {
                let x = Math.cos(2 * Math.PI * (totalPercentage-zone.percent/2) - Math.PI/2) * r + xOffset;
                let y = Math.sin(2 * Math.PI * (totalPercentage-zone.percent/2) - Math.PI/2) * r + yOffset;
                let rot = x-xOffset === 0 ? -90 : Math.atan((y - yOffset) / (x-xOffset)) / Math.PI * 180;
                g.append('text').text((zone.distance/1000).toFixed(zone.distance/1000 >= 9.5 ? 0 : 1) + ' km').attr({
                    'font-size': 10,
                    fill: value > 220 ? 'slategrey' : 'white',
                    'text-anchor': 'middle',
                    'alignment-baseline': 'central',
                    x: x,
                    y: y,
                    transform: 'rotate(' + rot + ' ' + x + ' ' + y + ')'
                });
            }
        }
    });
    
    svg.append('g').attr('class', 'slice').appendSlice(clusters[0].percent, 1, innerRadius, middleRadius)
        .attr({
        //fill: grey(((1-clusters[0].percent)/2+clusters[0].percent)*235),
        fill: grey(100)
    });
    svg.appendArcText(arcCoordinates(0, clusters[0].percent, innerTextRadius, true),
                        (clusters[0].percent*100).toFixed(0) +  '% at home')
        .attr({
        'font-size': 20,
        fill: 'white'
    });
    svg.appendArcText(arcCoordinates(clusters[0].percent, 1, innerTextRadius, false),
                        (100-clusters[0].percent*100).toFixed(0) + '% away', false)
        .attr({
        'font-size': 20,
        fill: 'white'
    });
}