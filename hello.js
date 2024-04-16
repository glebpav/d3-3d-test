import {
    color,
    drag,
    extent,
    scaleLinear,
    scaleOrdinal,
    schemeCategory10,
    select,
} from "https://cdn.skypack.dev/d3@7.8.5";

import {points3D,} from "https://cdn.skypack.dev/d3-3d@1.0.0";

let mx;
let my;
let mouseX = 0;
let mouseY = 0;
let beta = startAngle;
let alpha = startAngle;

const {innerWidth, innerHeight} = window;
const origin = {x: innerWidth / 2, y: innerHeight / 2};
const startAngle = Math.PI / 8;

const canvas = select('canvas').call(drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd));
const ctx = canvas.node().getContext('2d');

$.ajax({
    url: "data/data.json",
    dataType: "json",
    success: function (response) {
        loadCanvas(response["pos"], response["adj"])
    }
});

function loadCanvas(pos, adj) {

    const data = [];
    const colorScale = scaleOrdinal(schemeCategory10);

    for (let i = 0; i < pos.length; i++) {
        data.push({
            x: pos[i][0],
            y: pos[i][1],
            z: pos[i][2],
            fill: colorScale(i),
        });
    }

    document.addEventListener('DOMContentLoaded', (event) => {

        const points3d = points3D()
            .scale(5)
            .origin(origin)
            .x(d => d.x)
            .y(d => d.y)
            .z(d => d.z)
            .rotateX(-startAngle)
            .rotateY(startAngle);

        canvas
            .attr('width', `${innerWidth}px`)
            .attr('height', `${innerHeight}px`);

        const data3D = points3d(data);
        const extentZ = extent(data3D, d => d.rotated.z);
        const zScale = scaleLinear().domain(extentZ).range([1, 8]);

        processData(data3D.sort(points3d.sort));
    });
}


function dragStart(e) {
    mx = e.x;
    my = e.y;
}

function dragged(e) {
    alpha = (e.y - my + mouseY) * Math.PI / 360;
    beta = (e.x - mx + mouseX) * Math.PI / 360 * (-1);

    processData(points3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(data).sort(points3d.sort));
}

function dragEnd(e) {
    mouseX = e.x - mx + mouseX;
    mouseY = e.y - my + mouseY;
}

function processData(data) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.fill();

    data.forEach((d, i) => {
        ctx.beginPath();
        ctx.fillStyle = d.fill;
        ctx.strokeStyle = color(d.fill).brighter(1);
        ctx.arc(d.projected.x, d.projected.y, zScale(d.rotated.z), 0, 2 * Math.PI,);
        ctx.fill();
        ctx.stroke();
    });
}
