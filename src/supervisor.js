import $ from 'jquery';
import {NN} from './nn';
import {Drawer} from './drawer';

/* ----------------------------------REFS--------------------------------- */
const paint_box = $('#paint-box');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';
ctx.fillRect(10,10,20,20);

// CONSTANTS
const N_SQUARES = 16;
let bound_canvas = canvas.getBoundingClientRect();


const nn = new NN(N_SQUARES);
const drawer = new Drawer(canvas, N_SQUARES, nn.out);
nn.on('update', () => {
    drawer.drawGrid();
});



init();
/* -------------------------------FUNCTIONS------------------------------- */
function init() {
    window.onload = window.onresize = (e)=> {
        console.log("resized");
        bound_canvas = canvas.getBoundingClientRect();
        drawer.updateCanvasSize(paint_box.width(),paint_box.width());
        drawer.drawGrid();
    };
    canvas.addEventListener('mousemove', function (e) {
        if (!drawer.isDrawing) {
            return;
        }
        let x = e.pageX - bound_canvas.left;
        let y = e.pageY - bound_canvas.top;

        //console.log(x+"-"+y);
    });
    canvas.addEventListener('mousedown', function (e) {
        console.log("down");
        drawer.isDrawing=true;
    });
    canvas.addEventListener('mouseup', function (e) {
        console.log("up");
        drawer.isDrawing = false;
    });
}

function reduce() {
    nn.reduce();
}

function reset() {
    // TODO actually do something serious, and better

}

export {
    reduce, reset
}