import GameUI from '../GameUI';
import Element from './Element';
import Enemy from './Enemy';
import GameSound from './GameSound';
import Mario from './Mario';

// Main Class of Mario Game

export default class MarioGame {
    maxWidth = 0; //width of the game world
    tileSize = 32;

    keys = [];
    goombas = [];
    powerUps = [];
    bullets = [];

    instructionTick = 0; //showing instructions counter

    constructor(board) {
        this.gameUI = new GameUI(board.canvas);
        this.board = board;
        this.height = parseInt(board.props.Height, 10);
        this.viewPort = parseInt(board.props.Width, 10); //width of canvas, viewPort this can be seen
    }

    init(levelMaps, level) {
        this.currentLevel = level;
        this.originalMaps = levelMaps;
        this.map = JSON.parse(levelMaps[this.currentLevel]);

        this.translatedDist = 0; //distance translated(side scrolled) as mario moves to the right
        this.board.setState({levelNum: this.currentLevel});

        if (!this.mario) {
            //so this when level changes, it uses the same instance
            this.mario = new Mario(this.board.canvas);
        } else {
            // this.mario.resetPos();
            this.mario.x = 10;
            this.mario.frame = 0;
            this.mario.tickCounter = 0; //for animating mario
        }
        this.gameSound = new GameSound();

        this.maxWidth =
            this.tileSize *
            this.map.reduce((acc, row) => Math.max(acc, row.length), 0);
        this.bindKeyPress();
        this.gameUI.reset();
        this.startGame();
    }

    bindKeyPress() {
        //key binding
        document.body.addEventListener(
            'keydown',
            (e) => (this.keys[e.keyCode] = true),
        );
        document.body.addEventListener(
            'keyup',
            (e) => (this.keys[e.keyCode] = false),
        );
    }

    //key binding for touch events
    onTouchstart = (e) => {
        const touches = e.changedTouches;
        e.preventDefault();

        for (const touch of touches) {
            if (touch.pageX <= 200) {
                this.keys[37] = true; //left arrow
            } else if (touch.pageX > 200 && touch.pageX < 400) {
                this.keys[39] = true; //right arrow
            } else if (touch.pageX > 640 && touch.pageX <= 1080) {
                //in touch events, same area acts as sprint and bullet key
                this.keys[16] = true; //shift key
                this.keys[17] = true; //ctrl key
            } else if (touch.pageX > 1080 && touch.pageX < 1280) {
                this.keys[32] = true; //space
            }
        }
    };

    onTouchend = (e) => {
        const touches = e.changedTouches;
        e.preventDefault();

        for (const touch of touches) {
            if (touch.pageX <= 200) {
                this.keys[37] = false;
            } else if (touch.pageX > 200 && touch.pageX <= 640) {
                this.keys[39] = false;
            } else if (touch.pageX > 640 && touch.pageX <= 1080) {
                this.keys[16] = false;
                this.keys[17] = false;
            } else if (touch.pageX > 1080 && touch.pageX < 1280) {
                this.keys[32] = false;
            }
        }
    };

    onTouchmove = (e) => {
        const touches = e.changedTouches;
        e.preventDefault();

        for (const touch of touches) {
            if (touch.pageX <= 200) {
                this.keys[37] = true;
                this.keys[39] = false;
            } else if (touch.pageX > 200 && touch.pageX < 400) {
                this.keys[39] = true;
                this.keys[37] = false;
            } else if (touch.pageX > 640 && touch.pageX <= 1080) {
                this.keys[16] = true;
                this.keys[32] = false;
            } else if (touch.pageX > 1080 && touch.pageX < 1280) {
                this.keys[32] = true;
                this.keys[16] = false;
                this.keys[17] = false;
            }
        }
    };

    //Main Game Loop
    startGame() {
        this.animationID = window.requestAnimationFrame(
            this.startGame.bind(this),
        );

        this.gameUI.clear(0, 0, this.maxWidth, this.height);

        if (this.instructionTick < 1000) {
            this.showInstructions(); //showing control instructions
            this.instructionTick++;
        }

        this.renderMap();

        for (const powerUp of this.powerUps) {
            powerUp.draw();
            powerUp.update();
        }
        for (const bullet of this.bullets) {
            bullet.draw();
            bullet.update();
        }
        for (const goomba of this.goombas) {
            goomba.draw();
            goomba.update();
        }

        this.checkPowerUpMarioCollision();
        this.checkBulletEnemyCollision();
        this.checkEnemyMarioCollision();

        this.mario.draw();
        this.updateMario();
        this.wallCollision();
        this.marioInGround = this.mario.grounded; //for use with flag sliding
    }

    showInstructions() {
        this.gameUI.writeText(
            'Controls: Arrow this.keys for direction, shift to run, ctrl for bullets',
            30,
            30,
        );
        this.gameUI.writeText(
            'Tip: Jumping while running makes you jump higher',
            30,
            60,
        );
    }

    renderMap() {
        //setting false each time the this.map renders so this elements fall off a platform and not hover around
        this.mario.grounded = false;
        for (const powerUp of this.powerUps) powerUp.grounded = false;
        for (const goomba of this.goombas) goomba.grounded = false;

        for (let row = 0; row < this.map.length; row++) {
            for (let column = 0; column < this.map[row].length; column++) {
                const type = this.map[row][column];
                if (type === 20) {
                    //goomba
                    const enemy = new Enemy(
                        this.board.canvas,
                        type,
                        column * this.tileSize,
                        row * this.tileSize,
                    );
                    enemy.draw();

                    this.goombas.push(enemy);
                    this.map[row][column] = 0;
                } else if (type !== 0 && type <= 10) {
                    const element = new Element(
                        this.board.canvas,
                        type,
                        column * this.tileSize,
                        row * this.tileSize,
                    );
                    element.draw();
                    if (type !== 6) {
                        this.checkElementMarioCollision(element, row, column);
                        if (type !== 5) {
                            this.checkElementPowerUpCollision(element);
                            this.checkElementEnemyCollision(element);
                            this.checkElementBulletCollision(element);
                        }
                    }
                }
            }
        }
    }

    checkElementMarioCollision(element, row, column) {
        const {action, args} = element.meetMario(this.mario) ?? {};

        switch (action) {
            case 'levelFinish':
                this.levelFinish(args[0]);
                break;
            case 'powerUp':
                this.powerUps.push(args[0]);
                this.map[row][column] = 4; //sets to useless box after powerUp appears
                this.gameSound.play('powerUpAppear');
                break;
            case 'coinBox': {
                this.board.setState({
                    coinScore: this.board.state.coinScore + 1,
                    totalScore: this.board.state.totalScore + 100,
                });
                this.board.updateCoinScore();
                this.map[row][column] = 4; //sets to useless box after coin appears
                this.gameSound.play('coin');
                break;
            }

            default: {
            }
        }
    }

    checkElementPowerUpCollision(element) {
        for (const powerUp of this.powerUps) powerUp.meetElement(element);
    }

    checkElementEnemyCollision(element) {
        for (const goomba of this.goombas) goomba.meetElement(element);
    }

    checkElementBulletCollision(element) {
        for (const [i, bullet] of this.bullets.entries())
            if (bullet.meetElement(element)) this.bullets.splice(i, 1);
    }

    checkPowerUpMarioCollision() {
        for (const [i, powerUp] of this.powerUps.entries()) {
            if (powerUp.meetMario(this.mario)) {
                this.powerUps.splice(i, 1);

                this.board.setState({
                    totalScore: this.board.state.totalScore + 1000,
                });
                this.gameSound.play('powerUp');
                break; // No multiple collisions possible
            }
        }
    }

    checkEnemyMarioCollision() {
        for (const goomba of this.goombas) {
            switch (goomba.meetMario(this.mario)) {
                case 'kill':
                    this.board.setState({
                        totalScore: this.board.state.totalScore + 1000,
                    });
                    this.gameSound.play('killEnemy');
                    return;
                case 'die':
                    this.die();
                    return;
                case 'reduce':
                    this.gameSound.play('powerDown');
                    return;
                default: {
                }
            }
        }
    }

    checkBulletEnemyCollision() {
        for (const goomba of this.goombas) {
            for (const [j, bullet] of this.bullets.entries()) {
                if (goomba && goomba.meetBullet(bullet)) {
                    this.bullets.splice(j, 1);
                    this.board.setState({
                        totalScore: this.board.state.totalScore + 1000,
                    });
                    this.gameSound.play('killEnemy');

                    // FIXME: may be multiple collisions
                    return;
                }
            }
        }
    }

    wallCollision() {
        //for ground (viewport ground)
        if (this.mario.y >= this.height) this.die();

        //for walls (viewport walls)
        this.mario.x = Math.min(
            this.maxWidth - this.mario.width,
            Math.max(this.mario.x, this.translatedDist + 1),
        );
    }

    die() {
        this.pauseGame();
        this.mario.frame = 13;

        this.gameSound.play('marioDie');
        this.board.setState({
            lifeCount: this.board.state.lifeCount - 1,
        });

        this.timeOutId = setTimeout(() => {
            if (this.board.state.lifeCount === 0) this.gameOver();
            else this.resetGame();
        }, 3000);
    }

    // controlling mario with key events
    updateMario() {
        this.mario.checkMarioType();

        //up arrow
        if ((this.keys[38] || this.keys[32]) && this.mario.jump())
            this.gameSound.play('jump');

        // right arrow
        if (this.keys[39]) {
            this.checkMarioPos(); // if mario goes to the center of the screen, sidescroll the map
            this.mario.onRight();
        }

        // left arrow
        if (this.keys[37]) this.mario.onLeft();

        this.mario.setSpeed(this.keys[16]); // Shift

        // Ctrl
        if (this.keys[17]) {
            const bullet = this.mario.shoot();
            if (bullet) {
                this.bullets.push(bullet);
                this.gameSound.play('bullet');
            }
        }

        this.mario.pickFrame();
        this.mario.move();
    }

    get centerPos() {
        return this.translatedDist + this.viewPort / 2;
    }

    checkMarioPos() {
        //side scrolling as mario reaches center of the viewPort
        if (
            this.mario.x > this.centerPos &&
            this.centerPos + this.viewPort / 2 < this.maxWidth
        ) {
            this.gameUI.scrollWindow(-this.mario.speed, 0);
            this.translatedDist += this.mario.speed;
        }
    }

    levelFinish(collisionDirection) {
        //game finishes when this.mario slides the flagPole and collides with the ground
        if (this.mario.finishLevel(collisionDirection, this.marioInGround)) {
            this.pauseGame();
            this.gameSound.play('stageClear');

            this.timeOutId = setTimeout(() => {
                this.currentLevel++;
                if (this.originalMaps[this.currentLevel]) {
                    this.init(this.originalMaps, this.currentLevel);
                    this.board.setState({levelNum: this.currentLevel});
                } else {
                    this.gameOver();
                }
            }, 5000);
        }
    }

    pauseGame() {
        window.cancelAnimationFrame(this.animationID);
    }

    gameOver() {
        // this.board.gameOverView();
        this.gameUI.makeBox(0, 0, this.maxWidth, this.height);
        this.gameUI.writeText(
            'Game Over',
            this.centerPos - 80,
            this.height - 300,
        );
        this.gameUI.writeText(
            'Thanks For Playing',
            this.centerPos - 122,
            this.height / 2,
        );
    }

    resetGame() {
        this.clearInstances();
        this.init(this.originalMaps, this.currentLevel);
    }

    clearInstances() {
        this.mario = null;
        this.gameSound = null;

        this.goombas = [];
        this.bullets = [];
        this.powerUps = [];
        this.keys = [];
    }

    clearTimeOut() {
        clearTimeout(this.timeOutId);
    }
}
