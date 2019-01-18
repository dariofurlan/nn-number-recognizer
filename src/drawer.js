class Drawer {
    constructor(canvas, n_squares, X_ref) {
        this.MAX_N_SQUARES = n_squares;
        this.MIN_N_SQUARES = 8;
        this.n_squares = n_squares;
        this.X = X_ref;
        this.isDrawing = false;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeText("11111111111111",20,20);
    }

    updateCanvasSize (width, height) {
        this.w = width;
        this.h = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }

    drawGrid() {
        console.log("draw");
        this.ctx.clearRect(0, 0, this.w, this.h);
        let i = 0;
        let ns = Math.sqrt(this.X.length);
        let incrx = this.w / ns;
        let incry = this.h / ns;
        for (let y = 0; y < this.w; y += incrx, i--) {
            for (let x = 0; x < this.h; x += incrx, i++) {

                // to make a b/w color all rgb must be at the same value, all to zero means black, and 255 is white
                let val = Math.round(this.X[i]*255).toString(16);
                console.log(this.X[i]*255);
                this.ctx.fillStyle = '#'+val+val+val;
                console.log('#'+val+val+val);

                //this.ctx.strokeText(Math.round(this.X[i]*100)/100, x, y + incry, incrx);
                //this.ctx.strokeRect(x,y,incrx,incry);
                this.ctx.fillRect(x, y, incrx, incry);
            }
        }
    }

    reduceGride() {
        // todo only temp method
        if (this.n_squares % 2 === 0 && this.n_squares / 2 > 4)
            this.n_squares /= 2;
        this.drawGrid();
    }
}

export {Drawer};



