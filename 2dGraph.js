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

let scale = 20;
const sphereRadius = 16;
const circleRadius = 300.;
const bezieDelta = 0.7


/*let shape = {
    sequence: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    structure: ".((((....[[[[[[[[...))))......]]]]]]]].."
}*/



let shape = {
    sequence: "CGCUUCAUAUAAUCCUAAUGAUAUGGUUUGGGAGUUUCUACCAAGAGCCUUAAACUCUUGAUUAUGAAGUGCU",
    structure: "((((((((((((..[[[[..)))))).((((((.......)))))).((((((.]]]]...))))))))))))"
}


/*let shape = {
    sequence: 'GGAGAUUGAUCAUCUCCAUAGGGUAUGGCUGAAUAACUGUUGUGGUCAUCACGCAGUAAGGCUGAAGUAGAACAGGCUGUGGUGGCCGCCAAGGAAUACCGGGAGACCGGAGUCUUGUGAAUCCUUAACCGGGAGUUCGAAAAGAUCAGAGGUUUACUAAGCAUUAGUGAGACCCCUCUGUUGAAGGUAUAAUGUAAUCCUUCUACCCACCU',
    structure: ".((((........))))...(((((..((..........(((((.......)))))....))....((.(((..(((.......))).((((((..................))))))....(..........))))).))....(((((((.((((.........))))....))))))).(((((...........)))))))))....."
}*/

fetch('http://0.0.0.0:80/graph-2d', {
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
            console.log(input)
            scale = circleRadius / Number(input.R)
            console.log(scale)
            loadCanvas(input.pos, input.adj, input.r)
        })
    })
    .catch(error => {
        console.error('Error:', error);
    });


function loadCanvas(pos, adj, r) {

    const {innerWidth, innerHeight} = window;
    const origin = {x: innerWidth / 2, y: (innerHeight) / 2};

    var svg = d3.select("#app")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .append("g");

    for (const [idx1, value] of Object.entries(adj)) {
        value.forEach((idx2) => {
            if (idx1 != (Number(idx2) + 1) && idx1 != (idx2 - 1) && idx1 > idx2) {

                const x1 = pos[idx1][0] * scale + origin.x;
                const y1 = pos[idx1][1] * scale + origin.y;
                const x2 = pos[idx2][0] * scale + origin.x;
                const y2 = pos[idx2][1] * scale + origin.y;

                const xCenter = (x1 + x2) / 2;
                const yCenter = (y1 + y2) / 2;
                const dim = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))

                const xVector = - origin.x + xCenter;
                const yVector = - origin.y + yCenter;
                const mod = Math.sqrt(Math.pow(xVector - origin.x, 2) + Math.pow(yVector - origin.y, 2))

                /*const bezieX = xVector * (1.5 * dim / mod) + xCenter
                const bezieY = yVector * (1.5 * dim / mod) + yCenter*/

                console.log(`dim: ${dim}`)
                console.log(`radius: ${circleRadius}; delta: ${ bezieDelta * (1 - (dim / (2 * circleRadius)))}`)

                const bezieX = xVector / mod * circleRadius * bezieDelta * (1 - (dim / (2 * circleRadius))) + origin.x;
                const bezieY = yVector / mod * circleRadius * bezieDelta * (1 - (dim / (2 * circleRadius))) + origin.y;

                svg.append('path')
                    .attr('d', `M ${pos[idx1][0] * scale + origin.x} ${pos[idx1][1] * scale + origin.y} Q ${bezieX} ${bezieY} ${pos[idx2][0] * scale + origin.x} ${pos[idx2][1] * scale + origin.y}`)
                    .attr('stroke', '#d3ae00')
                    .attr('stroke-width', Math.min(Math.max(2 / 30 * scale, 1), 2.4))
                    .attr('fill', 'transparent');
            }
        })
    }

    for (let i = 0; i < pos.length; i++) {

        const x = pos[i][0] * scale + origin.x;
        const y = pos[i][1] * scale + origin.y;

        svg.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', sphereRadius / 20 * scale)
            .attr('stroke', '#FFDB1C')
            .attr('stroke-width', 3 / 30 * scale)
            .style('fill', '#2C2B1C');

        svg.append('text')
            .attr("class", "text")
            .attr("font-size", 1.23 * scale)
            .attr("dy", "+.4em")
            .attr("text-anchor", "middle")
            .attr("font-family", "Inter")
            .attr("font-weight", 'regular')
            .attr("fill", '#FFF')
            .attr("x", x)
            .attr("y", y)
            .text(shape.sequence[i]);

        if (i % 10 == 9 && i != 0 && i != pos.length - 1) {
            svg.append('text')
                .attr("class", "text")
                .attr("font-size", 1.23 * scale)
                .attr("dy", "+.4em")
                .attr("text-anchor", "middle")
                .attr("font-family", "Inter")
                .attr("font-weight", 'regular')
                .attr("fill", '#FFF')
                .attr("x", x + (x - origin.x) / 140 * scale)
                .attr("y", y + (y - origin.y) / 140 * scale)
                .text(i + 1);
        }
    }

    svg.append('text')
        .attr("class", "text")
        .attr("font-size", 1.23 * scale)
        .attr("dy", "+.4em")
        .attr("text-anchor", "middle")
        .attr("font-family", "Inter")
        .attr("font-weight", 'regular')
        .attr("fill", '#207dff')
        .attr("x", pos[0][0] * scale + origin.x + (pos[0][0] * scale + origin.x - origin.x) / 140 * scale)
        .attr("y", pos[0][1] * scale + origin.y + (pos[0][1] * scale + origin.y - origin.y) / 140 * scale)
        .text("5'");

    svg.append('text')
        .attr("class", "text")
        .attr("font-size", 1.23 * scale)
        .attr("dy", "+.4em")
        .attr("text-anchor", "middle")
        .attr("font-family", "Inter")
        .attr("font-weight", 'regular')
        .attr("fill", '#207dff')
        .attr("x", pos[pos.length - 1][0] * scale + origin.x + (pos[pos.length - 1][0] * scale + origin.x - origin.x) / 140 * scale)
        .attr("y", pos[pos.length - 1][1] * scale + origin.y + (pos[pos.length - 1][1] * scale + origin.y - origin.y) / 140 * scale)
        .text("3'");

}
