

class Graph3d {
    constructor(points, lines, texts) {
        this.points = points;
        this.lines = lines;
        this.texts = texts;
    }

    log() {
        console.log(this.points[0].projected.x);
    }
}