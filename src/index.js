import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import $ from 'jquery';
import {NN} from './nn';
import {Drawer} from './drawer';

// REFS
const half_left = $('#half-left');
const half_right = $('#half-right');
const canvas = $('#paint')[0];
const ctx = canvas.getContext("2d");

// CONSTANTS
const WIDTH = half_left.width();
const HEIGHT = half_left.height();
const CTX_WIDTH = WIDTH;
const CTX_HEIGHT = WIDTH;
const N_SQUARES = 20;

console.log(WIDTH + "-" + CTX_WIDTH);

//todo next two lines need to be responsive
canvas.width = CTX_WIDTH;
canvas.height = CTX_HEIGHT;

const nn = new NN(N_SQUARES);
nn.on('update', (data) => {
    //redraw
});
const X = nn.getX();

function draw_canvas_grid() {
    const incrx = CTX_WIDTH / N_SQUARES;
    const incry = CTX_HEIGHT / N_SQUARES;
    ctx.font = ".7em Arial";

    let a = 0;
    for (let y = 0; y < CTX_HEIGHT; y += incrx) {
        for (let x = 0; x < CTX_WIDTH; x += incrx) {
            ctx.fillText(X[a], x, y + incry, incrx);
            ctx.strokeRect(x, y, incrx, incry);
            a++;
        }
    }
}

function smaller() {

}

export {smaller};

draw_canvas_grid();