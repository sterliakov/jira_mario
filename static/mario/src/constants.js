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
import Types from './types';

export const GRAVITY = 0.2;
export const FRICTION = 0.9;
export {Types};

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
