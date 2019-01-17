import $ from "jquery";

class Drawer {
    constructor(width, height, n_squares, X_ref) {
        this.w = width;
        this.h = height;
        this.MAX_N_SQUARES = n_squares;
        this.MIN_N_SQUARES = 8;
        this.n_squares = n_squares;
        this.state = {};
        this.canvas = $('#paint')[0];
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.ctx = this.canvas.getContext("2d");
        this.X = X_ref;
    }

    animation_loop() {
        //use this kind of loop for animations
        window.requestAnimationFrame(this.animation_loop)
    }

    drawGrid() {
        this.ctx.clearRect(0,0,this.w,this.h);
        let i=0;
        let ns = this.n_squares; // reduce if necessary
        let incrx = this.w/ns;
        let incry = this.h/ns;
        for (let y = 0; y < this.w; y += incrx) {
            for (let x = 0; x < this.h; x += incrx) {
                this.ctx.fillText(this.X[i], x, y + incry, incrx);
                this.ctx.strokeRect(x, y, incrx, incry);
                i++;
            }
        }
    }

    reduceAnimation() {

        if (/*condizione*/null) {
            window.requestAnimationFrame(this.reduceAnimation);
        }
    }

    reduceGride() {
        if (this.n_squares % 2 === 0 && this.n_squares / 2 > 4)
            this.n_squares /= 2;console.log(this);
        this.drawGrid();
    }
}

export {Drawer};



