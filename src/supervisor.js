import $ from 'jquery';
import {NN} from './nn';
import {Drawer} from './drawer';

/* ----------------------------------REFS--------------------------------- */
const paint_box = $('#paint-box');
const canvas = document.getElementById('canvas');
const edge_size_input = document.getElementById('edge');


/* -------------------------------CONSTANTS------------------------------- */
const DEFAULT_N_SQUARES = 16;


/* -------------------------------VARIABLES------------------------------- */
let bound_canvas;
let n_squares = DEFAULT_N_SQUARES;
const nn = new NN(n_squares);
const drawer = new Drawer(canvas, nn.out);
nn.on('update', () => {
    drawer.drawGrid();
});



init();
/* -------------------------------FUNCTIONS------------------------------- */
function init() {
    function draw(e) {
        let x = e.pageX - bound_canvas.left;
        let y = e.pageY - bound_canvas.top;

        let pos = drawer.getPosition(x, y);
        nn.out[pos] = 1;
        nn.emit('update');
    }

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
        drawer.updateCanvasSize(paint_box.width(), paint_box.width());
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
    canvas.addEventListener('mousedown', function (e) {
        console.log("down");
        drawer.isDrawing = true;
    });
    canvas.addEventListener('mouseup', function (e) {
        console.log("up");
        drawer.isDrawing = false;
    });
}

function reduce() {
    if (nn.out.length / 4 >= 64)
        nn.reduce();
}

function reset() {
    // TODO actually do something serious, and better

}

export {
    reduce, reset
}