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

let shape = {
    sequence: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    structure: ".((((....[[[[[[[[...))))......]]]]]]]].."
}


/*let shape = {
    sequence: "CGCUUCAUAUAAUCCUAAUGAUAUGGUUUGGGAGUUUCUACCAAGAGCCUUAAACUCUUGAUUAUGAAGUGCU",
    structure: "((((((((((((..[[[[..)))))).((((((.......)))))).((((((.]]]]...))))))))))))"
}*/



/*let shape = {
    sequence: 'GGAGAUUGAUCAUCUCCAUAGGGUAUGGCUGAAUAACUGUUGUGGUCAUCACGCAGUAAGGCUGAAGUAGAACAGGCUGUGGUGGCCGCCAAGGAAUACCGGGAGACCGGAGUCUUGUGAAUCCUUAACCGGGAGUUCGAAAAGAUCAGAGGUUUACUAAGCAUUAGUGAGACCCCUCUGUUGAAGGUAUAAUGUAAUCCUUCUACCCACCU',
    structure: ".((((........))))...(((((..((..........(((((.......)))))....))....((.(((..(((.......))).((((((..................))))))....(..........))))).))....(((((((.((((.........))))....))))))).(((((...........)))))))))....."
}*/

fetch('http://0.0.0.0:80/circular-coords', {
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
            scale = 300. / Number(input.R)
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
                svg.append('path')
                    .attr('d', `M ${pos[idx1][0] * scale + origin.x} ${pos[idx1][1] * scale + origin.y} C ${origin.x} ${origin.y} ${origin.x} ${origin.y} ${pos[idx2][0] * scale + origin.x} ${pos[idx2][1] * scale + origin.y}`)
                    .attr('stroke', '#d3ae00')
                    .attr('stroke-width', 1)
                    .attr('fill', 'transparent');
            }
        })
    }

    for (let i = 0; i < pos.length; i++) {

        svg.append('circle')
            .attr('cx', pos[i][0] * scale + origin.x)
            .attr('cy', pos[i][1] * scale + origin.y)
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
            .attr("x", pos[i][0] * scale + origin.x)
            .attr("y", pos[i][1] * scale + origin.y)
            .text(shape.sequence[i]);

    }

}