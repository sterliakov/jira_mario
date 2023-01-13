import {Types} from '../constants';
import {collisionCheck} from '../helpers';
import Drawable from './Drawable';

const MARIO_BULLET_HEIGHT = 10;
const MARIO_BULLET_WIDTH = 10;
const ENEMY_BULLET_HEIGHT = 6;
const ENEMY_BULLET_WIDTH = 6;

export default class Bullet extends Drawable {
    get IMAGE_SRC() {
        return 'bullet.png';
    }
    maxTick = 10;
    scale = 1.75;

    constructor(type, x, y, direction) {
        super(type, x, y);
        this.x = x + this.width;
        this.y = y + (45 - this.height) / 2;
        this.velX = 8 * direction; //changing the direction of the bullet if mario faces another side
        this.velY = 0;
        this.sX = 0;
        this.tickCounter = 0;
        this.frame = 0;
    }

    fromType(type) {
        this.type = type;
        if (type === Types.MarioBullet) {
            this.width = MARIO_BULLET_WIDTH;
            this.height = MARIO_BULLET_HEIGHT;
            this.sY = 0;
        } else {
            this.width = ENEMY_BULLET_WIDTH;
            this.height = ENEMY_BULLET_HEIGHT;
            this.sY = MARIO_BULLET_HEIGHT;
        }
    }

    update() {
        if (this.tickCounter++ >= this.maxTick) {
            this.tickCounter = 0;
            this.frame = (this.frame + 1) % 4;
        }
        this.move();
    }

    setSXBeforeDraw() {
        this.sX = this.frame * this.width;
    }

    /**
     *  @returns boolean: whether the bullet should be destroyed
     */
    meetElement(element) {
        if (element.type === Types.Coin) return false;

        switch (collisionCheck(this, element)) {
            // bounce
            case 'b':
                this.velY = -4;
                return false;
            case 't':
            case 'l':
            case 'r':
                return true;
            default:
                return false;
        }
    }

    meetEnemy(enemy) {
        // Check for collision only if goombas exist and is not dead
        if (enemy.isDead || this.type === Types.EnemyBullet) return false;
        if (collisionCheck(enemy, this)) {
            enemy.state = 'deadFromBullet';
            return true;
        }
        return false;
    }

    meetMario(mario) {
        // Check for collision only if goombas exist and is not dead
        if (
            this.type === Types.EnemyBullet
            && !mario.invulnerable
            && collisionCheck(mario, this)
        )
            try {
                mario.reduce();
                return 'reduce';
            } catch {
                return 'die';
            }

        return null;
    }
}
