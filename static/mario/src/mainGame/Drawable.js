import GameUI from '../GameUI';
import {GRAVITY, Images} from '../constants';

export default class Drawable {
    grounded = false;
    sX = 0;
    sY = 0;
    width = 32;
    height = 32;

    constructor(canvas, type, x, y) {
        this.gameUI = new GameUI(canvas);
        this.element = Images[this.IMAGE_SRC];

        if (type) this.fromType(type);
        if (typeof x !== 'undefined' && typeof y !== 'undefined')
            [this.x, this.y] = [x, y];
    }

    setSXBeforeDraw() {}

    fromType(type) {
        throw new Error('Not implemented');
    }

    draw() {
        this.setSXBeforeDraw();
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

    move() {
        this.velY += GRAVITY;
        this.x += this.velX;
        this.y += this.velY;
    }
}
