//canvas elements for the main mario game

export default class GameUI {
    constructor(canvas) {
        this._canvasRef = canvas;
    }

    get canvas() {
        if (!this._canvas) this._canvas = this._canvasRef.current;
        return this._canvas;
    }
    get ctx() {
        if (!this._ctx) this._ctx = this.canvas.getContext('2d');
        return this._ctx;
    }

    getWidth() {
        return this.canvas.width;
    }

    getHeight() {
        return this.canvas.height;
    }

    getCanvas() {
        return this.canvas;
    }

    show() {
        this.canvas.style.display = 'block';
    }

    hide() {
        this.canvas.style.display = 'none';
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

    draw(image, sx, sy, swidth, sheight, x, y, dwidth, dheight) {
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
