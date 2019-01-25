import 'bootstrap/dist/css/bootstrap.min.css';
import './style/style.scss';

import Trainer from './trainer';
import Drawer from './drawer';

// TODO  avviare il countdown al rilascio del mouse o alla fine del tocco
// TODO  rappresentare graficamente il countdown
// TODO  rappresentare graficamente il canvas abilitato oppure no al disegno


/* ----------------------------------REFS--------------------------------- */
const parent = document.getElementById('paint-box');
const prg_bar1 = document.getElementById('prg1');
const canvas = document.getElementById('canvas');
const msg_y = document.getElementById('msg-y');
const msg_list = document.getElementById('msg-list');

/* -------------------------------CONSTANTS------------------------------- */
const TIME_TO_DRAW = 1.5 * 1000;

/* -------------------------------VARIABLES------------------------------- */
const trainer = new Trainer();
const drawer = new Drawer(canvas, trainer.X, parent, prg_bar1);
drawer.blur = false;
drawer.blur_opacity = .3;

trainer.on('update', () => {
    drawer.redraw();
});


new Train().draw_new_number();

/* -------------------------------FUNCTIONS------------------------------- */
function Train() {
    this.timeout = null;

    let Y = Trainer.get_train_Y();
    let i = 0;

    let cb = () => {
        if (!drawer.enabled)
            return;
        if (this.timeout != null) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.augment, TIME_TO_DRAW);
    };
    drawer.removeAllListeners("drawing");
    drawer.on("drawing", cb);

    this.draw_new_number = () => {
        if (i > Y.length - 1) {
            this.train();
            return;
        }
        trainer.reset();
        msg_y.innerText = Y[i];
        this.timeout = null;
        drawer.enabled = true;
    };

    this.augment = () => {
        drawer.enabled = false;
        drawer.update_progress(Math.round(((i + 1) / Y.length) * 100));
        trainer.add_draw();
        trainer.augment();
        i++;
        //this.draw_new_number();
    };

    this.train = () => {
        console.log("training...");

    };
}

function Test() {
    this.timeout = null;

    let cb = () => {
        console.log("test");
        if (!drawer.enabled)
            return;
        if (this.timeout != null) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(step_1, TIME_TO_DRAW);
    };
    drawer.removeAllListeners("drawing");
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
        msg_list.innerHTML = "al <b>" + acc + "</b>% il numero disegnato è: <b>" + best_pred + "</b>";
        step_0();
        //msg_list.innerHTML += "<br/>Errore: <b>" + error + "</b>";
    };
}


