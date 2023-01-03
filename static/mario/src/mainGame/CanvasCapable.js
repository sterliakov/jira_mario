import {Component} from 'react';

let _canvas = null;
let _ctx = null;

export function initCanvas(canvasRef) {
    _canvas = canvasRef.current;
    _ctx = _canvas.getContext('2d');
}

/**
 * We inherit from Component, but don't have to use it always.
 * This just helps to avoid super() chains and babel death.
 **/
export default class CanvasCapable extends Component {
    get ctx() {
        return _ctx;
    }
    get canvas() {
        return _canvas;
    }

    clear(x, y, width, height) {
        this.ctx.clearRect(x, y, width, height);
    }

    reset() {
        this.ctx.reset();
    }

    scrollWindow(x, y) {
        this.ctx.translate(x, y);
    }

    do_draw(image, sx, sy, swidth, sheight, x, y, dwidth, dheight) {
        this.ctx.drawImage(
            image,
            sx,
            sy,
            swidth,
            sheight,
            x,
            y,
            dwidth,
            dheight,
        );
    }

    makeBox(x, y, width, height) {
        this.ctx.rect(x, y, width, height);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
    }

    writeText(text, x, y) {
        this.ctx.font = '20px SuperMario256';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(text, x, y);
    }
}
