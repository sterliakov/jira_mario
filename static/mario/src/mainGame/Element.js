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
