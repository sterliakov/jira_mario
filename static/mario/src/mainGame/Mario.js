import GameUI from '../GameUI';
import {FRICTION, GRAVITY} from '../constants';
import Bullet from './Bullet';

export default class Mario {
    type = 'small';
    width = 32;
    height = 44;
    speed = 3;
    velX = 0;
    velY = 0;
    jumping = false;
    grounded = false;
    invulnerable = false;
    sX = 0; // sprite x
    sY = 4; // sprite y
    frame = 0;
    maxTick = 25; //max number for ticks to show mario sprite

    constructor(canvas) {
        this.gameUI = new GameUI(canvas);
        this.canvasRef = canvas;
    }

    init() {
        this.x = 10;
        this.y = this.gameUI.getHeight() - 40 - 40;
        this.tickCounter = 0;

        this.marioSprite = new Image();
        this.marioSprite.src = './images/mario-sprites.png';
    }

    draw() {
        this.sX = this.width * this.frame;
        this.gameUI.draw(
            this.marioSprite,
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

    checkMarioType() {
        switch (this.type) {
            case 'big':
                this.height = 60;
                this.sY = this.invulnerable ? 276 : 90;
                break;
            case 'small':
                this.height = 44;
                this.sY = this.invulnerable ? 222 : 4;
                break;
            case 'fire':
                this.height = 60;
                this.sY = 150;
                break;
            default:
                throw new Error('Unknown type');
        }
    }

    resetPos() {
        const canvas = this.gameUI.getCanvas();
        this.x = canvas.width / 10;
        this.y = canvas.height - 40;
        this.frame = 0;
        this.tickCounter = 0;
    }

    jump() {
        if (!this.jumping && this.grounded) {
            this.jumping = true;
            this.grounded = false;
            this.velY = -(this.speed / 2 + 5.5);

            // this.sprite position
            if (this.frame === 0 || this.frame === 1) {
                this.frame = 3; //right jump
            } else if (this.frame === 8 || this.frame === 9) {
                this.frame = 2; //left jump
            }
            return true;
        }
        return false;
    }

    setSpeed(isShift) {
        this.speed = isShift ? 4.5 : 3;
    }

    shoot() {
        if (this.type === 'fire' && !this.bulletFlag) {
            this.bulletFlag = true;
            const direction =
                this.frame === 9 || this.frame === 8 || this.frame === 2
                    ? -1
                    : 1;
            const bullet = new Bullet(
                this.canvasRef,
                this.x,
                this.y,
                direction,
            );

            setTimeout(() => {
                //only let mario fire bullet after 500ms
                this.bulletFlag = false;
            }, 500);

            return bullet;
        }
    }

    pickFrame() {
        if (this.velX > 0 && this.velX < 1 && !this.jumping) this.frame = 0;
        else if (this.velX > -1 && this.velX < 0 && !this.jumping)
            this.frame = 8;

        if (this.grounded) {
            this.velY = 0;

            // grounded sprite position
            if (this.frame === 3) {
                this.frame = 0; //looking right
            } else if (this.frame === 2) {
                this.frame = 8; //looking left
            }
        }
    }

    move() {
        this.velX *= FRICTION;
        this.velY += GRAVITY;

        this.x += this.velX;
        this.y += this.velY;
    }

    onRight() {
        if (this.velX < this.speed) {
            this.velX++;
        }

        // sprite position
        if (!this.jumping) {
            this.tickCounter++;

            if (this.tickCounter > this.maxTick / this.speed) {
                this.tickCounter = 0;
                this.frame = this.frame !== 1 ? 1 : 0;
            }
        }
    }

    onLeft() {
        if (this.velX > -this.speed) {
            this.velX--;
        }

        // sprite position
        if (!this.jumping) {
            this.tickCounter++;

            if (this.tickCounter > this.maxTick / this.speed) {
                this.tickCounter = 0;
                this.frame = this.frame !== 9 ? 9 : 8;
            }
        }
    }

    finishLevel(collisionDirection, inGround) {
        if (collisionDirection === 'r') {
            this.x += 10;
            this.velY = 2;
            this.frame = 11;
        } else if (collisionDirection === 'l') {
            this.x -= 32;
            this.velY = 2;
            this.frame = 10;
        }
        if (inGround) {
            this.x += 20;
            this.frame = 10;
            this.tickCounter += 1;
            if (this.tickCounter > this.maxTick) {
                this.x += 10;
                this.tickCounter = 0;
                this.frame = 12;
                return true;
            }
        }
        return false;
    }
}
