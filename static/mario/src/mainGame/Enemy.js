import GameUI from '../GameUI';
import {GRAVITY} from '../constants';

export default class Enemy {
    velX = 1;
    velY = 0;
    grounded = false;
    sY = 0;
    width = 32;
    height = 32;
    frame = 0;

    tickCounter = 0; //for animating enemy
    maxTick = 10; //max number for ticks to show enemy sprite

    constructor(canvas) {
        this.gameUI = new GameUI(canvas);

        this.element = new Image();
        this.element.src = './images/enemies.png';
    }

    goomba() {
        this.type = 20;
        this.sX = 0;
    }

    draw() {
        this.sX = this.width * this.frame;
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
            this.velY = 0;
        }

        if (this.state == 'dead') {
            this.frame = 2; //squashed goomba

            this.tickCounter++;
            if (this.tickCounter >= 60) {
                this.frame = 4;
            }
        } else if (this.state == 'deadFromBullet') {
            //falling goomba
            this.frame = 3;
            this.velY += GRAVITY;
            this.y += this.velY;
        } else {
            //only animate when not dead
            this.velY += GRAVITY;
            this.x += this.velX;
            this.y += this.velY;

            //for animating
            this.tickCounter++;

            if (this.tickCounter > this.maxTick) {
                this.tickCounter = 0;
                this.frame = this.frame === 0 ? 1 : 0;
            }
        }
    }
}
