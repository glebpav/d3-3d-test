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
} from "https://cdn.skypack.dev/d3-3d@1.0.0";

$.ajax({
    url: "data/data.json",
    dataType: "json",
    success: function (response) {
        loadCanvas(response["pos"], response["adj"])
    }
});

function loadCanvas(pos, adj) {

    const { innerWidth, innerHeight } = window;
    const data = [];
    const origin = { x: innerWidth / 2, y: innerHeight / 2 };
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

    let mx;
    let my;
    let mouseX = 0;
    let mouseY = 0;
    let beta = startAngle;
    let alpha = startAngle;

    select('svg')
        .attr('width', `${innerWidth}px`)
        .attr('height', `${innerHeight}px`);

    for(let i = 0; i < pos.length; i++){
        data.push({
            x: pos[i][0] * 30,
            y: pos[i][1] * 30,
            z: pos[i][2] * 30,
            fill: colorScale(10),
        });
    }

    console.log(data)

    const data3D = points3d(data);
    const extentZ = extent(data3D, d => d.rotated.z);
    const zScale = scaleLinear().domain(extentZ).range([1, 8]);

    function dragStart(e){
        mx = e.x;
        my = e.y;
    }

    function dragged(e){
        alpha = (e.y - my + mouseY) * Math.PI / 360;
        beta = (e.x - mx + mouseX) * Math.PI / 360 * (-1);

        processData(points3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(data));
    }

    function dragEnd(e){
        mouseX = e.x - mx + mouseX;
        mouseY = e.y - my + mouseY;
    }

    function processData(data){
        const points = svg.selectAll('circle').data(data);

        const p = points
            .enter()
            .append('circle')
            .merge(points)
            .classed('d3-3d', true)
            .attr('fill', (d, i) => colorScale(i))
            .attr('stroke', (d, i) => color(colorScale(i)).brighter(1))
            .attr('cx', d => d.projected.x)
            .attr('cy', d => d.projected.y)
            .attr('r', d => 5)
            .sort(points3d.sort);
    }

    processData(data3D);

}