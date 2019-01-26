const EventEmitter = require('events');
const DEFAULT_BLUR_OPACITY = .6;
const TIMER_TIME = 1500;
const TIMER_STEPS = 100;
export default class Drawer extends EventEmitter {
    constructor(canvas, X_ref, parent, prg_bar, timer_progress_bar) {
        super();
        this.blur = false;
        this.blur_opacity = DEFAULT_BLUR_OPACITY;
        this.X = X_ref;
        this.canvas = canvas;
        this.parent = parent;
        this.prg_bar = prg_bar;
        this.timer_progress_bar = timer_progress_bar;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.onmousedown = () => this.mousedown = true;
        this.canvas.onmousemove = (e) => this.draw_on_grid(e);
        this.canvas.onclick = (e) => {
            this.mousedown = true;
            this.draw_on_grid(e);
            this.mousedown = false;
        };
        this.canvas.onmouseup = this.canvas.onmouseleave = () => this.mousedown = false;
        this.canvas.ontouchstart = this.canvas.ontouchmove = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.mousedown = true;
            this.draw_on_grid(new MouseEvent("mousemove", {
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY
            }));
            this.mousedown = false;
        };
        window.onload = window.onresize = () => {
            this.updateCanvasSize();
        };
    }

    enable() {
        this.enabled = true;
        this.canvas.style.cursor = "pointer";
    }

    disable() {
        this.enabled = false;
        this.canvas.style.cursor = "not-allowed";
    }

    reset_timer() {
        // reset
        // restart
        if (!this.enabled)
            return;
        if (this.timeout != null) {
            clearTimeout(this.timeout);
        }
        this.n=0;
        let step = TIMER_TIME/TIMER_STEPS;
        this.timeout = setInterval(()=>{
            this.emit("timer_progress",(this.n*step)/TIMER_TIME*100);
            if (this.n*step>=TIMER_TIME) {
                this.emit("timer end");
                clearTimeout(this.timeout);
                this.timeout = null;
                return;
            }
            this.n++;
        }, step);
    }

    draw_on_grid(e) {
        if (!this.enabled || !this.mousedown)
            return;
        let x = e.pageX - this.bound_canvas.left;
        let y = e.pageY - this.bound_canvas.top;

        let pos = this.getPosition(x, y);
        let ns = Math.sqrt(this.X.length);

        this.X[pos] = 1;
        if (this.blur) {
            // TOP
            if (pos > (ns - 1)) {
                if (this.X[pos - ns] === 0) {
                    this.X[pos - ns] = this.blur_opacity;
                }
            }
            // BOTTOM
            if (pos < this.X.length - (ns - 1)) {
                if (this.X[pos + ns] === 0) {
                    this.X[pos + ns] = this.blur_opacity;
                }
            }
            // LEFT
            if (pos % ns !== 0) {
                if (this.X[pos - 1] === 0) {
                    this.X[pos - 1] = this.blur_opacity;
                }
            }
            // RIGHT
            if ((pos + 1) % ns !== 0) {
                if (this.X[pos + 1] === 0) {
                    this.X[pos + 1] = this.blur_opacity;
                }
            }
        }

        this.emit("drawing");
        this.redraw();
    }

    updateCanvasSize() {
        this.bound_canvas = this.canvas.getBoundingClientRect();
        let winh = window.innerHeight;
        let edge = this.parent.clientWidth-30;
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

    update_progress_train(percent) {
        this.prg_bar.style.width = percent + "%";
        this.prg_bar.innerText = "training: " + percent + "%";
    }

    update_progress_timer(percent) {
        percent = Math.round(percent);
        this.timer_progress_bar.style.width = percent + "%";
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        let i = 0;
        let ns = Math.sqrt(this.X.length);

        let gapy = this.h / ns;
        let gapx = this.w / ns;

        for (let y = 0; y < this.h; y += gapy) {
            for (let x = 0; x < this.w; x += gapx, i++) {
                let val = Math.round(this.X[i] * 255).toString(16);
                let neg = Math.round(255 - this.X[i] * 255).toString(16);
                let style = '#' + val + val + val; //white
                let neg_style = '#' + neg + neg + neg; //black

                this.ctx.fillStyle = neg_style;
                this.ctx.strokeStyle = neg_style;
                this.ctx.fillRect(x, y, gapx, gapy);

                this.ctx.fillStyle = style;
                this.ctx.strokeStyle = style;

                this.ctx.strokeRect(x, y, gapx, gapy);
                //this.ctx.fillText(Math.round(this.X[i]*100)/100, x, y + incry, incrx);
            }
        }
    }
}



