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

    clear() {
        this.ctx.clearRect(0, 0, this.maxWidth, this.height);
        this.ctx.beginPath();
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

    writeText(text, x, y, fs = 20, color = '#2e2ec1') {
        this.ctx.font = `${fs}px SuperMario256`;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }
}
