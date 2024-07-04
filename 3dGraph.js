import {
    drag,
    select
} from "https://cdn.skypack.dev/d3@7.8.5";

import {
    points3D,
    lines3D,
} from "https://cdn.skypack.dev/d3-3d@1.0.0";

import {
    shadeColor,
    ColorManager
} from "/utils/colorManager.js"

import {
    svgString2Image,
    getSVGString
} from "/utils/svgExportManager.js"

// 422

// broken structure
/*
let shape = {
    sequence: "AFADFADFAFASDFASDFASDFASDFASDFASDFASDFASDFASDFASDFASDFADWSFADW",
    structure: "(((((((((()))))))))))))))))))))))))))))))))))))))))))))))))))))"
}
*/

/*let shape = {
    sequence: "CGCUUCAUAUAAUCCUAAUGAUAUGGUUUGGGAGUUUCUACCAAGAGCCUUAAACUCUUGAUUAUGAAGUGCU",
    structure: "((((((((((((........)))))).((((((.......)))))).((((((........))))))))))))"
}*/

let shape = {
    sequence: "CGCUUCAUAUAAUCCUAAUGAUAUGGUUUGGGAGUUUCUACCAAGAGCCUUAAACUCUUGAUUAUGAAGUGCU",
    structure: "((((((((((((..[[[[..)))))).((((((.......)))))).((((((.]]]]...))))))))))))"
}

/*let shape = {
    sequence: "UACCUGUGAAGAUGCAGGUUACCCGCGACAGGACGGAAAGACCCCGUGGAGCUUUACUGUAGCCUGAUAUUGAAAUUCGGCACAGCUUGUACAGGAUAGGUAGGAGCCUUUGAAACGUGAGCGCUAGCUUACGUGGAGGCGCUGGUGGGAUACUACCCUAGCUGUGUUGGCUUUCUAACCCGCACCACUUAUCGUGGUGGGAGACAGUGUCAGGCGGGCAGUUUGACUGGGGCGGUCGCCUCCUAAAAGGUAACGGAGGCGCUCAAAGGUUCCCUCAGAAUGGUUGGAAAUCAUUCAUAGAGUGUAAAGGCAUAAGGGAGCUUGACUGCGAGACCUACAAGUCGAGCAGGGUCGAAAGACGGACUUAGUGAUCCGGUGGUUCCGCAUGGAAGGGCCAUCGCUCAACGGAUAAAAGCUACCCCGGGGAUAACAGGCUUAUCUCCCCCAAGAGUUCACAUCGACGGGGAGGUUUGGCACCUCGAUGUCGGCUCAUCGCAUCCUGGGGCUGUAGUCGGUCCCAAGGGUUGGGCUGUUCGCCCAUUAAAGCGGUACGCGAGCUGGGUUCAGAACGUCGUGAGACAGUUCGGUCCCUAUCCGUCGUGGGC",
    structure: ".(((((........)))))..((((((((.(((.((......((((.(((((((.((((...(((((((..((((.(((((((((((.(..(...[..{{{{{..(((......((((((((....))))))))...)))........).].}}}}}).))))))))))).))))....((.((((((.....))))))))......)))))))....))))..((((.....))))((((((...........))))))(([[....[[[[[[((.((((((.......))))))...))((){.{{{))....]]]]]]....((((..(((...[..)))..)))).(((....))).]]}}}.}.....(((((((.((........))))))))).....)].....)))))..))))))........(((.((((((((...((.......))...)))))))..))))..........(((((((((((..((.((((((......))))))...)).(((((.....))))).....)))))..)..)))).).....(((((((....))).))))....))..)))))))))))."
}*/

/*let shape = {
    structure: ".((((........))))...(((((..((..........(((((.......)))))....))....((.(((..(((.......))).((((((..................))))))....(..........))))).))....(((((((.((((.........))))....))))))).(((((...........))))))))).....",
    sequence: ""
}*/

/*let shape = {
    sequence: 'GGAGAUUGAUCAUCUCCAUAGGGUAUGGCUGAAUAACUGUUGUGGUCAUCACGCAGUAAGGCUGAAGUAGAACAGGCUGUGGUGGCCGCCAAGGAAUACCGGGAGACCGGAGUCUUGUGAAUCCUUAACCGGGAGUUCGAAAAGAUCAGAGGUUUACUAAGCAUUAGUGAGACCCCUCUGUUGAAGGUAUAAUGUAAUCCUUCUACCCACCU',
    structure: ".((((........))))...(((((..((..........(((((.......)))))....))....((.(((..(((..[[[[.))).((((((..................))))))....(....]]]]..))))).))....(((((((.((((....[[[[.))))....))))))).(((((...]]]]....)))))))))....."
}*/

/*let shape = {
    sequence: 'GGAGAUUGAUCAUCUCCAUAGGGUAUGGCUGAAUAACUGUUGUGGUCAUCACGCAGUAAGGCUGAAGUAGAACAGGCUGUGGUGGCCGCCAAGGAAUACCGGGAGACCGGAGUCUUGUGAAUCCUUAACCGGGAGUUCGAAAAGAUCAGAGGUUUACUAAGCAUUAGUGAGACCCCUCUGUUGAAGGUAUAAUGUAAUCCUUCUACCCACCU',
    structure: ".((((........))))...(((((..((..........(((((.......)))))....))....((.(((..(((.......))).((((((..................))))))....(..........))))).))....(((((((.((((.........))))....))))))).(((((...........)))))))))....."
}*/

fetch('http://0.0.0.0:80/graph-3d', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        structure: shape.structure,
    })
})
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) })
        }
        response.json().then(data => {
            const input = JSON.parse(data)
            loadCanvas(input.pos, input.adj, input.knots)
        })
    })
    .catch(error => {
        console.error('Error:', error);
    });


let svg;
let scale = 8;
let maxValue = 100;
let minValue = -100;
let colorManager = new ColorManager(maxValue, minValue);


function loadCanvas(pos, adj, knots) {

    let maxDist = 0;

    for (let k = 0; k < pos.length; k++) {
        for (let j = 0; j < pos.length; j++) {
            const dist = Math.sqrt(
                Math.pow((pos[k][0] - pos[j][0]), 2)
                + Math.pow((pos[k][1] - pos[j][1]), 2)
                + Math.pow((pos[k][2] - pos[j][2]), 2)
            );
            if (maxDist < dist) maxDist = dist;
        }
    }

    const dist1 = []
    for (let k = 0; k < 7; k++) {
        for (let j = 0; j < adj[k].length; j++) {
            const dist = Math.sqrt(
                Math.pow((pos[k][0] - pos[adj[k][j]][0]), 2)
                + Math.pow((pos[k][1] - pos[adj[k][j]][1]), 2)
                + Math.pow((pos[k][2] - pos[adj[k][j]][2]), 2)
            );
            dist1.push(dist);
        }
    }
    dist1.sort();

    scale /= dist1[Math.floor(dist1.length / 2)]
    maxDist *= scale

    const {innerWidth, innerHeight} = window;
    const data = [];
    const origin = {x: innerWidth / 2, y: (innerHeight) / 2};
    const startAngle = 0;
    var distances = [];
    const sphereRadius = 16;

    svg = select('svg')
        .call(drag()
            .on('drag', dragged)
            .on('start', dragStart)
            .on('end', dragEnd));

    const points3d = points3D()
        .x(d => d.x)
        .y(d => d.y)
        .z(d => d.z)
        .scale(5)
        .origin(origin)
        .rotateY(startAngle);

    const lines3d = lines3D()
        .x((d) => d.x)
        .y((d) => d.y)
        .z((d) => d.z);

    let mx;
    let my;
    let mouseX = 0;
    let mouseY = 0;
    let beta = startAngle;
    let alpha = startAngle;

    select('svg')
        .attr('width', `${innerWidth}px`)
        .attr('height', `${innerHeight}px`);

    for (let i = 0; i < pos.length; i++) {
        data.push({
            x: pos[i][0] * scale,
            y: pos[i][1] * scale,
            z: pos[i][2] * scale,
            fill: "#a773f5",
        });
    }

    const data1 = [];
    const data2 = [];
    for (let i = 0; i < adj.length; i++) {
        for (let j = 0; j < adj[i].length; j++) {
            data1.push([i, adj[i][j]])
        }
    }

    Object.entries(adj).forEach(([key, value]) => {
        for (let j = 0; j < value.length; j++) {
            data2.push([Number(key), Number(value[j])])
            data1.push([
                {x: pos[key][0], y: pos[key][1], z: pos[key][2]},
                {x: pos[value[j]][0], y: pos[value[j]][1], z: pos[value[j]][2]},
            ])
        }
    });

    const lines3dWrapper = lines3d(data1);
    const points3dWrapper = points3d(data);

    function dragStart(e) {
        mx = e.x;
        my = e.y;
    }

    function dragged(e) {
        alpha = (e.y - my + mouseY) * Math.PI / 360;
        beta = (e.x - mx + mouseX) * Math.PI / 360 * (-1);

        processData(points3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(data), lines3dWrapper);
    }

    function dragEnd(e) {
        mouseX = e.x - mx + mouseX;
        mouseY = e.y - my + mouseY;
    }

    function processData(data, dataAdj) {
        const points = svg.selectAll('circle').data(data);
        const lines1 = svg.selectAll('line').data(dataAdj);
        const texts = svg.selectAll("text.text").data(data);

        distances = []

        for (let j = 0; j < data2.length; j++) {
            const p1 = data[data2[j][0]].projected;
            const p2 = data[data2[j][1]].projected;

            distances.push(Math.sqrt(
                Math.pow((p1.x - p2.x), 2)
                + Math.pow((p1.y - p2.y), 2)
            ))
        }

        maxValue = data[0].rotated.z;
        for (let j = 1; j < data.length; j++) {
            if (data[j].rotated.z > maxValue)
                maxValue = data[j].rotated.z;
        }

        minValue = maxValue - maxDist;
        colorManager.updateValues(minValue, maxValue);

        const l = lines1
            .enter()
            .append('line')
            .merge(lines1)
            .classed('d3-3d', true)
            .datum(data)
            .attr('x1', (d, i) => {
                return d[data2[i][0]].projected.x
                    + (d[data2[i][1]].projected.x - d[data2[i][0]].projected.x)
                    * (sphereRadius / distances[i]);
            })
            .attr('x2', (d, i) => {
                return d[data2[i][1]].projected.x
                    + (d[data2[i][0]].projected.x - d[data2[i][1]].projected.x)
                    * sphereRadius / distances[i];
            })
            .attr('y1', (d, i) => {
                return d[data2[i][0]].projected.y
                    + (d[data2[i][1]].projected.y - d[data2[i][0]].projected.y)
                    * sphereRadius / distances[i];
            })
            .attr('y2', (d, i) => {
                return d[data2[i][1]].projected.y
                    + (d[data2[i][0]].projected.y - d[data2[i][1]].projected.y)
                    * sphereRadius / distances[i];
            })
            .attr('z1', (d, i) => d[data2[i][0]].projected.z)
            .attr('z2', (d, i) => d[data2[i][1]].projected.z)
            .attr('z', (d, i) => Math.min(d[data2[i][1]].rotated.z, d[data2[i][0]].rotated.z))
            .attr('stroke', (d, i) => {
                const z = (d[data2[i][1]].rotated.z + d[data2[i][0]].rotated.z) / 2;
                if (data2[i][1] >= shape.structure.length || data2[i][0] >= shape.structure.length) {
                    return shadeColor('#ffffff', colorManager.getShadingPercentage(z))
                }
                else if (data2[i][0] === data2[i][1] + 1 || data2[i][0] === data2[i][1] - 1) {
                    return shadeColor('#ffffff', colorManager.getShadingPercentage(z))
                } else if (knots.includes(data2[i][1]) || knots.includes(data2[i][0])) {
                    return shadeColor('#207dff', colorManager.getShadingPercentage(z))
                } else return shadeColor('#207dff', colorManager.getShadingPercentage(z))
            })
            .attr('stroke-width', (d, i) => {
                if (data2[i][1] >= shape.structure.length || data2[i][0] >= shape.structure.length) {
                    return 2;
                } return 5;
            });

        const p = points
            .enter()
            .append('circle')
            .merge(points)
            .classed('d3-3d', true)
            .attr('fill', (d, i) => {
                //if (i >= shape.structure.length) return shadeColor("#000cff", getShadingPercentage(d.rotated.z));
                if (i >= shape.structure.length) return 'transparent'
                return shadeColor("#1c292c", colorManager.getShadingPercentage(d.rotated.z))
            })
            .attr('stroke', (d, i) => {
                // console.log("i - ", i, "; len - ", shape.structure.length, "; ", i >= shape.structure.length)
                if (i >= shape.structure.length) return 'transparent';

                return shadeColor("#62C7FF", colorManager.getShadingPercentage(d.rotated.z))
            })
            .attr('cx', d => d.projected.x)
            .attr('cy', d => d.projected.y)
            .attr('r', sphereRadius)
            .attr('stroke-width', 3)
            .attr('z', d => d.rotated.z);

        const t = texts
            .enter()
            .append("text")
            .attr("class", "text")
            .attr("dy", "-.5em")
            .attr("text-anchor", "middle")
            .attr("font-family", "Inter")
            .attr("font-weight", ((d, i) => {
                /*if (i >= shape.structure.length) return 100
                return 700*/
                return 'regular'
            }))
            .attr("x", (d) => d.projected.x)
            .attr("y", (d) => d.projected.y)
            .classed("d3-3d", true)
            .merge(texts)
            .attr("fill", ((d, i) => {
                return shadeColor("#D1D1D1", colorManager.getShadingPercentage(d.rotated.z))
            }))
            .attr("stroke", "none")
            .attr("x", (d) => d.projected.x)
            .attr("y", (d) => d.projected.y + sphereRadius * 0.9)
            .attr('z', (d, i) => d.rotated.z + 0.01)
            .text((d, i) => {
                if (i >= shape.structure.length) return (i - shape.structure.length + 1) * 10
                return shape.sequence[i]
            });

        // Get all circle and line elements from the DOM
        const circles = Array.from(document.querySelectorAll('circle'));
        const lines = Array.from(document.querySelectorAll('line'));
        const textsElements = Array.from(document.querySelectorAll('text'));

        const shapes = circles.concat(lines).concat(textsElements);


        shapes.sort((a, b) => {
            const zA = parseInt(a.getAttribute('z'));
            const zB = parseInt(b.getAttribute('z'));
            return zA - zB;
        });

        shapes.forEach(shape => {
            shape.parentNode.removeChild(shape);
        });

        const svg1 = document.querySelector('svg'); // Assuming shapes are within an SVG element
        shapes.forEach(shape => {
            svg1.appendChild(shape);
        });


    }
    processData(points3dWrapper, lines3dWrapper);

    // let graph3d =
}

// Set up the export button
d3.select('#saveButton').on('click', function(){
    let svgString = getSVGString(svg.node());
    svgString2Image( svgString, innerWidth * 2, innerHeight * 2, 'png', save ); // passes Blob and filesize String to the callback

    function save( dataBlob, filesize ){
        saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
    }
});