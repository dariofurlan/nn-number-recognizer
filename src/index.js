import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';

import $ from 'jquery';
import {Trainer} from './trainer';
import {Drawer} from './drawer';

/* ----------------------------------REFS--------------------------------- */
const parent = $('#paint-box');
const canvas = document.getElementById('canvas');
const msg_y = document.getElementById('msg-y');
const msg_list = document.getElementById('msg-list');


/* -------------------------------CONSTANTS------------------------------- */
const TIME_TO_DRAW = 1 * 1000;

/* -------------------------------VARIABLES------------------------------- */
const trainer = new Trainer();
const drawer = new Drawer(canvas, trainer.X, parent);


init_components();
draw_loop();
/* -------------------------------FUNCTIONS------------------------------- */
function init_components() {
    trainer.on('update', () => {
        drawer.redraw();
    });
}


function draw_loop() {
    trainer.reset();
    let y = Trainer.get_random_y();
    msg_y.innerText = y;
    drawer.enabled = true;

    let timeout = null;
    drawer.on("drawing", () => {
        if (timeout!=null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(step_1, TIME_TO_DRAW);
    });
    function step_1 () {
        drawer.enabled =false;
        trainer.reduce(2);
        setTimeout(step_2, 250);
        function step_2() {
            let [pred, error] = trainer.train(y);
            msg_list.innerHTML = "";
            for (let i = 0; i < pred.length; i++) {
                msg_list.innerHTML += pred[i].number + ") " + pred[i].accuracy + "<br/>";
            }
            msg_list.innerHTML+="<br/>Errore: <b>"+error+"</b>";
            draw_loop();
        }
    }
}