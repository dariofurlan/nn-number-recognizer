import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import $ from 'jquery';
import './supervisor';
import {step_by_step, skip} from "./supervisor";

// bottoni

const btn1 = $('#step-by-step');
const btn2 = $('#skip');

btn1.on('click', step_by_step);
btn2.on('click', skip);