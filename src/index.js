import 'bootstrap/dist/css/bootstrap.min.css';
import './style/style.scss';

import {NUM_NUM as n_number, Trainer} from './trainer';
import {Drawer} from './drawer';

// TODO  avviare il countdown al rilascio del mouse o alla fine del tocco


/* ----------------------------------REFS--------------------------------- */
const parent = document.getElementById('paint-box');
console.log(parent);
const canvas = document.getElementById('canvas');
const msg_y = document.getElementById('msg-y');
const msg_list = document.getElementById('msg-list');


/* -------------------------------CONSTANTS------------------------------- */
const TIME_TO_DRAW = 1 * 1000;

/* -------------------------------VARIABLES------------------------------- */
const trainer = new Trainer();
const drawer = new Drawer(canvas, trainer.X, parent);
drawer.blur = false;
drawer.blur_opacity = .3;

init_components();
let test = new Test();
test.step_0();

/* -------------------------------FUNCTIONS------------------------------- */
function init_components() {
    trainer.on('update', () => {
        drawer.redraw();
    });
}

function train() {
    this.y = this.timeout = null;
    this.step_0 = () => {
        //get the y
    };
    this.step_1 = () => {
        //draw
    };

    function ask_dataset() {
        // ask to draw each number
        for (let y_ = 0; y_ < n_number; y_++) {
            trainer.reset();
            msg_y.innerText = y_;
            this.timeout = null;
            drawer.enabled = true;
        }
        //augmentation of the data
    }
}

function Test() {
    this.timeout = null;

    drawer.on("drawing", () => {
        if (!drawer.enabled)
            return;
        if (this.timeout != null) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.step_1, TIME_TO_DRAW);
    });

    // start drawing
    this.step_0 = () => {
        //console.log("step_0");
        trainer.reset();
        msg_y.innerText = Trainer.get_test_y();
        this.timeout = null;
        drawer.enabled = true;
    };
    // ended drawing: pooling
    this.step_1 = () => {
        //console.log("step_1");
        drawer.enabled = false;
        trainer.max_pooling();
        setTimeout(this.step_2, 250);
    };
    // test and output
    this.step_2 = () => {
        let pred = trainer.test();
        //error = Math.round(error * 1000000) / 10000;
        msg_list.innerHTML = "";
        for (let i = 0; i < pred.length; i++) {
            let acc = Math.round(pred[i].accuracy * 1000000) / 10000;
            msg_list.innerHTML += pred[i].number + ") " + acc + "<br/>";
        }
        setTimeout(this.step_0,0);
        //msg_list.innerHTML += "<br/>Errore: <b>" + error + "</b>";
    };
}


