import GameUI from '../GameUI';

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

    constructor() {
        this.gameUI = GameUI.getInstance();
    }

    init() {
        this.x = 10;
        this.y = this.gameUI.getHeight() - 40 - 40;

        this.marioSprite = new Image();
        this.marioSprite.src = './images/mario-sprites.png';
        this.canvas = document.getElementsByClassName('game-screen')[0];
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
        this.x = this.canvas.width / 10;
        this.y = this.canvas.height - 40;
        this.frame = 0;
    }
}
