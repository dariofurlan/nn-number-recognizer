class Drawer {
    constructor(canvas, X_ref, parent) {
        this.X = X_ref;
        this.isDrawing = false;
        this.canvas = canvas;
        this.parent = parent;
        this.ctx = this.canvas.getContext("2d");
        this.enabled = true;
        this.canvas.onmousedown = () => this.mousedown = true;
        this.canvas.onmousemove = (e) => this.draw_on_grid(e);
        this.canvas.onclick = (e) => this.draw_on_grid(e);
        this.canvas.onmouseup = () => this.mousedown = false;
        this.canvas.onmouseleave = () => this.mousedown = false;
    }

    draw_on_grid(e) {
        if (!this.enabled || !this.mousedown)
            return;
        let x = e.pageX - this.bound_canvas.left;
        let y = e.pageY - this.bound_canvas.top;

        let pos = this.getPosition(x, y);
        let ns = Math.sqrt(this.X.length);

        const OPACITY = .40;

        this.X[pos] = 1;

        if (pos > (ns - 1)) {
            if (this.X[pos - ns] === 0) {
                this.X[pos - ns] = OPACITY;
            }
        }
        if (pos < this.X.length - (ns - 1)) {
            if (this.X[pos + ns] === 0) {
                this.X[pos + ns] = OPACITY;
            }
        }
        if (pos % ns !== 0) {
            if (this.X[pos - 1] === 0) {
                this.X[pos - 1] = OPACITY;
            }
        }
        if ((pos + 1) % ns !== 0) {
            if (this.X[pos + 1] === 0) {
                this.X[pos + 1] = OPACITY;
            }
        }
        this.redraw();
    }

    updateCanvasSize() {
        this.bound_canvas = this.canvas.getBoundingClientRect();
        let winh = window.innerHeight;
        let edge = this.parent.width();
        if (edge > winh * .9) // todo fix this
            edge = winh * .9;
        edge = Math.round(edge);
        this.w = edge;
        this.h = edge;
        this.canvas.width = edge;
        this.canvas.height = edge;
        this.redraw();
    }

    getPosition(x, y) {
        let ns = Math.sqrt(this.X.length);
        let gapy = this.h / ns;
        let gapx = this.w / ns;
        y = Math.floor(y / gapy);
        x = Math.floor(x / gapx);

        let pos = (y * ns) + x;

        if (pos > this.X.length)
            return this.X.length;
        return pos;
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        let i = 0;
        let ns = Math.sqrt(this.X.length);

        let gapy = this.h / ns;
        let gapx = this.w / ns;

        for (let y = 0; y < this.h; y += gapy) {
            for (let x = 0; x < this.w; x += gapx, i++) {

                // to make a b/w color all rgb must be at the same value, all to zero means black, and 255 is white
                let val = Math.round(this.X[i] * 255).toString(16);
                let neg = Math.round(255 - this.X[i] * 255).toString(16);
                let style = '#' + val + val + val;
                let neg_style = '#' + neg + neg + neg;

                this.ctx.fillStyle = neg_style;
                this.ctx.fillStyle = neg_style;
                this.ctx.fillRect(x, y, gapx, gapy);

                this.ctx.fillStyle = style;
                this.ctx.strokeStyle = style;

                this.ctx.strokeRect(x, y, gapx, gapy);
                //this.ctx.fillText(Math.round(this.X[i]*100)/100, x, y + incry, incrx);
            }
        }
    }
}

export {Drawer};



