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
drawer.blur = true;
drawer.blur_opacity = .3;


let timeout = null;
let y;

init_components();
step_0();
/* -------------------------------FUNCTIONS------------------------------- */
function init_components() {
    trainer.on('update', () => {
        drawer.redraw();
    });
}

drawer.on("drawing", () => {
    if (!drawer.enabled)
        return;
    if (timeout != null) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(step_1, TIME_TO_DRAW);
});

function step_0() {
    console.log("step_0");
    trainer.reset();
    y = Trainer.get_random_y();
    msg_y.innerText = y;
    timeout = null;
    drawer.enabled = true;
}

function step_1() {
    console.log("step_1");
    drawer.enabled = false;
    function loop() {
        console.log("reducing...");
        if (trainer.reduce())
            setTimeout(loop, 250);
        else
            setTimeout(step_2, 250);
    }
    loop();
}

function step_2() {
    console.log("step_2");
    let i=0;
    function loop() {
        console.log("loop");
        if (i === 100) {
            setTimeout(step_0, 0);
            return;
        }
        let [pred, error] = trainer.train(y);
        error = Math.round(error*1000000)/10000;
        msg_list.innerHTML = "iteration: "+i+"<br/>";
        for (let i = 0; i < pred.length; i++) {
            let acc = Math.round(pred[i].accuracy*1000000)/10000;
            msg_list.innerHTML += pred[i].number + ") " + acc + "<br/>";
        }
        msg_list.innerHTML += "<br/>Errore: <b>" + error + "</b>";
        i++;
        setTimeout(loop,25);
    }
    loop();
}

