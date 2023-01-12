import {Types} from '../constants';
import {collisionCheck} from '../helpers';
import Drawable from './Drawable';

const CANDY_WIDTH = 16;
const DONUT_WIDTH = 32;

export default class PowerUp extends Drawable {
    get IMAGE_SRC() {
        return 'powerups.png';
    }
    velY = 0;
    maxTick = 10;

    constructor(type, x, y) {
        super(type, x, y);
        this.y = y - this.height;
        this.tickCounter = 0;
    }

    fromType(type) {
        this.type = type ?? this.type;
        if (this.type === Types.Flower) {
            this.x += 5;
            this.velX = 0;
            this.frame = 0;
            this.width = CANDY_WIDTH;
            this.height = 30;
        } else {
            this.velX = 2;
            this.frame = 1;
            this.width = 32;
            this.height = 32;
        }
    }

    setSXBeforeDraw() {
        this.sX =
            this.type === Types.Flower
                ? 0
                : CANDY_WIDTH + (this.frame - 1) * DONUT_WIDTH;
    }

    update() {
        if (this.type !== Types.Mushroom) return;
        if (this.grounded) this.velY = 0;
        this.move();
        if (this.tickCounter++ >= this.maxTick) {
            this.tickCounter = 0;
            this.frame = ((this.frame - 1 + 1) % 6) + 1;
        }
    }

    meetElement(element) {
        if (element.type === Types.Coin) return;
        const collision = collisionCheck(this, element);
        //change direction if collision with any element from the sidr
        if (collision === 'l' || collision === 'r') this.velX *= -1;
        else if (collision === 'b') this.grounded = true;
    }

    meetMario(mario) {
        if (collisionCheck(this, mario)) {
            //mushroom
            if (this.type === Types.Mushroom && mario.type === 'small')
                mario.type = 'big';
            //flower
            else if (this.type === Types.Flower) mario.type = 'fire';
            return true;
        }
        return false;
    }
}
