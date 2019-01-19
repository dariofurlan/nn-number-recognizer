import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import $ from 'jquery';
import './supervisor';
import {reduce, reset} from "./supervisor";

// bottoni

const btn1 = $('#btn1');
const btn2 = $('#btn2');

btn1.on('click', reduce);
btn2.on('click', reset);