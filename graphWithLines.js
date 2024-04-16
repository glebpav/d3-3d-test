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

// console.log(document.getElementById('db_seq').value)

fetch('http://127.0.0.1:5000/run-script', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        sequence: "((((((((((((..[[[[[.)))))).((((((.......)))))).((((((.]]]]]..))))))))))))",
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


function loadCanvas(pos, adj) {

    const {innerWidth, innerHeight} = window;
    const data = [];
    const origin = {x: innerWidth / 2, y: innerHeight / 2};
    const startAngle = Math.PI / 8;
    const colorScale = scaleOrdinal(schemeCategory10);

    const svg = select('svg')
        .call(drag()
            .on('drag', dragged)
            .on('start', dragStart)
            .on('end', dragEnd))
        .append('g');

    const points3d = points3D()
        .x(d => d.x)
        .y(d => d.y)
        .z(d => d.z)
        .scale(5)
        .origin(origin)
        .rotateX(-startAngle)
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
        const lines = svg.selectAll('line').data(dataAdj);

        const l = lines
            .enter()
            .append('line')
            .merge(lines)
            .classed('d3-3d', true)
            .datum(data)
            // .attr('d', lineGenerator)
            .attr('x1', (d, i) => d[data2[i][0]].projected.x)
            .attr('x2', (d, i) => d[data2[i][1]].projected.x)
            .attr('y1', (d, i) => d[data2[i][0]].projected.y)
            .attr('y2', (d, i) => d[data2[i][1]].projected.y)
            .attr('z1', (d, i) => d[data2[i][0]].projected.z)
            .attr('z2', (d, i) => d[data2[i][1]].projected.z)
            .attr('stroke', (d, i) => {
                if (data2[i][0] != data2[i][1] + 1 && data2[i][0] != data2[i][1] - 1) {
                    return '#207dff'
                } else return '#ffffff'
            })
            .attr('stroke-width', 3);


        const p = points
            .enter()
            .append('circle')
            .merge(points)
            .classed('d3-3d', true)
            .attr('fill', (d, i) => "#ffe372")
            .attr('stroke', (d, i) => "#7a4900")
            .attr('cx', d => d.projected.x)
            .attr('cy', d => d.projected.y)
            .attr('r', d => 12)
            .attr('stroke-width', 3)
            .sort(points3d.sort);
    }

    processData(points3dWrapper, lines3dWrapper);

}