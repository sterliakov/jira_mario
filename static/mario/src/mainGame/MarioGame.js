import GameUI from '../GameUI';
import Element from './Element';
import Enemy from './Enemy';
import GameSound from './GameSound';
import Mario from './Mario';
import PowerUp from './PowerUp';

// Main Class of Mario Game

export default class MarioGame {
    maxWidth = 0; //width of the game world
    tileSize = 32;

    keys = [];
    goombas = [];
    powerUps = [];
    bullets = [];

    tickCounter = 0; //for animating mario
    maxTick = 25; //max number for ticks to show mario sprite
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
            this.mario.init();
        } else {
            this.mario.x = 10;
            this.mario.frame = 0;
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
        // const canvas = this.board.canvas.current; //for use with touch events

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
                    const enemy = new Enemy(this.board.canvas);
                    enemy.x = column * this.tileSize;
                    enemy.y = row * this.tileSize;
                    enemy.goomba();
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

    collisionCheck(objA, objB) {
        // get the vectors to check against
        const vX = objA.x + objA.width / 2 - (objB.x + objB.width / 2);
        const vY = objA.y + objA.height / 2 - (objB.y + objB.height / 2);

        // add the half widths and half heights of the objects
        const hWidths = objA.width / 2 + objB.width / 2;
        const hHeights = objA.height / 2 + objB.height / 2;

        // if the x and y vector are less than the half width or half height, then we must be inside the object, causing a collision
        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            // figures out on which side we are colliding (top, bottom, left, or right)
            var offsetX = hWidths - Math.abs(vX);
            var offsetY = hHeights - Math.abs(vY);

            if (offsetX >= offsetY) {
                if (vY > 0 && vY < 37) {
                    if (objB.type !== 5) {
                        //if flagpole then pass through it
                        objA.y += offsetY;
                    }
                    return 't';
                } else if (vY < 0) {
                    if (objB.type !== 5) {
                        //if flagpole then pass through it
                        objA.y -= offsetY;
                    }
                    return 'b';
                }
            } else {
                if (vX > 0) {
                    objA.x += offsetX;
                    return 'l';
                } else {
                    objA.x -= offsetX;
                    return 'r';
                }
            }
        }
        return null;
    }

    checkElementMarioCollision(element, row, column) {
        const collisionDirection = this.collisionCheck(this.mario, element);

        switch (collisionDirection) {
            case 'l':
            case 'r': {
                this.mario.velX = 0;
                this.mario.jumping = false;

                if (element.type === 5) {
                    //flag pole
                    this.levelFinish(collisionDirection);
                }
                break;
            }
            case 'b': {
                if (element.type !== 5) {
                    //only if not flag pole
                    this.mario.grounded = true;
                    this.mario.jumping = false;
                }
                break;
            }
            case 't': {
                if (element.type !== 5) {
                    this.mario.velY *= -1;
                }

                switch (element.type) {
                    case 3: {
                        //PowerUp Box
                        const powerUp = new PowerUp(this.board.canvas);

                        //gives mushroom if this.mario is small, otherwise gives flower
                        if (this.mario.type === 'small') {
                            powerUp.mushroom(element.x, element.y);
                            this.powerUps.push(powerUp);
                        } else {
                            powerUp.flower(element.x, element.y);
                            this.powerUps.push(powerUp);
                        }

                        this.map[row][column] = 4; //sets to useless box after powerUp appears

                        //sound when mushroom appears
                        this.gameSound.play('powerUpAppear');
                        break;
                    }

                    case 11: {
                        //Flower Box
                        const powerUp = new PowerUp(this.board.canvas);
                        powerUp.flower(element.x, element.y);
                        this.powerUps.push(powerUp);

                        this.map[row][column] = 4; //sets to useless box after powerUp appears

                        //sound when flower appears
                        this.gameSound.play('powerUpAppear');
                        break;
                    }

                    case 2: {
                        //Coin Box
                        this.board.setState({
                            coinScore: this.board.state.coinScore + 1,
                            totalScore: this.board.state.totalScore + 100,
                        });
                        this.board.updateCoinScore();
                        this.map[row][column] = 4; //sets to useless box after coin appears
                        //sound when coin block is hit
                        this.gameSound.play('coin');
                        break;
                    }

                    default: {
                    }
                }
                break;
            }

            default: {
            }
        }
    }

    checkElementPowerUpCollision(element) {
        for (const powerUp of this.powerUps) {
            const collisionDirection = this.collisionCheck(powerUp, element);

            if (collisionDirection === 'l' || collisionDirection === 'r') {
                powerUp.velX *= -1; //change direction if collision with any element from the sidr
            } else if (collisionDirection === 'b') {
                powerUp.grounded = true;
            }
        }
    }

    checkElementEnemyCollision(element) {
        for (const goomba of this.goombas) {
            if (goomba.state !== 'deadFromBullet') {
                //so this goombas fall from the this.map when dead from bullet
                const collisionDirection = this.collisionCheck(goomba, element);

                if (collisionDirection === 'l' || collisionDirection === 'r') {
                    goomba.velX *= -1;
                } else if (collisionDirection === 'b') {
                    goomba.grounded = true;
                }
            }
        }
    }

    checkElementBulletCollision(element) {
        for (const [i, bullet] of this.bullets.entries()) {
            const collisionDirection = this.collisionCheck(bullet, element);

            if (collisionDirection === 'b') {
                //if collision is from bottom of the bullet, it is grounded, so this it can be bounced
                bullet.grounded = true;
            } else if (
                collisionDirection === 't' ||
                collisionDirection === 'l' ||
                collisionDirection === 'r'
            ) {
                this.bullets.splice(i, 1);
            }
        }
    }

    checkPowerUpMarioCollision() {
        for (const [i, powerUp] of this.powerUps.entries()) {
            const collWithMario = this.collisionCheck(powerUp, this.mario);
            if (collWithMario) {
                if (powerUp.type === 30 && this.mario.type === 'small') {
                    //mushroom
                    this.mario.type = 'big';
                } else if (powerUp.type === 31) {
                    //flower
                    this.mario.type = 'fire';
                }
                this.powerUps.splice(i, 1);

                this.board.setState({
                    totalScore: this.board.state.totalScore + 1000,
                });

                //sound when mushroom appears
                this.gameSound.play('powerUp');
                break; // No multiple collisions possible
            }
        }
    }

    checkEnemyMarioCollision() {
        for (const goomba of this.goombas) {
            if (
                this.mario.invulnerable ||
                goomba.state === 'dead' ||
                goomba.state === 'deadFromBullet'
            )
                continue;
            //if this.mario is invulnerable or goombas state is dead, collision doesnt occur

            const collWithMario = this.collisionCheck(goomba, this.mario);

            if (collWithMario === 't') {
                //kill goombas if collision is from top
                goomba.state = 'dead';

                this.mario.velY = -this.mario.speed;

                this.board.setState({
                    totalScore: this.board.state.totalScore + 1000,
                });

                //sound when enemy dies
                this.gameSound.play('killEnemy');
            } else if (
                collWithMario === 'r' ||
                collWithMario === 'l' ||
                collWithMario === 'b'
            ) {
                goomba.velX *= -1;

                if (this.mario.type === 'small') {
                    // kill mario if collision occurs when he is small
                    this.die();
                    break;
                } else {
                    if (this.mario.type === 'big') {
                        this.mario.type = 'small';
                    } else if (this.mario.type === 'fire') {
                        this.mario.type = 'big';
                    }
                    this.mario.invulnerable = true;

                    // sound when mario powerDowns
                    this.gameSound.play('powerDown');

                    setTimeout(() => {
                        this.mario.invulnerable = false;
                    }, 1000);
                }
            }
        }
    }

    checkBulletEnemyCollision() {
        for (const goomba of this.goombas) {
            for (const [j, bullet] of this.bullets.entries()) {
                if (goomba && goomba.state !== 'dead') {
                    //check for collision only if goombas exist and is not dead
                    const collWithBullet = this.collisionCheck(goomba, bullet);

                    if (collWithBullet) {
                        this.bullets.splice(j, 1);

                        goomba.state = 'deadFromBullet';

                        this.board.setState({
                            totalScore: this.board.state.totalScore + 1000,
                        });
                        this.gameSound.play('killEnemy');

                        // FIXME: may be multiple collisions
                        break;
                    }
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
            if (this.board.state.lifeCount === 0) {
                this.gameOver();
            } else {
                this.resetGame();
            }
        }, 3000);
    }

    // controlling mario with key events
    updateMario() {
        this.mario.checkMarioType();

        if (this.keys[38] || this.keys[32]) {
            //up arrow
            if (this.mario.jump()) {
                this.gameSound.play('jump');
            }
        }

        if (this.keys[39]) {
            // right arrow
            this.checkMarioPos(); // if mario goes to the center of the screen, sidescroll the map

            if (this.mario.velX < this.mario.speed) {
                this.mario.velX++;
            }

            // mario sprite position
            if (!this.mario.jumping) {
                this.tickCounter++;

                if (this.tickCounter > this.maxTick / this.mario.speed) {
                    this.tickCounter = 0;
                    this.mario.frame = this.mario.frame !== 1 ? 1 : 0;
                }
            }
        }

        if (this.keys[37]) {
            // left arrow
            if (this.mario.velX > -this.mario.speed) {
                this.mario.velX--;
            }

            // mario sprite position
            if (!this.mario.jumping) {
                this.tickCounter++;

                if (this.tickCounter > this.maxTick / this.mario.speed) {
                    this.tickCounter = 0;
                    this.mario.frame = this.mario.frame !== 9 ? 9 : 8;
                }
            }
        }

        this.mario.setSpeed(this.keys[16]); // Shift

        if (this.keys[17]) {
            const bullet = this.mario.shoot();
            if (bullet) {
                // Ctrl
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
        //side scrolling as this.mario reaches center of the viewPort
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
        if (collisionDirection === 'r') {
            this.mario.x += 10;
            this.mario.velY = 2;
            this.mario.frame = 11;
        } else if (collisionDirection === 'l') {
            this.mario.x -= 32;
            this.mario.velY = 2;
            this.mario.frame = 10;
        }

        if (this.marioInGround) {
            this.mario.x += 20;
            this.mario.frame = 10;
            this.tickCounter += 1;
            if (this.tickCounter > this.maxTick) {
                this.pauseGame();

                this.mario.x += 10;
                this.tickCounter = 0;
                this.mario.frame = 12;

                //sound when stage clears
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
    }

    clearTimeOut() {
        clearTimeout(this.timeOutId);
    }
}
