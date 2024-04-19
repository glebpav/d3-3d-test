import {
    drag,
    select,
    color,
    extent,
    randomInt,
    scaleLinear,
    scaleOrdinal,
    schemeCategory10,
} from "https://cdn.skypack.dev/d3@7.8.5";

import {
    points3D,
    lines3D,
} from "https://cdn.skypack.dev/d3-3d@1.0.0";


let shape = {
    sequence: "CGCUUCAUAUAAUCCUAAUGAUAUGGUUUGGGAGUUUCUACCAAGAGCCUUAAACUCUUGAUUAUGAAGUGCU",
    structure: "((((((((((((..[[[[..)))))).((((((.......)))))).((((((.]]]]...))))))))))))"
}

fetch('http://0.0.0.0:80/run-script-with-markers', {
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
            throw new Error('Network response was not ok');
        }
        response.json().then(data => {
            const input = JSON.parse(data)
            loadCanvas(input.pos, input.adj)
        })
    })
    .catch(error => {
        console.error('Error:', error);
    });


function shadeColor(color, percent) {

    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    R = Math.round(R)
    G = Math.round(G)
    B = Math.round(B)

    var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

function getShadingPercentage(value) {
    const maxVale = 50;
    const minValue = -100;

    return -(100 - Math.min(100, (value - minValue) / (maxVale - minValue) * 100))

}


function loadCanvas(pos, adj) {

    const {innerWidth, innerHeight} = window;
    const data = [];
    const origin = {x: innerWidth / 2, y: innerHeight / 2};
    const startAngle = 0;
    var distances = [];
    const sphereRadius = 12;

    const svg = select('svg')
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
            x: pos[i][0] * 50,
            y: pos[i][1] * 50,
            z: pos[i][2] * 50,
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

    /*const pointsElements = [];
    for (let i = 0; i < data.length; i++) {
        const element = document.createElement("circle");
        element.classList.add("d3-3d");
        element.setAttribute("fill", "#ffe372");
        element.setAttribute("stroke", "#7a4900");
        element.setAttribute("cx", data[i].projected.x);
        element.setAttribute("cy", data[i].projected.y);
        element.setAttribute("r", 12);
        element.setAttribute("stroke-width", 3);
        document.getElementById("core").appendChild(element);
        pointsElements.push(element);
    }*/

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


    function updateData() {
        for (let i = 0; i < pointsElements.length; i++) {
            pointsElements[i].setAttribute("cx", data[i].projected.x);
            pointsElements[i].setAttribute("cy", data[i].projected.y);
        }
    }

    function processData(data, dataAdj) {
        const points = svg.selectAll('circle').data(data);
        const lines1 = svg.selectAll('line').data(dataAdj);
        const texts = svg.selectAll("text.text").data(data);

        /*for (let i = 0; i < pointsElements.length; i++) {
            pointsElements[i].setAttribute("cx", data[i].projected.x);
            pointsElements[i].setAttribute("cy", data[i].projected.y);
        }*/

        distances = []

        for (let j = 0; j < data2.length; j++) {
            const p1 = data[data2[j][0]].projected;
            const p2 = data[data2[j][1]].projected;

            distances.push(Math.sqrt(
                Math.pow((p1.x - p2.x), 2)
                + Math.pow((p1.y - p2.y), 2)
            ))
        }

        const l = lines1
            .enter()
            .append('line')
            .merge(lines1)
            .classed('d3-3d', true)
            .datum(data)
            // .attr('d', lineGenerator)
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
                if (data2[i][0] != data2[i][1] + 1 && data2[i][0] != data2[i][1] - 1) {
                    return shadeColor('#207dff', getShadingPercentage(z))
                } else return shadeColor('#ffffff', getShadingPercentage(z))
            })
            .attr('stroke-width', 3);


        const p = points
            .enter()
            .append('circle')
            .merge(points)
            .classed('d3-3d', true)
            .attr('fill', (d, i) => {
                if (i >= shape.structure.length) return 'transparent'
                return shadeColor("#ffe372", getShadingPercentage(d.rotated.z))
            })
            .attr('stroke', (d, i) => {
                if (i >= shape.structure.length) return 'transparent'
                return shadeColor("#7a4900", getShadingPercentage(d.rotated.z))
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
            .attr("font-family", "system-ui, sans-serif")
            .attr("font-weight", "bolder")
            .attr("x", (d) => d.projected.x)
            .attr("y", (d) => d.projected.y)
            .classed("d3-3d", true)
            .merge(texts)
            .attr("fill", d => shadeColor("#207dff", getShadingPercentage(d.rotated.z)))
            .attr("stroke", "none")
            .attr("x", (d) => d.projected.x)
            .attr("y", (d) => d.projected.y + sphereRadius * 1.3)
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

}

function addNewPoint() {

}