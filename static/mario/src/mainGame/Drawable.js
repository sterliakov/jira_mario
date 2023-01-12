import {GRAVITY, Images} from '../constants';
import CanvasCapable from './CanvasCapable';

export default class Drawable extends CanvasCapable {
    sX = 0;
    sY = 0;
    width = 32;
    height = 32;

    constructor(type, x, y) {
        super({}); // Should be props, but we never actually use it as a Component
        this.element = Images[this.IMAGE_SRC];
        this.velX = 0;
        this.velY = 0;

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
        this.do_draw(
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
        if (this.update) this.update();
    }

    move() {
        this.velY += GRAVITY;
        this.x += this.velX;
        this.y += this.velY;
    }
}
