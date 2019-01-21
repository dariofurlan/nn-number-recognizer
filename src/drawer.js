class Drawer {
    constructor(canvas, X_ref) {
        this.X = X_ref;
        this.isDrawing = false;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
    }

    updateCanvasSize (width, height) {
        width = Math.round(width);
        height = Math.round(height);
        this.w = width;
        this.h = height;
        console.log(width+":"+height);
        this.canvas.width = width;
        this.canvas.height = height;
    }

    getPosition(x,y) {
        let ns = Math.sqrt(this.X.length);
        let gapy = Math.floor(this.h / ns);
        let gapx = Math.floor(this.w / ns);
        y = Math.floor(y/gapy);
        x = Math.floor(x/gapx);

        let pos = (y*ns)+x;
        console.log(pos);
        return pos;
    }

    draw(e) {

    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        let i = 0;
        let ns = Math.sqrt(this.X.length);

        let gapy = this.h / ns;
        let gapx = this.w / ns;

        for (let y = 0; y < this.h; y += gapy) {
            for (let x = 0; x < this.w; x += gapx, i++) {

                // to make a b/w color all rgb must be at the same value, all to zero means black, and 255 is white
                let val = Math.round(this.X[i]*255).toString(16);
                let neg = Math.round(255-this.X[i]*255).toString(16);
                let style = '#'+val+val+val;
                let neg_style = '#'+neg+neg+neg;

                this.ctx.fillStyle = neg_style;
                this.ctx.fillStyle = neg_style;
                this.ctx.fillRect(x, y, gapx, gapy);

                this.ctx.fillStyle = style;
                this.ctx.strokeStyle = style;

                this.ctx.strokeRect(x,y,gapx,gapy);
                //this.ctx.fillText(Math.round(this.X[i]*100)/100, x, y + incry, incrx);
            }
        }
    }
}

export {Drawer};



