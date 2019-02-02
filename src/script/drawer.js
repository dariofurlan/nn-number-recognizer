import Trainer from "./trainer";
import * as EventEmitter from 'events';

const DEFAULT_BLUR_OPACITY = .6;
const TIMER_TIME = 1500;
const TIMER_STEPS = 100;

function LoadingOverlay() {
    let btn_group = document.getElementById('btn-group');
    let div1 = document.createElement('div');
    let div2 = document.createElement('div');
    let span = document.createElement('span');
    span.className="sr-only";
    span.innerText = "Loading...";
    div1.id = "overlay";
    div2.id = "text";
    div1.className="d-flex";
    div2.className = "spinner-border spinner-border-xl";
    div2.style.width = "5rem";
    div2.style.height = "5rem";

    this.start = () => {
        btn_group.appendChild(div1);
        div1.appendChild(div2);
        div2.appendChild(span);
        div1.style.display = "block";
    };

    this.stop = () => {
        btn_group.removeChild(div1);
        div2.style.display = "none";
    };
}

class Timer extends EventEmitter {
    constructor() {
        super();
        this.is_running = false;
        this.timeout = null;
    }

    start() {
        if (!this.is_running) {
            console.log("started");
            this.is_running = true;
            let n = 0;
            let step = TIMER_TIME / TIMER_STEPS;
            this.timeout = setInterval(() => {
                this.emit("timer_progress", (n * step) / TIMER_TIME * 100);
                if (n * step >= TIMER_TIME) {
                    this.emit("timer end");
                    this.reset();
                }
                n++;
            }, step);
        }
    }

    reset() {
        console.log("reset");
        clearTimeout(this.timeout);
        this.timeout = null;
        this.is_running = false;
    }
}

class Drawer extends EventEmitter {
    constructor() {
        super();
        this.blur = false;
        this.blur_opacity = DEFAULT_BLUR_OPACITY;
        this.trainer = new Trainer();
        this.trainer.on('update', () => {
            this.redraw();
        });
        this.canvas = document.getElementById('canvas');
        this.parent = document.getElementById('half-left');
        this.general_progress_bar = document.getElementById('prg1');
        this.timer_progress_bar = document.getElementById('timer');
        this.ctx = this.canvas.getContext("2d");
        this.timer = new Timer();
        this.init_events();
    }

    init_events() {
        this.canvas.onmousedown = this.canvas.onpointerdown = () => {
            this.mousedown = true;
        };
        this.canvas.onmousemove = this.canvas.onpointermove = (e) => {
            this.draw_on_grid(e);
        };
        this.canvas.onclick = (e) => {
            this.mousedown = true;
            this.draw_on_grid(e);
            this.mousedown = false;
        };
        this.canvas.onmouseup = this.canvas.onmouseleave = this.canvas.onpointerup = this.canvas.onpointerleave =  () => {
            this.mousedown = false;
        };
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
        if (!this.enabled)
            return;
        if (this.timeout != null) {
            clearTimeout(this.timeout);
        }
        this.n = 0;
        let step = TIMER_TIME / TIMER_STEPS;
        this.timeout = setInterval(() => {
            this.emit("timer_progress", (this.n * step) / TIMER_TIME * 100);
            if (this.n * step >= TIMER_TIME) {
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
        let ns = Math.sqrt(this.trainer.X.length);

        this.trainer.X[pos] = 1;
        if (this.blur) {
            // TOP
            if (pos > (ns - 1)) {
                if (this.trainer.X[pos - ns] === 0) {
                    this.trainer.X[pos - ns] = this.blur_opacity;
                }
            }
            // BOTTOM
            if (pos < this.trainer.X.length - (ns - 1)) {
                if (this.trainer.X[pos + ns] === 0) {
                    this.trainer.X[pos + ns] = this.blur_opacity;
                }
            }
            // LEFT
            if (pos % ns !== 0) {
                if (this.trainer.X[pos - 1] === 0) {
                    this.trainer.X[pos - 1] = this.blur_opacity;
                }
            }
            // RIGHT
            if ((pos + 1) % ns !== 0) {
                if (this.trainer.X[pos + 1] === 0) {
                    this.trainer.X[pos + 1] = this.blur_opacity;
                }
            }
        }

        this.emit("drawing");
        this.redraw();
    }

    updateCanvasSize() {
        this.bound_canvas = this.canvas.getBoundingClientRect();
        let winh = window.innerHeight;
        let edge = this.parent.clientWidth - 30;
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
        let ns = Math.sqrt(this.trainer.X.length);
        let gapy = this.h / ns;
        let gapx = this.w / ns;
        y = Math.floor(y / gapy);
        x = Math.floor(x / gapx);

        let pos = (y * ns) + x;

        if (pos > this.trainer.X.length)
            return this.trainer.X.length;
        return pos;
    }

    update_progress_train(percent) {
        this.general_progress_bar.style.width = percent + "%";
        this.general_progress_bar.innerText = "training: " + percent + "%";
    }

    update_progress_timer(percent) {
        percent = Math.round(percent);
        this.timer_progress_bar.style.width = percent + "%";
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        let i = 0;
        let ns = Math.sqrt(this.trainer.X.length);

        let gapy = this.h / ns;
        let gapx = this.w / ns;

        for (let y = 0; y < this.h; y += gapy) {
            for (let x = 0; x < this.w; x += gapx, i++) {
                let val = Math.round(this.trainer.X[i] * 255).toString(16);
                let neg = Math.round(255 - this.trainer.X[i] * 255).toString(16);
                let style = '#' + val + val + val; //white
                let neg_style = '#' + neg + neg + neg; //black

                this.ctx.fillStyle = neg_style;
                this.ctx.strokeStyle = neg_style;
                this.ctx.fillRect(x, y, gapx, gapy);

                this.ctx.fillStyle = style;
                this.ctx.strokeStyle = style;

                this.ctx.strokeRect(x, y, gapx, gapy);
                //this.ctx.fillText(Math.round(this.trainer.X[i]*100)/100, x, y + incry, incrx);
            }
        }
    }
}

export {
    Drawer, Trainer, LoadingOverlay
}

