import {Types} from '../constants';
import {GRAVITY} from '../constants';
import {collisionCheck} from '../helpers';
import Bullet from './Bullet';
import Drawable from './Drawable';

export default class Enemy extends Drawable {
    get IMAGE_SRC() {
        return 'enemies.png';
    }

    frame = 0;
    cellWidth = 45;
    height = 45;

    tickCounter = 0;
    maxTick = 10;

    fromType(type) {
        this.type = type ?? this.type ?? Types.Vampire;
        this.sX = 0;
        this.velX = 1;
        this.state = 'alive';
        this.grounded = false;
        this.width = type === Types.Witch ? 28 : 45;
    }

    setSXBeforeDraw() {
        this.sY = this.height * (this.type - 20);
        if (this.state !== 'alive') this.sY += 1;
        this.sX = this.cellWidth * this.frame;
    }

    get isDirected() {
        return (
            this.type === Types.Zombie
            || this.type === Types.Witch
            || this.type === Types.Deer
        );
    }

    get isDead() {
        return this.state.toLowerCase().includes('dead');
    }

    move() {
        this.velY += GRAVITY;
        this.x += this.velX;
        this.y += this.velY;
    }

    update() {
        if (this.grounded && this.state !== 'fullyDead') this.velY = 0;

        if (this.state === 'fullyDead') {
            this.move();
        } else if (this.isDead) {
            // squashed
            this.velX = 0;
            this.frame = this.isDirected && this.velX < 0 ? 7 : 6;
            if (this.tickCounter++ >= 60) this.state = 'fullyDead';
        } else {
            this.move();
            if (this.tickCounter++ > this.maxTick) {
                this.tickCounter = 0;
                this.pickNextFrame();
            }
        }
    }

    pickNextFrame() {
        if (this.isDirected)
            if (this.velX < 0)
                this.frame = ((Math.max(this.frame, 3) + 1 - 3) % 3) + 3;
            else this.frame = (Math.min(this.frame, 2) + 1) % 3;
        else this.frame = (this.frame + 1) % 6;
    }

    shoot() {
        if (this.type !== Types.Witch) return null;
        if (this.frame !== 2 && this.frame !== 5) return null;
        if (this.tickCounter !== 0) return null;
        const direction = this.velX < 0 ? -1 : 1;
        return new Bullet(Types.EnemyBullet, this.x, this.y, direction);
    }

    meetElement(element) {
        if (this.state === 'fullyDead') return; // fall through everything
        if (element.type === Types.Coin) return;
        //so this goombas fall from the map when dead from bullet
        const direction = collisionCheck(this, element);

        if (direction === 'l' || direction === 'r') this.velX *= -1;
        else if (direction === 't') this.velY *= -1;
        else if (direction === 'b') this.grounded = true;
    }

    meetMario(mario) {
        // If mario is invulnerable or goomba is dead, collision doesn't occur
        if (mario.invulnerable || this.isDead) return null;

        const collision = collisionCheck(this, mario);
        switch (collision) {
            case 't':
                //kill goombas if collision is from top
                this.state = 'dead';
                mario.velY = -mario.speed;
                this.tickCounter = 0;
                return 'kill';
            case 'r':
            case 'l':
            case 'b':
                this.velX *= -1;
                try {
                    mario.reduce();
                    return 'reduce';
                } catch {
                    // throws if Mario dies
                    return 'die';
                }
            default:
                return null;
        }
    }
}
