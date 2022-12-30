import GameUI from '../GameUI';
import {GRAVITY} from '../constants';

export default class Bullet {
    grounded = false;
    sY = 0;
    width = 16;
    height = 16;

    constructor() {
        this.gameUI = GameUI.getInstance();

        this.element = new Image();
        this.element.src = './images/bullet.png';
    }

    init(x, y, direction) {
        this.velX = 8 * direction; //changing the direction of the bullet if mario faces another side
        this.velY = 0;
        this.x = x + this.width;
        this.y = y + 30;
        this.type = 30;
        this.sX = 0;
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
        if (this.grounded) {
            //bouncing the bullet as it touches the ground
            this.velY = -4;
            this.grounded = false;
        }

        this.velY += GRAVITY;

        this.x += this.velX;
        this.y += this.velY;
    }
}
