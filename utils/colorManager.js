
export class ColorManager {
    constructor(minValue, maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    updateValues(minValue, maxValue) {
        this.maxValue = maxValue;
        this.minValue = minValue;
    }

    getShadingPercentage(value) {
        const percent = 60;
        return -((percent / 100 * (100 - Math.min(100, (value - this.minValue)
            / (this.maxValue - this.minValue) * 100))));
    }
}
export function shadeColor(color, percent) {

    console.log(percent)

    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (110 + percent) / 110);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (120 + percent) / 120);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    R = Math.round(R)
    G = Math.round(G)
    B = Math.round(B)

    var RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    var GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    var BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

/*
export function shadeColor(color, percent) {

    const startColor = '#62C7FF';
    const endColor = '#E010FFB3';

    function hexToRgb(hex) {
        return hex.match(/\w\w/g).map(x => parseInt(x, 16));
    }

    function rgbToHex(rgb) {
        return '#' + rgb.map(x => ('0' + Math.round(x).toString(16)).slice(-2)).join('');
    }

    const startColorRgb = hexToRgb(startColor);
    const endColorRgb = hexToRgb(endColor);

    const newColor = startColorRgb.map((start, i) =>
        start + (endColorRgb[i] - start) * (percent / 100)
    );

    return rgbToHex(newColor);

}
*/


