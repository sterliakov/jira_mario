import {collisionCheck} from '../helpers';
import Drawable from './Drawable';
import PowerUp from './PowerUp';

export default class Element extends Drawable {
    get IMAGE_SRC() {
        return 'elements.png';
    }

    fromType(type) {
        this.type = type ?? this.type;
        this.sX = (type - 1) * this.width;
    }

    meetMario(mario) {
        const collisionDirection = collisionCheck(mario, this);
        switch (collisionDirection) {
            case 'l':
            case 'r': {
                mario.velX = 0;
                mario.jumping = false;

                //flag pole
                if (this.type === 5)
                    return {action: 'levelFinish', args: [collisionDirection]};
                break;
            }
            case 'b': {
                if (this.type !== 5) {
                    //only if not flag pole
                    mario.grounded = true;
                    mario.jumping = false;
                }
                break;
            }
            case 't': {
                if (this.type !== 5) mario.velY *= -1;

                switch (this.type) {
                    case 3:
                    case 11: {
                        //PowerUp Box
                        const type =
                            mario.type === 'small' && this.type === 3 ? 30 : 31;
                        const powerUp = new PowerUp(
                            this.gameUI._canvasRef,
                            type,
                            this.x,
                            this.y,
                        );
                        //gives mushroom if mario is small, otherwise gives flower
                        return {action: 'powerUp', args: [powerUp]};
                    }

                    //Coin Box
                    case 2:
                        return {action: 'coinBox', args: []};

                    default: {
                    }
                }
                break;
            }

            default: {
            }
        }
    }
}
