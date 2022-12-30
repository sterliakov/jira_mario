import {Types} from '../constants';
import {collisionCheck} from '../helpers';
import Drawable from './Drawable';
import PowerUp from './PowerUp';

export default class Element extends Drawable {
    get IMAGE_SRC() {
        return 'elements.png';
    }

    fromType(type) {
        this.type = type ?? this.type;
        this.sX = (type - Types.Platform) * this.width;
    }

    meetMario(mario) {
        const collisionDirection = collisionCheck(mario, this);
        switch (collisionDirection) {
            case 'l':
            case 'r': {
                mario.velX = 0;
                mario.jumping = false;

                //flag pole
                if (this.type === Types.FlagPole)
                    return {action: 'levelFinish', args: [collisionDirection]};
                break;
            }
            case 'b': {
                if (this.type !== Types.FlagPole) {
                    //only if not flag pole
                    mario.grounded = true;
                    mario.jumping = false;
                }
                break;
            }
            case 't': {
                if (this.type !== Types.FlagPole) mario.velY *= -1;

                switch (this.type) {
                    case Types.PowerUpBox:
                    case Types.FlowerBox: {
                        const type =
                            mario.type === 'small' &&
                            this.type === Types.PowerUpBox
                                ? 30
                                : 31;
                        const powerUp = new PowerUp(
                            this._canvasRef,
                            type,
                            this.x,
                            this.y,
                        );
                        //gives mushroom if mario is small, otherwise gives flower
                        return {action: 'powerUp', args: [powerUp]};
                    }

                    case Types.CoinBox:
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
