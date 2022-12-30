import GameUI from '../GameUI';
import {collisionCheck} from '../helpers';
import PowerUp from './PowerUp';

export default class Element {
    sY = 0;
    width = 32;
    height = 32;

    constructor(canvas, type, x, y) {
        this.gameUI = new GameUI(canvas);

        this.element = new Image();
        this.element.src = './images/elements.png';

        if (type) this.fromType(type);
        if (typeof x !== 'undefined' && typeof y !== 'undefined')
            [this.x, this.y] = [x, y];
    }

    fromType(type) {
        this.type = type;
        this.sX = (type - 1) * this.width;
    }

    draw() {
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
                        const powerUp = new PowerUp(this.gameUI._canvasRef);
                        //gives mushroom if mario is small, otherwise gives flower
                        if (mario.type === 'small' && this.type === 3)
                            powerUp.mushroom(this.x, this.y);
                        else powerUp.flower(this.x, this.y);
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
