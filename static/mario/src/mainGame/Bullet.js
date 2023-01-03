import {Types} from '../constants';
import {collisionCheck} from '../helpers';
import Drawable from './Drawable';

export default class Bullet extends Drawable {
    get IMAGE_SRC() {
        return 'bullet.png';
    }

    width = 16;
    height = 16;
    velY = 0;
    type = Types.Bullet;

    constructor(x, y, direction) {
        super(Types.Bullet, x, y + 30);
        this.x = x + this.width;
        this.velX = 8 * direction; //changing the direction of the bullet if mario faces another side
    }

    fromType(type) {
        this.type = Types.Bullet;
        this.sX = 0;
    }

    update() {
        if (this.grounded) {
            //bouncing the bullet as it touches the ground
            this.velY = -4;
            this.grounded = false;
        }
        this.move();
    }

    /**
     *  @returns boolean: whether the bullet should be destroyed
     */
    meetElement(element) {
        switch (collisionCheck(this, element)) {
            // bounce
            case 'b':
                this.grounded = true;
                return false;
            case 't':
            case 'l':
            case 'r':
                return true;
            default:
                return false;
        }
    }
}
