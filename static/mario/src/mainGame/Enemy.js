import GameUI from '../GameUI';
import {GRAVITY} from '../constants';
import {collisionCheck} from '../helpers';

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

    constructor(canvas, type, x, y) {
        this.gameUI = new GameUI(canvas);

        this.element = new Image();
        this.element.src = './images/enemies.png';
        if (type) this.fromType(type);
        if (typeof x !== 'undefined' && typeof y !== 'undefined')
            [this.x, this.y] = [x, y];
    }

    fromType(type) {
        this.type = type;
        this.sX = (type - 20) * this.width;
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

        if (this.state === 'dead') {
            this.frame = 2; //squashed goomba

            this.tickCounter++;
            if (this.tickCounter >= 60) {
                this.frame = 4;
            }
        } else if (this.state === 'deadFromBullet') {
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

    meetElement(element) {
        if (this.state === 'deadFromBullet') return;
        //so this goombas fall from the map when dead from bullet
        const direction = collisionCheck(this, element);

        if (direction === 'l' || direction === 'r') {
            this.velX *= -1;
        } else if (direction === 'b') {
            this.grounded = true;
        }
    }

    meetMario(mario) {
        // If mario is invulnerable or goomba is dead, collision doesn't occur
        if (
            mario.invulnerable ||
            this.state === 'dead' ||
            this.state === 'deadFromBullet'
        )
            return null;

        const collision = collisionCheck(this, mario);

        switch (collision) {
            case 't':
                //kill goombas if collision is from top
                this.state = 'dead';
                mario.velY = -mario.speed;
                return 'kill';
            case 'r':
            case 'l':
            case 'b':
                this.velX *= -1;

                if (mario.type === 'small') {
                    return 'die';
                } else {
                    if (mario.type === 'big') mario.type = 'small';
                    else if (mario.type === 'fire') mario.type = 'big';

                    mario.invulnerable = true;
                    setTimeout(() => {
                        mario.invulnerable = false;
                    }, 1000);

                    return 'reduce';
                }
            default: {
            }
        }
    }

    meetBullet(bullet) {
        // Check for collision only if goombas exist and is not dead
        if (this.state === 'dead') return false;
        const collWithBullet = collisionCheck(this, bullet);
        if (collWithBullet) {
            this.state = 'deadFromBullet';
            return true;
        }
        return false;
    }
}
