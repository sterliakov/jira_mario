import GameUI from '../GameUI';
import {GRAVITY} from '../constants';

export default class PowerUp {
    velX = 2;
    velY = 0;
    sY = 0;
    width = 32;
    height = 32;

    constructor(canvas) {
        this.gameUI = new GameUI(canvas);
        this.element = new Image();
        this.element.src = './images/powerups.png';
    }

    mushroom(x, y) {
        this.x = x;
        this.y = y - this.height;
        this.type = 30;
        this.sX = 0;
    }

    flower(x, y) {
        this.x = x;
        this.y = y - this.height;
        this.type = 31;
        this.sX = 32;
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

    update() {
        if (this.type === 30) {
            if (this.grounded) {
                this.velY = 0;
            }

            this.velY += GRAVITY;

            this.x += this.velX;
            this.y += this.velY;
        }
    }
}
