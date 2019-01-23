import $ from 'jquery';
import {Trainer} from './trainer';
import {Drawer} from './drawer';

/* ----------------------------------REFS--------------------------------- */
const parent = $('#paint-box');
const canvas = document.getElementById('canvas');
const msg_y = document.getElementById('msg-y');
const btn1 = document.getElementById('next');
const btn2 = document.getElementById('train');


/* -------------------------------CONSTANTS------------------------------- */
const DEFAULT_MAX_SQUARES = 16;
const DEFAULT_MIN_SQUARES = 8; // 8=64 input, 16=256 input, ...


/* -------------------------------VARIABLES------------------------------- */
const trainer = new Trainer(DEFAULT_MAX_SQUARES);
const drawer = new Drawer(canvas, trainer.X, parent);


init_components();

/* -------------------------------FUNCTIONS------------------------------- */
function init_components() {
    btn1.onclick = (e) => {
        next();
    };
    btn2.onclick = (e) => {
        train();
    };
    trainer.on('update', () => {
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

let y;
function next() {
    y = Trainer.get_random_y();
    msg_y.innerText = "Disegna il numero: "+y;
    drawer.updateCanvasSize();
    drawer.enabled = true;

    btn1.disabled = true;
    btn2.disabled = false;
}

function train() {
    drawer.enabled = false;
    if (trainer.X.length / 4 >= DEFAULT_MIN_SQUARES * DEFAULT_MIN_SQUARES)
        trainer.reduce(2);

    trainer.train(y);
    btn2.disabled = true;
    btn1.disabled = false;
}

export {
    next, train
}