import bg from './static/images/bg.png';
import bullet from './static/images/bullet.png';
import coin from './static/images/coin.png';
import elements from './static/images/elements.png';
import enemies from './static/images/enemies.png';
import marioHead from './static/images/mario-head.png';
import marioSprites from './static/images/mario-sprites.png';
import powerUps from './static/images/powerups.png';
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
    './static/images/bg.png': bg,
    './static/images/bullet.png': bullet,
    './static/images/coin.png': coin,
    './static/images/elements.png': elements,
    './static/images/enemies.png': enemies,
    './static/images/mario-head.png': marioHead,
    './static/images/mario-sprites.png': marioSprites,
    './static/images/powerups.png': powerUps,
    './static/images/start-screen.png': startScreen,
};

export const Images = {};
export const Sounds = {
    bullet: new Audio(bulletSound),
    coin: new Audio(coinSound),
    jump: new Audio(jumpSound),
    killEnemy: new Audio(killEnemySound),
    marioDie: new Audio(marioDieSound),
    powerDown: new Audio(powerDownSound),
    powerUp: new Audio(powerUpSound),
    powerUpAppear: new Audio(powerUpAppearSound),
    stageClear: new Audio(stageClearSound),
};

(() => {
    for (const [src, data] of Object.entries(imageSources)) {
        const im = new Image();
        im.src = data;
        Images[src.split('/').at(-1)] = im;
    }
    for (const audio of Object.values(Sounds)) audio.load();
})();
