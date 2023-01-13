import React from 'react';
import styled from 'styled-components';

import {Images, Sounds, Types} from '../constants';
import {getGameState, getLevel, saveGameState, saveMario} from '../helpers';
import CanvasCapable, {initCanvas} from '../mainGame/CanvasCapable';
import Element from '../mainGame/Element';
import Enemy from '../mainGame/Enemy';
import Mario from '../mainGame/Mario';
import Score from './Score';

const Screen = styled.canvas`
    width: 1280px;
    height: 480px;
    border: 1px solid black;
    border-top: none;
    background-image: url('${Images['bg.png'].src}');
    background-size: auto 480px;
    background-repeat: repeat;
    margin: 0 auto;
`;

export default class GameView extends CanvasCapable {
    tileSize = 32;

    constructor(props) {
        const canvas = React.createRef();
        super(props);
        this._canvasRef = canvas;
        this.height = parseInt(props.Height, 10);
        this.viewPort = parseInt(props.Width, 10); // width of canvas, viewPort this can be seen
        this.state = {...props.game};
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

    async componentDidMount() {
        initCanvas(this._canvasRef);
        await this.init();
    }

    async updateState(newState) {
        this.setState(newState);
        return saveGameState(newState);
    }

    componentWillUnmount() {
        this.pauseGame();
    }

    addCoin() {
        if (this.state.coinScore === 99)
            this.updateState({
                coinScore: 0,
                lifeCount: this.state.lifeCount + 1,
                totalScore: this.state.totalScore + 100,
            });
        else
            this.updateState({
                coinScore: this.state.coinScore + 1,
                totalScore: this.state.totalScore + 100,
            });
    }

    async init() {
        this.goombas = [];
        this.bullets = [];
        this.powerUps = [];
        this.keys = [];

        this.map = await getLevel(this.state.levelNum);
        if (!this.map) {
            await this.gameOver();
            return;
        }

        this.translatedDist = 0; // distance translated(side scrolled) as mario moves to the right
        this.instructionTick = 0; // showing instructions counter
        // so that it uses the same instance when reloading
        this.mario ??= await new Mario(this.props.mario);
        this.mario.resetPos();

        this.maxWidth =
            this.tileSize *
            this.map.reduce((acc, row) => Math.max(acc, row.length), 0);
        this.bindKeyPress();
        this.reset();
        this.startGame();
    }

    bindKeyPress() {
        // key binding
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
        if (!this.state.soundEnabled) return;
        const sound = Sounds[name];
        sound.pause();
        sound.currentTime = 0;
        sound.play().catch((ex) => {});
    }

    touchesToKeys(touches, isStart) {
        for (const touch of touches)
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

        for (const touch of touches)
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

    //Main Game Loop
    startGame() {
        this.animationID = window.requestAnimationFrame(
            this.startGame.bind(this),
        );

        this.clear(0, 0, this.maxWidth, this.height);
        this.renderMap();

        for (const powerUp of this.powerUps) powerUp.draw();
        for (const goomba of this.goombas) {
            goomba.draw();
            let bullet = goomba.shoot();
            if (bullet) this.bullets.push(bullet);
        }
        for (const bullet of this.bullets) bullet.draw();

        this.checkPowerUpMarioCollision();
        this.checkBulletEnemyCollision();
        this.checkBulletMarioCollision();
        this.checkEnemyMarioCollision();

        this.mario.draw();
        this.updateMario();
        this.wallCollision();
        this.marioInGround = this.mario.grounded; //for use with flag sliding

        if (this.instructionTick++ < 1000) this.showInstructions();
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

    _renderEnemy(type, column, row) {
        const enemy = new Enemy(
            type,
            column * this.tileSize,
            row * this.tileSize,
        );
        enemy.draw();
        this.goombas.push(enemy);
        this.map[row][column] = Types.Blank;
    }

    _renderElement(type, column, row) {
        const element = new Element(
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

    renderMap() {
        //setting false each time the this.map renders so this elements fall off a platform and not hover around
        this.mario.grounded = false;
        for (const powerUp of this.powerUps) powerUp.grounded = false;
        for (const goomba of this.goombas) goomba.grounded = false;

        for (let row = 0; row < this.map.length; row++)
            for (let column = 0; column < this.map[row].length; column++) {
                const type = this.map[row][column];
                if (Types.isEnemy(type)) this._renderEnemy(type, column, row);
                else if (Types.isElement(type))
                    this._renderElement(type, column, row);
            }
    }

    checkElementMarioCollision(element, row, column) {
        const {action, args} = element.meetMario(this.mario) ?? {};

        switch (action) {
            case 'levelFinish':
                this.levelFinish(args[0]);
                return;
            case 'powerUp':
                this.powerUps.push(args[0]);
                this.map[row][column] = Types.UselessBox;
                this.playSound('powerUpAppear');
                return;
            case 'coinBox': {
                this.addCoin();
                this.map[row][column] = Types.UselessBox;
                this.playSound('coin');
                return;
            }
            case 'coin': {
                this.addCoin();
                this.map[row][column] = Types.Blank;
                this.playSound('coin');
                return;
            }
            case 'destroyBrick':
                this.updateState({
                    totalScore: this.state.totalScore + 50,
                });
                this.map[row][column] = Types.Blank;
                return;
            default:
                return;
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
        for (const [i, powerUp] of this.powerUps.entries())
            if (powerUp.meetMario(this.mario)) {
                this.powerUps.splice(i, 1);

                this.updateState({
                    totalScore: this.state.totalScore + 1000,
                });
                this.playSound('powerUp');
                break; // No multiple collisions possible
            }
    }

    checkEnemyMarioCollision() {
        for (const goomba of this.goombas)
            switch (goomba.meetMario(this.mario)) {
                case 'kill':
                    this.killEnemy();
                    break;
                case 'die':
                    this.die();
                    break;
                case 'reduce':
                    // Prevent cheating: reloading won't help restore fire/big mario
                    saveMario(this.mario);
                    this.playSound('powerDown');
                    break;
                default:
            }
    }

    checkBulletEnemyCollision() {
        for (const goomba of this.goombas)
            this.bullets = this.bullets.filter((bullet) => {
                if (!bullet.meetEnemy(goomba)) return true;
                this.killEnemy();
                return false;
            });
    }

    checkBulletMarioCollision() {
        this.bullets = this.bullets.filter((bullet) => {
            switch (bullet.meetMario(this.mario)) {
                case 'die':
                    this.die();
                    return false;
                case 'reduce':
                    saveMario(this.mario);
                    this.playSound('powerDown');
                    return false;
                default:
                    return true;
            }
        });
    }

    killEnemy() {
        this.updateState({
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
        this.updateState({
            lifeCount: this.state.lifeCount - 1,
        });

        this.timeOutId = setTimeout(() => {
            if (this.state.lifeCount === 0) {
                this.gameOver();
            } else {
                this.mario.resetToStart();
                this.init();
            }
        }, 3000);
    }

    // controlling mario with key events
    updateMario() {
        this.mario.checkType();

        // up arrow
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
        // side scrolling as mario reaches center of the viewPort
        if (
            this.mario.x > this.centerPos &&
            this.centerPos + this.viewPort / 2 < this.maxWidth
        ) {
            this.scrollWindow(-this.mario.speed, 0);
            this.translatedDist += this.mario.speed;
        }
    }

    levelFinish(collisionDirection) {
        // game finishes when mario slides the flagPole and collides with the ground
        if (!this.mario.finishLevel(collisionDirection, this.marioInGround))
            return;
        saveMario(this.mario);
        saveGameState({levelNum: this.state.levelNum + 1}, true);
        this.pauseGame();
        this.playSound('stageClear');
        this.timeOutId = setTimeout(() => this.props.quitAction(true), 5000);
    }

    pauseGame() {
        window.cancelAnimationFrame(this.animationID);
        clearTimeout(this.timeOutId);
    }

    async gameOver() {
        this.setState(await getGameState());
        this.clear(0, 0, this.maxWidth, this.height);
        this.writeText(
            'Game Over',
            this.centerPos - 120,
            this.height - 200,
            48,
        );
    }
}
