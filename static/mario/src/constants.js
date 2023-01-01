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
    './static/images/start-btn.png': startBtn,
};

export const Images = {};
for (const [src, data] of Object.entries(imageSources)) {
    const im = new Image();
    im.src = data;
    Images[src.split('/').at(-1)] = im;
}

export const Types = {
    Blank: 0,
    Platform: 1,
    CoinBox: 2,
    PowerUpBox: 3, // flower or mushroom depending on hero state
    UselessBox: 4,
    FlagPole: 5,
    Flag: 6,
    PipeLeft: 7,
    PipeRight: 8,
    PipeTopLeft: 9,
    PipeTopRight: 10,
    FlowerBox: 11,
    Enemy: 20,
    Mushroom: 30,
    Flower: 31,
    Bullet: 40,
};

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
for (const audio of Sounds.values()) audio.load();
