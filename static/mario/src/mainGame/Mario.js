import {FRICTION, GRAVITY} from '../constants';
import {getMario, saveMario} from '../helpers';
import Bullet from './Bullet';
import Drawable from './Drawable';

class MarioHat extends Drawable {
    sX = 585;
    sY = 40;
    height = 15;

    get IMAGE_SRC() {
        return 'mario-sprites.png';
    }
}

export default class Mario extends Drawable {
    get IMAGE_SRC() {
        return 'mario-sprites.png';
    }

    type = 'small';
    width = 32;
    height = 45;
    speed = 3;
    velX = 0;
    velY = 0;
    jumping = false;
    grounded = false;
    invulnerable = false;
    sX = 0; // sprite x
    sY = 4; // sprite y
    _frame = 0;
    maxTick = 25; //max number for ticks to show mario sprite

    get frame() {
        return this._frame;
    }
    set frame(f) {
        switch (f) {
            case 'start':
                this._frame = 0;
                break;
            case 'jump0':
                this._frame = 11;
                break;
            case 'left0':
                this._frame = 5;
                break;
            case 'right0':
                this._frame = 5;
                break;
            case 'jumpNext':
                this._frame = ((this._frame - 6 + 1) % 6) + 6;
                break;
            case 'jumpPrev':
                this._frame = ((this._frame - 6 - 1) % 6) + 6;
                break;
            case 'leftNext':
                this._frame = (this._frame + 5 - 1) % 5;
                break;
            case 'rightNext':
                this._frame = (this._frame + 1) % 5;
                break;
            case 'dead':
                this._frame = 13;
                break;
            case 'win':
                this._frame = 12;
                break;
            default:
                throw new Error('Unknown frame');
        }
    }

    constructor(props) {
        super(0, 10, 40);
        this.tickCounter = 0;
        this.hat = new MarioHat(this.canvasRef);
        return (async () => {
            const {type, sex} = props ?? (await getMario());
            this.type = type;
            this.sex = sex;
            return this;
        })();
    }

    resetToStart() {
        saveMario({type: 'small'});
        this.type = 'small';
        this.invulnerable = false;
        this.frame = 'start';
    }

    draw() {
        if (this.invulnerable) this.ctx.globalAlpha = 0.6;
        super.draw();
        if (this.type === 'big') {
            this.hat.x = this.x;
            if (this.sex === 'm') {
                switch (this.frame) {
                    case 0:
                        this.hat.x += 1;
                        break;
                    case 2:
                        this.hat.x -= 2;
                        break;
                    case 4:
                    case 7:
                    case 8:
                    case 11:
                    case 12:
                        this.hat.x += 2;
                        break;
                    default:
                        break;
                }
            } else {
                switch (this.frame) {
                    case 2:
                    case 3:
                        this.hat.x -= 1;
                        break;
                    case 4:
                    case 7:
                    case 11:
                    case 12:
                        this.hat.x += 1;
                        break;
                    default:
                        break;
                }
            }
            this.hat.y = this.y;
            this.hat.draw();
        }
        this.ctx.globalAlpha = 1;
    }

    setSXBeforeDraw() {
        this.sX = 0 + 45 * this.frame;
        this.sY = 0;
        if (this.type === 'big') this.sY -= 13;
        else if (this.type === 'fire' && this.frame !== 12 && this.frame !== 13)
            this.sY += 42;
        if (this.sex === 'f') this.sY += 97;
    }

    checkType() {
        switch (this.type) {
            case 'small':
                this.height = 40;
                break;
            case 'big':
                this.height = 53;
                break;
            case 'fire':
                this.height = 45;
                break;
            default:
                throw new Error('Unknown type');
        }
    }

    resetPos() {
        this.x = 10;
        this.y = 40;
        this.frame = 'start';
        this.tickCounter = 0;
        this.jumpTickCounter = 0;
        this.rotateCounter = 0;
    }

    jump() {
        if (this.jumping || !this.grounded) return false;

        this.jumping = true;
        this.grounded = false;
        this.velY = -(this.speed / 2 + 5.5);
        this.frame = 'jump0';
        return true;
    }

    setSpeed(isShift) {
        this.speed = isShift ? 4.5 : 3;
    }

    shoot() {
        if (this.type !== 'fire' || this.bulletFlag) return undefined;

        const direction = this.velX < 0 ? -1 : 1;
        //only let mario fire bullet after 500ms
        this.bulletFlag = true;
        setTimeout(() => (this.bulletFlag = false), 500);
        return new Bullet(this.x, this.y, direction);
    }

    pickFrame() {
        if (this.jumping) {
            if (this.jumpTickCounter++ === 8) {
                if (this.velY < 0) this.frame = 'jumpNext';
                else if (this.velY > 0) this.frame = 'jumpPrev';
                this.jumpTickCounter = 0;
            }
            this.rotateCounter = 0;
        } else {
            this.jumpTickCounter = 0;
        }

        if (this.grounded) {
            this.velY = 0;
            this.jumpTickCounter = 0;
        }
    }

    move() {
        this.velX *= FRICTION;
        this.velY += GRAVITY;

        this.x += this.velX;
        this.y += this.velY;
    }

    onRight() {
        if (this.velX < this.speed) this.velX++;
        if (!this.jumping && ++this.tickCounter > this.maxTick / this.speed) {
            this.tickCounter = 0;
            this.frame = 'rightNext';
        }
    }

    onLeft() {
        if (this.velX > -this.speed) this.velX--;
        if (!this.jumping && ++this.tickCounter > this.maxTick / this.speed) {
            this.tickCounter = 0;
            this.frame = 'leftNext';
        }
    }

    finishLevel(collisionDirection, inGround) {
        if (collisionDirection === 'r' || collisionDirection === 'l') {
            this.velY = 2;
            this.frame = 'win';
            this.x += collisionDirection === 'r' ? 10 : -32;
        }

        if (inGround) {
            this.x += 20;
            if (++this.tickCounter > this.maxTick) {
                this.x += 10;
                this.tickCounter = 0;
                return true;
            }
        }
        return false;
    }
}
