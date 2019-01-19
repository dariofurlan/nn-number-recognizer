import $ from 'jquery';
import {NN} from './nn';
import {Drawer} from './drawer';

/* ----------------------------------REFS--------------------------------- */
const paint_box = $('#paint-box');
const canvas = document.getElementById('canvas');
const edge_size_input = document.getElementById('edge');

edge_size_input.onchange = (e) => {
    let v = edge_size_input.value;
    if (Math.log2(v) % 1 === 0) {
        console.log(v);
        n_squares = v;
        nn.update();
    }
};

/* -------------------------------CONSTANTS------------------------------- */
const DEFAULT_N_SQUARES = 16;



/* -------------------------------VARIABLES------------------------------- */
let bound_canvas;
let n_squares = DEFAULT_N_SQUARES;
const nn = new NN(n_squares);
const drawer = new Drawer(canvas, nn.out);



init();
/* -------------------------------FUNCTIONS------------------------------- */
function init() {
    function draw(e) {
        let x = e.pageX - bound_canvas.left;
        let y = e.pageY - bound_canvas.top;

        let pos = drawer.getPosition(x, y);

        let ns = Math.sqrt(nn.out.length);

        nn.out[pos] = 1;
        console.log(ns);
        if (pos > (ns-1)) {
            if (nn.out[pos-ns] === 0) {
                nn.out[pos - ns] = .5;
            }
        }
        if (pos < nn.out.length-(ns-1)) {
            if (nn.out[pos+ns] === 0) {
                nn.out[pos+ns] = .5;
            }
        }
        if (pos%ns!==0) {
            if (nn.out[pos-1] === 0) {
                nn.out[pos-1] = .5;
            }
        }

        if ((pos+1)%ns!==0) {
            if (nn.out[pos+1] === 0) {
                nn.out[pos+1] = .5;
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
    canvas.onmousedown = (e) => {
        drawer.isDrawing = true;
    };
    canvas.onmouseup = (e) => {
        drawer.isDrawing = false;
    };
    canvas.onmouseleave = (e) => {
        drawer.isDrawing = false;
    };
}

function reduce() {
    const MIN_LIMIT = 8;
    if (nn.out.length / 4 >= MIN_LIMIT*MIN_LIMIT)
        nn.reduce();
}

function reset() {
    // TODO actually do something serious, and better

}

export {
    reduce, reset
}