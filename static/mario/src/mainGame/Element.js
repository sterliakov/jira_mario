import GameUI from '../GameUI';

export default class Element {
    sY = 0;
    width = 32;
    height = 32;

    constructor(canvas, type, x, y) {
        this.gameUI = new GameUI(canvas);

        this.element = new Image();
        this.element.src = './images/elements.png';

        if (type) this.fromType(type);
        if (typeof x !== 'undefined' && typeof y !== 'undefined')
            [this.x, this.y] = [x, y];
    }

    fromType(type) {
        this.type = type;
        this.sX = (type - 1) * this.width;
    }

    // platform() {
    //     this.type = 1;
    // }

    // coinBox() {
    //     this.type = 2;
    // }

    // powerUpBox() {
    //     this.type = 3;
    // }

    // uselessBox() {
    //     this.type = 4;
    // }

    // flagPole() {
    //     this.type = 5;
    // }

    // flag() {
    //     this.type = 6;
    // }

    // pipeLeft() {
    //     this.type = 7;
    // }

    // pipeRight() {
    //     this.type = 8;
    // }

    // pipeTopLeft() {
    //     this.type = 9;
    // }

    // pipeTopRight() {
    //     this.type = 10;
    // }

    draw() {
        this.gameUI.draw(
            this.element,
            this.sX,
            this.sY,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height,
        );
    }
}
