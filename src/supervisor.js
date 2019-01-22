import $ from 'jquery';
import {Trainer} from './trainer';
import {Drawer} from './drawer';

/* ----------------------------------REFS--------------------------------- */
const parent = $('#paint-box');
const canvas = document.getElementById('canvas');


/* -------------------------------CONSTANTS------------------------------- */
const DEFAULT_MAX_SQUARES = 16;
const DEFAULT_MIN_SQUARES = 8; // 8=64 input, 16=256 input, ...


/* -------------------------------VARIABLES------------------------------- */
const nn = new Trainer(DEFAULT_MAX_SQUARES);
const drawer = new Drawer(canvas, nn.X, parent);


init_components();

/* -------------------------------FUNCTIONS------------------------------- */
function init_components() {
    nn.on('update', () => {
        drawer.redraw();
    });
    canvas.ontouchstart = (e) => {
        console.log("touch started");
        drawer.draw_on_grid(e);
        e.preventDefault();
    };
    canvas.ontouchmove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        let touch = e.touches[0];
        drawer.mousedown = true;
        drawer.draw_on_grid(new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        }));

        //check that x and y are inside the canvas..
    };

    window.onload = window.onresize = (e) => {
        drawer.updateCanvasSize();
    };
}

function step_by_step() {
    //1, assegnare numero a caso
    //2, enable drawer
    // convolute X times
    // give the prediction
    if (nn.X.length / 4 >= DEFAULT_MIN_SQUARES * DEFAULT_MIN_SQUARES)
        nn.reduce(2);
}

function skip() {

    // 1. ridurre
    // 2. aspettare
    // ripetere da 1 finchè
}

export {
    step_by_step, skip
}