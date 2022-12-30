import {Types} from '../constants';
import {collisionCheck} from '../helpers';
import Drawable from './Drawable';

export default class PowerUp extends Drawable {
    get IMAGE_SRC() {
        return 'powerups.png';
    }
    velX = 2;
    velY = 0;

    constructor(canvas, type, x, y) {
        super(canvas, type, x, y);
        this.y = y - this.height;
    }

    fromType(type) {
        this.type = type ?? this.type;
        this.sX = (type - Types.Mushroom) * this.width;
    }

    // types: 30 - mushroom, 31 - flower

    update() {
        if (this.type !== Types.Mushroom) return;
        if (this.grounded) this.velY = 0;
        this.move();
    }

    meetElement(element) {
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
