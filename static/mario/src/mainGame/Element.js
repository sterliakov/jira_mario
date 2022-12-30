import GameUI from '../GameUI';

export default class Element {
    sY = 0;
    width = 32;
    height = 32;

    constructor() {
        this.gameUI = GameUI.getInstance();

        this.element = new Image();
        this.element.src = './images/elements.png';
    }

    platform() {
        this.type = 1;
        this.sX = 0;
    }

    coinBox() {
        this.type = 2;
        this.sX = 1 * this.width;
    }

    powerUpBox() {
        this.type = 3;
        this.sX = 2 * this.width;
    }

    uselessBox() {
        this.type = 4;
        this.sX = 3 * this.width;
    }

    flagPole() {
        this.type = 5;
        this.sX = 4 * this.width;
    }

    flag() {
        this.type = 6;
        this.sX = 5 * this.width;
    }

    pipeLeft() {
        this.type = 7;
        this.sX = 6 * this.width;
    }

    pipeRight() {
        this.type = 8;
        this.sX = 7 * this.width;
    }

    pipeTopLeft() {
        this.type = 9;
        this.sX = 8 * this.width;
    }

    pipeTopRight() {
        this.type = 10;
        this.sX = 9 * this.width;
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
