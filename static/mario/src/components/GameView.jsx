import React, {Component} from 'react';
import styled from 'styled-components';

import {Images, Sounds, Types} from '../constants';
import CanvasCapable from '../mainGame/CanvasCapable';
import Element from '../mainGame/Element';
import Enemy from '../mainGame/Enemy';
import MapLoader from '../mainGame/MapLoader';
import Mario from '../mainGame/Mario';
import Score from './Score';

const Screen = styled.canvas`
    width: 1280px;
    height: 480px;
    border: 1px solid black;
    border-top: none;
    background: url('${Images['bg.png'].src}');
    margin: 0 auto;
`;

export default class GameView extends CanvasCapable(Component) {
    tileSize = 32;

    constructor(props) {
        const canvas = React.createRef();
        super(canvas, props);
        this.height = parseInt(this.props.Height, 10);
        this.viewPort = parseInt(this.props.Width, 10); //width of canvas, viewPort this can be seen
        this.state = {
            coinScore: 0,
            totalScore: 0,
            lifeCount: 5,
            levelNum: 1,
        };
        this.mapLoader = new MapLoader();
    }

    render() {
        return (
            <>
                <Score
                    coinScore={this.state.coinScore}
                    totalScore={this.state.totalScore}
                    lifeCount={this.state.lifeCount}
                    levelNum={this.state.levelNum}
                />
                <Screen
                    className="game-screen"
                    ref={this._canvasRef}
                    width={this.props.Width}
                    height={this.props.Height}
                    onTouchstart={this.onTouchstart.bind(this)}
                    onTouchend={this.onTouchend.bind(this)}
                    onTouchmove={this.onTouchmove.bind(this)}
                ></Screen>
            </>
        );
    }

    componentDidMount() {
        this.setState({view: 'game'});
        this.init(1);
    }

    componentWillUnmount() {
        this.pauseGame();
    }

    updateCoinScore() {
        if (this.state.coinScore === 100) {
            this.setState({
                coinScore: 0,
                lifeCount: this.state.lifeCount + 1,
            });
        }
    }

    init(level) {
        this.goombas = [];
        this.bullets = [];
        this.powerUps = [];
        this.keys = [];

        this.map = this.mapLoader.get(level);

        this.translatedDist = 0; //distance translated(side scrolled) as mario moves to the right
        this.setState({levelNum: level});

        this.instructionTick = 0; //showing instructions counter
        //so this when level changes, it uses the same instance
        if (!this.mario) this.mario = new Mario(this._canvasRef);
        else this.mario.resetPos();

        this.maxWidth =
            this.tileSize *
            this.map.reduce((acc, row) => Math.max(acc, row.length), 0);
        this.bindKeyPress();
        this.reset();
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

    playSound(name) {
        const sound = Sounds[name];
        sound.pause();
        sound.currentTime = 0;
        sound.play().catch((ex) => {});
    }

    touchesToKeys(touches, isStart) {
        for (const touch of touches) {
            if (touch.pageX <= 200) {
                this.keys[37] = isStart; //left arrow
            } else if (touch.pageX > 200 && touch.pageX < 400) {
                this.keys[39] = isStart; //right arrow
            } else if (touch.pageX > 640 && touch.pageX <= 1080) {
                //in touch events, same area acts as sprint and bullet key
                this.keys[16] = isStart; //shift key
                this.keys[17] = isStart; //ctrl key
            } else if (touch.pageX > 1080 && touch.pageX < 1280) {
                this.keys[32] = isStart; //space
            }
        }
    }
    //key binding for touch events
    onTouchstart(e) {
        this.touchesToKeys(e.changedTouches, true);
        e.preventDefault();
    }

    onTouchend(e) {
        this.touchesToKeys(e.changedTouches, false);
        e.preventDefault();
    }

    onTouchmove(e) {
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
    }

    //Main Game Loop
    startGame() {
        this.animationID = window.requestAnimationFrame(
            this.startGame.bind(this),
        );

        this.clear(0, 0, this.maxWidth, this.height);
        this.renderMap();

        for (const powerUp of this.powerUps) powerUp.draw();
        for (const bullet of this.bullets) bullet.draw();
        for (const goomba of this.goombas) goomba.draw();

        this.checkPowerUpMarioCollision();
        this.checkBulletEnemyCollision();
        this.checkEnemyMarioCollision();

        this.mario.draw();
        this.updateMario();
        this.wallCollision();
        this.marioInGround = this.mario.grounded; //for use with flag sliding

        if (this.instructionTick < 1000) {
            this.showInstructions(); //showing control instructions
            this.instructionTick++;
        }
    }

    showInstructions() {
        this.writeText(
            'Controls: Arrow this.keys for direction, shift to run, ctrl for bullets',
            30,
            30,
        );
        this.writeText(
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
                if (Types.isEnemy(type)) {
                    //goomba
                    const enemy = new Enemy(
                        this._canvasRef,
                        type,
                        column * this.tileSize,
                        row * this.tileSize,
                    );
                    enemy.draw();

                    this.goombas.push(enemy);
                    this.map[row][column] = 0;
                } else if (Types.isElement(type)) {
                    const element = new Element(
                        this._canvasRef,
                        type,
                        column * this.tileSize,
                        row * this.tileSize,
                    );
                    element.draw();
                    if (type !== Types.Flag) {
                        this.checkElementMarioCollision(element, row, column);
                        if (type !== Types.FlagPole) {
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
                this.playSound('powerUpAppear');
                break;
            case 'coinBox': {
                this.setState({
                    coinScore: this.state.coinScore + 1,
                    totalScore: this.state.totalScore + 100,
                });
                this.updateCoinScore();
                this.map[row][column] = 4; //sets to useless box after coin appears
                this.playSound('coin');
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
        this.bullets = this.bullets.filter(
            (bullet, i) => !bullet.meetElement(element),
        );
    }

    checkPowerUpMarioCollision() {
        for (const [i, powerUp] of this.powerUps.entries()) {
            if (powerUp.meetMario(this.mario)) {
                this.powerUps.splice(i, 1);

                this.setState({
                    totalScore: this.state.totalScore + 1000,
                });
                this.playSound('powerUp');
                break; // No multiple collisions possible
            }
        }
    }

    checkEnemyMarioCollision() {
        for (const goomba of this.goombas) {
            switch (goomba.meetMario(this.mario)) {
                case 'kill':
                    this.killEnemy();
                    return;
                case 'die':
                    this.die();
                    return;
                case 'reduce':
                    this.playSound('powerDown');
                    return;
                default: {
                }
            }
        }
    }

    checkBulletEnemyCollision() {
        for (const goomba of this.goombas) {
            this.bullets = this.bullets.filter((bullet, j) => {
                if (!goomba.meetBullet(bullet)) return true;
                this.killEnemy();
                return false;
            });
        }
    }

    killEnemy() {
        this.setState({
            totalScore: this.state.totalScore + 1000,
        });
        this.playSound('killEnemy');
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
        this.mario.frame = 'dead';

        this.playSound('marioDie');
        this.setState({
            lifeCount: this.state.lifeCount - 1,
        });

        this.timeOutId = setTimeout(() => {
            if (this.state.lifeCount === 0) this.gameOver();
            else this.resetGame();
        }, 3000);
    }

    // controlling mario with key events
    updateMario() {
        this.mario.checkType();

        //up arrow
        if ((this.keys[38] || this.keys[32]) && this.mario.jump())
            this.playSound('jump');

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
                this.playSound('bullet');
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
            this.scrollWindow(-this.mario.speed, 0);
            this.translatedDist += this.mario.speed;
        }
    }

    levelFinish(collisionDirection) {
        //game finishes when mario slides the flagPole and collides with the ground
        if (!this.mario.finishLevel(collisionDirection, this.marioInGround))
            return;

        this.pauseGame();
        this.playSound('stageClear');
        this.timeOutId = setTimeout(() => {
            if (this.mapLoader.has(this.state.levelNum + 1))
                this.init(this.state.levelNum + 1);
            else this.gameOver();
        }, 5000);
    }

    pauseGame() {
        window.cancelAnimationFrame(this.animationID);
    }

    gameOver() {
        this.makeBox(0, 0, this.maxWidth, this.height);
        this.writeText('Game Over', this.centerPos - 80, this.height - 300);
        this.writeText(
            'Thanks For Playing',
            this.centerPos - 122,
            this.height / 2,
        );
    }

    resetGame() {
        this.mario = null;
        this.init(this.state.levelNum);
    }

    clearTimeOut() {
        clearTimeout(this.timeOutId);
    }
}
