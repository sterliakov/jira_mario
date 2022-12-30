import {collisionCheck} from '../helpers';
import Drawable from './Drawable';

export default class Enemy extends Drawable {
    get IMAGE_SRC() {
        return 'enemies.png';
    }

    velX = 1;
    velY = 0;
    frame = 0;
    type = 20;

    tickCounter = 0; //for animating enemy
    maxTick = 10; //max number for ticks to show enemy sprite

    fromType(type) {
        this.type = type ?? this.type ?? 20;
        this.sX = 0;
    }

    setSXBeforeDraw() {
        this.sX = this.width * this.frame;
    }

    update() {
        if (this.grounded) this.velY = 0;

        if (this.state === 'dead') {
            this.frame = 2; //squashed goomba
            this.tickCounter++;
            if (this.tickCounter >= 60) this.frame = 4;
        } else if (this.state === 'deadFromBullet') {
            //falling goomba
            this.frame = 3;
            this.velX = 0;
            this.move();
        } else {
            //only animate when not dead
            this.move();

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

        if (direction === 'l' || direction === 'r') this.velX *= -1;
        else if (direction === 'b') this.grounded = true;
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
        const collision = collisionCheck(this, bullet);
        if (collision) {
            this.state = 'deadFromBullet';
            return true;
        }
        return false;
    }
}
