export const GRAVITY = 0.2;
export const FRICTION = 0.9;

const imageSources = [
    './images/back-btn.png',
    './images/bg.png',
    './images/bullet.png',
    './images/clear-map-btn.png',
    './images/coin.png',
    './images/delete-all-btn.png',
    './images/editor-btn.png',
    './images/elements.png',
    './images/enemies.png',
    './images/flag-pole.png',
    './images/flag.png',
    './images/start-screen.png',
    './images/grid-large-btn.png',
    './images/grid-medium-btn.png',
    './images/grid-small-btn.png',
    './images/grid.png',
    './images/lvl-size.png',
    './images/mario-head.png',
    './images/mario-sprites.png',
    './images/powerups.png',
    './images/save-map-btn.png',
    './images/saved-btn.png',
    './images/slider-left.png',
    './images/slider-right.png',
    './images/start-btn.png',
];

export const Images = {};
for (const src of imageSources) {
    const im = new Image();
    im.src = src;
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
    coin: new Audio('./sounds/coin.wav'),
    powerUpAppear: new Audio('./sounds/power-up-appear.wav'),
    powerUp: new Audio('./sounds/power-up.wav'),
    marioDie: new Audio('./sounds/mario-die.wav'),
    killEnemy: new Audio('./sounds/kill-enemy.wav'),
    stageClear: new Audio('./sounds/stage-clear.wav'),
    bullet: new Audio('./sounds/bullet.wav'),
    powerDown: new Audio('./sounds/power-down.wav'),
    jump: new Audio('./sounds/jump.wav'),
};
