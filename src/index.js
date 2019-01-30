import 'bootstrap/dist/css/bootstrap.min.css';
import './style/style.scss';

import {Drawer,Trainer} from './script/drawer';
import Dataset from './script/dataset';

// TODO  sistemare il problema del disegno su chrome e cellulari, migliorare quindi gli eventi del mouse, touch, pointer quello che è
// TODO  avviare il countdown al rilascio del mouse o alla fine del tocco
// TODO  load pre drawn numbers
// TODO  prepare and download function inside drawer
// TODO  finally create all error messages for the whole project


/* ----------------------------------REFS--------------------------------- */
const msg_y = document.getElementById('msg-y');
const msg_list = document.getElementById('msg-list');


/* -------------------------------VARIABLES------------------------------- */
const drawer = new Drawer();

//new CreateDataset().start();
new Test().start();
/* -------------------------------FUNCTIONS------------------------------- */

function load() {
    let oReq = new XMLHttpRequest();
    oReq.onload = () => {
        let dataset = JSON.parse(oReq.responseText);
        console.log(dataset);
    };
    oReq.open("GET", "http://0.0.0.0:8000/dataset/dataset_2019-01-28T18-11-25.979Z_dario.json");
    oReq.send();
}

function CreateDataset() {
    let Y = Trainer.get_train_Y();
    let i = 0;
    let c = 0;
    let max_c = 10;

    drawer.removeAllListeners("drawing");
    drawer.removeAllListeners("timer progress");
    drawer.removeAllListeners("timer end");

    drawer.on("drawing", () => drawer.reset_timer());
    drawer.on("timer_progress", (percent) => drawer.update_progress_timer(percent));
    drawer.on("timer end", () => {
        augment();
        drawer.update_progress_timer(0);
    });

    this.start = () => {
        draw_new_number();
    };

    let draw_new_number = () => {
        if (i > Y.length - 1) {
            c++;
            i = 0;
            drawer.download();
        }
        if (c === max_c) {
            drawer.download();
            drawer.trainer.reset();
            return;
        }
        drawer.trainer.reset();
        msg_y.innerText = Y[i];
        drawer.enable();
    };

    let augment = () => {
        drawer.disable();
        drawer.update_progress_train(Math.floor((c*max_c+i+1)*100/(Y.length * max_c))); // ToDo fix this percentage, please
        drawer.trainer.add_X(Y[i]);
        //trainer.augment();
        console.log(drawer.trainer.dataset.dataset);
        i++;
        draw_new_number();
    };
}

function Test() {
    let y;
    drawer.removeAllListeners("drawing");
    drawer.removeAllListeners("timer progress");
    drawer.removeAllListeners("timer end");

    drawer.on("drawing", () => drawer.reset_timer());
    drawer.on("timer_progress", (percent) => drawer.update_progress_timer(percent));
    drawer.on("timer end", () => {
        step_1();
        drawer.update_progress_timer(0);
    });

    this.start = () => {
        step_0();
    };

    // start drawing
    let step_0 = () => {
        //console.log("step_0");
        drawer.trainer.reset();
        y = Trainer.get_test_y();
        msg_y.innerText = y;
        drawer.enable();
    };
    // ended drawing: pooling
    let step_1 = () => {
        //console.log("step_1");
        drawer.disable();
        drawer.trainer.augment();
        //setTimeout(step_2, 250);
    };
    // test and output
    let step_2 = () => {

        step_0();
    };

    let old_step2 = () => {
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


