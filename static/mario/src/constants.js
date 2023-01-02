import backBtn from './static/images/back-btn.png';
import bg from './static/images/bg.png';
import bullet from './static/images/bullet.png';
import coin from './static/images/coin.png';
import elements from './static/images/elements.png';
import enemies from './static/images/enemies.png';
import flagPole from './static/images/flag-pole.png';
import flag from './static/images/flag.png';
import marioHead from './static/images/mario-head.png';
import marioSprites from './static/images/mario-sprites.png';
import powerUps from './static/images/powerups.png';
import redraw from './static/images/redraw.png';
import startBtn from './static/images/start-btn.png';
import startScreen from './static/images/start-screen.png';
import bulletSound from './static/sounds/bullet.wav';
import coinSound from './static/sounds/coin.wav';
import jumpSound from './static/sounds/jump.wav';
import killEnemySound from './static/sounds/kill-enemy.wav';
import marioDieSound from './static/sounds/mario-die.wav';
import powerDownSound from './static/sounds/power-down.wav';
import powerUpAppearSound from './static/sounds/power-up-appear.wav';
import powerUpSound from './static/sounds/power-up.wav';
import stageClearSound from './static/sounds/stage-clear.wav';

export const GRAVITY = 0.2;
export const FRICTION = 0.9;

const imageSources = {
    './static/images/back-btn.png': backBtn,
    './static/images/bg.png': bg,
    './static/images/bullet.png': bullet,
    './static/images/coin.png': coin,
    './static/images/elements.png': elements,
    './static/images/enemies.png': enemies,
    './static/images/flag-pole.png': flagPole,
    './static/images/flag.png': flag,
    './static/images/start-screen.png': startScreen,
    './static/images/mario-head.png': marioHead,
    './static/images/mario-sprites.png': marioSprites,
    './static/images/powerups.png': powerUps,
    './static/images/redraw.png': redraw,
    './static/images/start-btn.png': startBtn,
};

export const Images = {};
for (const [src, data] of Object.entries(imageSources)) {
    const im = new Image();
    im.src = data;
    Images[src.split('/').at(-1)] = im;
}

export class Types {
    // FIXME: clean repeats
    static Blank = 0;
    static Ground = 1;
    static Platform = 1;
    static PlatformBackground = 1;
    static NormalBrick = 1;
    static CoinBox = 2;
    static Coin = 2;
    static PowerUpBox = 3; // flower or mushroom depending on hero state
    static UselessBox = 4;
    static FlagPole = 5;
    static Flag = 6;
    static PipeLeft = 7;
    static PipeRight = 8;
    static Pipe = 9;
    static PipeTopLeft = 9;
    static PipeTopRight = 10;
    static PipeFlower = 10;
    static FlowerBox = 11;
    static Enemy = 20;
    static Goomba = 20;
    static GreenKoopa = 20;
    static RedKoopa = 20;
    static Spiky = 20;
    static Mushroom = 30;
    static Flower = 31;
    static Bullet = 40;
    static BulletBill = 50; // FIXME: not used at all

    static isElement(type) {
        return 1 <= type && type <= 11;
    }

    static isEnemy(type) {
        return type === Types.Enemy;
    }

    static AllEnemies = [
        Types.Goomba,
        Types.GreenKoopa,
        Types.RedKoopa,
        Types.Spiky,
    ];
}

export const Sounds = {
    coin: new Audio(coinSound),
    powerUpAppear: new Audio(powerUpAppearSound),
    powerUp: new Audio(powerUpSound),
    marioDie: new Audio(marioDieSound),
    killEnemy: new Audio(killEnemySound),
    stageClear: new Audio(stageClearSound),
    bullet: new Audio(bulletSound),
    powerDown: new Audio(powerDownSound),
    jump: new Audio(jumpSound),
};
for (const audio of Object.values(Sounds)) audio.load();
