import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import $ from 'jquery';

const half_left = $('#half-left');
const half_right = $('#half-right');
const canvas = $('#paint')[0];
const ctx = canvas.getContext("2d");
let width = half_left.width();
let height = half_left.height();
let cw = width;
let ch = width;
ctx.canvas.width = cw;
ctx.canvas.height = ch;

function draw_canvas_grid() {
    let incr = width / 32;
    for (let i=0;i<=width;i+=incr) {
        // verticali
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, ch);
        ctx.stroke();

        //orizzontali
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(cw, i);
        ctx.stroke();
    }
}

draw_canvas_grid();