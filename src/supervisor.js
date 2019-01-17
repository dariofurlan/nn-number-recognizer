import $ from 'jquery';
import {NN} from './nn';
import {Drawer} from './drawer';

// REFS
const half_left = $('#half-left');
const half_right = $('#half-right');


//TODO  make a wrapper class that handles interactions between drawer an nn


// CONSTANTS
const WIDTH = half_left.width();
const HEIGHT = half_left.height();
const N_SQUARES = 64;


const nn = new NN(N_SQUARES);
const X_ref = nn.getX();
const drawer = new Drawer(WIDTH,WIDTH,N_SQUARES,X_ref);
drawer.drawGrid();
nn.on('update', (data) => {
    drawer.drawGrid()
});

function reduce() {
    drawer.reduceGride()
}

function reset() {
    // TODO actually do something serious, and better
    drawer.n_squares = drawer.MAX_N_SQUARES;
    drawer.drawGrid();
}

export {
    reduce,reset
}