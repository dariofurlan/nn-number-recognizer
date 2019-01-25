import 'bootstrap/dist/css/bootstrap.min.css';
import './style/style.scss';

import {Trainer} from './trainer';
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
trainer.on('update', () => {
    drawer.redraw();
});

new Train().finished();

drawer.emit("drawing");
/*let test = new Test();
test.step_0();*/

/* -------------------------------FUNCTIONS------------------------------- */
function Train() {
    this.timeout = null;

    let Y = Trainer.get_train_Y();
    let i = 0;

    let cb = () => {
        console.log("train");
        if (!drawer.enabled)
            return;
        if (this.timeout != null) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.step_1, TIME_TO_DRAW);
    };
    drawer.on("drawing", cb);

    this.start_drawing = () => {
        trainer.reset();
        msg_y.innerText = Y[i];
        this.timeout = null;
        drawer.enabled = true;

        //get the y
    };
    this.augment = () => {
        // finished draing
    };
    this.step_2 = () => {

        this.step_0();
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

    this.finished = () => {
        drawer.removeListener("drawing", cb);
        new Test().start();
    }
    //to detach listener
}

function Test() {
    this.timeout = null;

    let cb = () => {
        if (!drawer.enabled)
            return;
        if (this.timeout != null) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(step_1, TIME_TO_DRAW);
    };
    drawer.on("drawing", cb);

    this.start = () => {
        step_0();
    };

    // start drawing
    let step_0 = () => {
        //console.log("step_0");
        trainer.reset();
        msg_y.innerText = Trainer.get_test_y();
        this.timeout = null;
        drawer.enabled = true;
    };
    // ended drawing: pooling
    let step_1 = () => {
        //console.log("step_1");
        drawer.enabled = false;
        trainer.max_pooling();
        setTimeout(step_2, 250);
    };
    // test and output
    let step_2 = () => {
        let pred = trainer.test();
        //error = Math.round(error * 1000000) / 10000;
        msg_list.innerHTML = "";
        for (let i = 0; i < pred.length; i++) {
            let acc = Math.round(pred[i].accuracy * 1000000) / 10000;
            msg_list.innerHTML += pred[i].number + ") " + acc + "<br/>";
        }
        let acc = Math.round(pred[0].accuracy * 10000) / 100;
        let best_pred = pred[0].number;
        msg_list.innerHTML = "al <b>"+acc+"</b>% il numero disegnato è: <b>"+best_pred+"</b>";
        step_0();
        //msg_list.innerHTML += "<br/>Errore: <b>" + error + "</b>";
    };
}


