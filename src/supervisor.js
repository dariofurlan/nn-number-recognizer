import $ from 'jquery';
import {Trainer} from './trainer';
import {Drawer} from './drawer';

/* ----------------------------------REFS--------------------------------- */
const paint_box = $('#paint-box');
const canvas = document.getElementById('canvas');


/* -------------------------------CONSTANTS------------------------------- */
const DEFAULT_MAX_SQUARES = 64;
const DEFAULT_MIN_SQUARES = 8;


/* -------------------------------VARIABLES------------------------------- */
let bound_canvas;
const nn = new Trainer(DEFAULT_MAX_SQUARES);
const drawer = new Drawer(canvas, nn.out);


init_components();

/* -------------------------------FUNCTIONS------------------------------- */
function init_components() {
    function draw(e) {
        let x = e.pageX - bound_canvas.left;
        let y = e.pageY - bound_canvas.top;

        let pos = drawer.getPosition(x, y);
        let ns = Math.sqrt(nn.out.length);

            // todo standardize the "sfumato"
        nn.out[pos] = 1;
        if (pos > (ns - 1)) {
            if (nn.out[pos - ns] === 0) {
                nn.out[pos - ns] = .5;
            }
        }
        if (pos < nn.out.length - (ns - 1)) {
            if (nn.out[pos + ns] === 0) {
                nn.out[pos + ns] = .5;
            }
        }
        if (pos % ns !== 0) {
            if (nn.out[pos - 1] === 0) {
                nn.out[pos - 1] = .5;
            }
        }
        if ((pos + 1) % ns !== 0) {
            if (nn.out[pos + 1] === 0) {
                nn.out[pos + 1] = .5;
            }
        }

        nn.emit('update');
    }

    nn.on('update', () => {
        drawer.drawGrid();
    });
    window.ontouchstart = (e) => {
        console.log("touch started");
        draw(e);
        e.preventDefault();
    };
    window.ontouchmove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        let touch = e.touches[0];
        draw(new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        }));
    };
    window.onload = window.onresize = (e) => {
        //console.log("resized");
        bound_canvas = canvas.getBoundingClientRect();
        let winh = window.innerHeight;
        let winw = window.innerWidth;

        let w = paint_box.width();
        let h = paint_box.height();
        let edge = w;
        if (edge > winh*.9) // todo fix this
            edge = winh*.9;
        drawer.updateCanvasSize(edge, edge);
        drawer.drawGrid();
    };
    canvas.onclick = (e) => {
        draw(e);
    };
    canvas.onmousemove = (e) => {
        if (!drawer.isDrawing) {
            return;
        }
        draw(e);
    };
    canvas.onmousedown = (e) => {
        drawer.isDrawing = true;
    };
    canvas.onmouseup = canvas.onmouseleave = (e) => {
        drawer.isDrawing = false;
    };
}

function step_by_step() {
    const MIN_LIMIT = 16;
    if (nn.out.length / 4 >= MIN_LIMIT * MIN_LIMIT)
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