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
