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
        this.sX = (type - 1) * 45 + (this.type === Types.Coin ? 12 : 0);
        this.sY = this.type === Types.Coin ? 12 : 0;
        if (this.type === Types.Flag) this.sX++;
    }

    draw() {
        this.setSXBeforeDraw();
        this.do_draw(
            this.element,
            this.sX,
            this.sY,
            this.type === Types.Coin ? 21 : 45,
            this.type === Types.Coin ? 21 : 45,
            this.x,
            this.y,
            32,
            32,
        );
        if (this.update) this.update();
    }

    _topMarioCollision(mario) {
        if (this.type !== Types.FlagPole) mario.velY *= -1;

        switch (this.type) {
            case Types.PowerUpBox: {
                const type = mario.type === 'small' ? Types.Donut : Types.Candy;
                const powerUp = new PowerUp(type, this.x, this.y);
                this.type = Types.UselessBox;
                //gives mushroom if mario is small, otherwise gives flower
                return {action: 'powerUp', args: [powerUp]};
            }
            case Types.CoinBox:
                this.type = Types.UselessBox;
                return {action: 'coinBox', args: []};
            case Types.NormalBrick:
                if (mario.type !== 'small') {
                    this.type = Types.Blank;
                    return {action: 'destroyBrick'};
                } else {
                    return null;
                }
            default:
                return null;
        }
    }

    meetMario(mario) {
        const collisionDirection = collisionCheck(mario, this);
        if (collisionDirection != null && this.type === Types.Coin) {
            this.type = Types.Blank;
            return {action: 'coin', args: []};
        }
        switch (collisionDirection) {
            case 'l':
            case 'r': {
                mario.velX = 0;
                if (mario.jumping) {
                    mario.jumping = false;
                    mario.frame = 'start';
                }

                //flag pole
                if (this.type === Types.FlagPole)
                    return {action: 'levelFinish', args: [collisionDirection]};
                break;
            }
            case 'b': {
                if (this.type !== Types.FlagPole) {
                    //only if not flag pole
                    mario.grounded = true;
                    if (mario.jumping) {
                        mario.jumping = false;
                        mario.frame = 'start';
                    }
                }
                break;
            }
            case 't': {
                return this._topMarioCollision(mario);
            }
            default:
                return null;
        }
    }
}
