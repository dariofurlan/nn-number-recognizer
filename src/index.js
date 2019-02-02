import 'bootstrap/dist/css/bootstrap.min.css';
import './style/style.scss';

import {Drawer, Trainer} from './script/drawer';

// TODO  sistemare il problema del disegno su chrome e cellulari, migliorare quindi gli eventi del mouse, touch, pointer quello che è
// TODO  avviare il countdown al rilascio del mouse o alla fine del tocco
// TODO  draw_on_grid with coordinates instead of event
// TODO  load pre drawn numbers
// TODO  finally create all error messages for the whole project
// TODO  move the augmentation function to dataset?
// TODO  make the dataset an Array so that is more useful to pick random in order to train the NN
// TODO  craete animation of the dataset once loaded that scroll all the array to show all the training data

/* ----------------------------------REFS--------------------------------- */
const msg_y = document.getElementById('msg-y');
const msg_list = document.getElementById('msg-list');
const btn_group = document.getElementById('btn-group');

/* -------------------------------VARIABLES------------------------------- */
const drawer = new Drawer();


//new CreateDataset().init();
// new TestFeature().start();
// new Loader_n_Trainer().start();
new MergeDataset().init();

/* -------------------------------FUNCTIONS------------------------------- */
function CreateDataset() {
    let btn1 = document.createElement("button");
    btn_group.appendChild(btn1);


    let Y = Trainer.get_train_Y();
    let i = 0;
    let c = 0;
    let max_c = 5;

    drawer.removeAllListeners("drawing");
    drawer.removeAllListeners("timer progress");
    drawer.removeAllListeners("timer end");

    drawer.on("drawing", () => drawer.reset_timer());
    drawer.on("timer_progress", (percent) => drawer.update_progress_timer(percent));
    drawer.on("timer end", () => {
        augment();
        drawer.update_progress_timer(0);
    });

    this.init = () => {
        let input_file = document.createElement('input');
        input_file.type = "file";
        input_file.onchange = (evt) => {
            let files = evt.target.files;
            for (let i = 0; i < files.length; i++) {
                let f = files[i];
                let reader = new FileReader();
                reader.onload = (e) => {
                    let content = e.target.result;
                    if (Trainer.test_file_integrity(content)) {
                        drawer.trainer.dataset.import_dataset(JSON.parse(content));
                    }
                };

                reader.readAsText(f);
            }
        };
        input_file.style.display = "none";

        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Load Dataset";
        btn1.onclick = () => {
            input_file.click();
            start();
        };
        //btn1.parentNode.insertBefore(hiddden_input,btn1.nextSibling);
    };

    let start = () => {
        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Download Dataset";
        btn1.onclick = () => {
            drawer.trainer.dataset.export_n_download();
        };
        draw_new_number()
    };

    let draw_new_number = () => {
        if (i > Y.length - 1) {
            c++;
            i = 0;
        }
        if (c === max_c) {
            drawer.trainer.dataset.export_n_download();
            drawer.trainer.reset();
            return;
        }
        drawer.trainer.reset();
        msg_y.innerText = Y[i];
        drawer.enable();
    };

    let augment = () => {
        drawer.disable();
        drawer.update_progress_train(Math.floor((c * max_c + i + 1) * 100 / (Y.length * max_c))); // ToDo fix this percentage, please
        drawer.trainer.add_X(Y[i]);
        //trainer.augment();
        i++;
        draw_new_number();
    };
}

function MergeDataset() {
    let btn1 = document.createElement('button');
    let btn2 = document.createElement('button');
    let d;

    btn_group.appendChild(btn1);
    btn_group.appendChild(btn2);

    drawer.removeAllListeners("timer progress");
    drawer.removeAllListeners("timer end");

    drawer.on("timer_progress", (percent) => drawer.update_progress_timer(percent));
    drawer.on("timer end", () => {
        drawer.update_progress_timer(0);
    });

    this.init = () => {
        let input_file = document.createElement('input');
        input_file.type = "file";
        input_file.onchange = (evt) => {
            let files = evt.target.files;
            for (let i = 0; i < files.length; i++) {
                let f = files[i];
                let reader = new FileReader();
                reader.onload = (e) => {
                    let content = e.target.result;
                    if (Trainer.test_file_integrity(content)) {
                        d = JSON.parse(content);
                        import_or_not();
                    }
                };
                reader.readAsText(f);
            }
        };
        input_file.style.display = "none";

        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Load Dataset";
        btn1.onclick = () => {
            input_file.click();
        };
    };

    let start = () => {
        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-success";
        btn1.innerText = "Import";
        btn1.onclick = () => {
            // ok
        };
        btn2.hidden = false;
        btn2.disabled = false;
        btn2.className = "btn btn-danger";
        btn2.innerText = "Drop";
        btn2.onclick = () => {
            // dropped
        };
    };

    let import_or_not = (d) => {
        let keys = Object.keys(d);
        let k = 0;
        let i = 0;
        function loop() {
            if (i>=d["0"][i].length) {
                return;
            }
            console.log(d["0"][i]);
            i++;
        }
        loop();

        for (let key in d) {
            for (let i = 0; i < d[key].length; i++) {
                drawer.trainer.import_into_X(d[key].length);

            }
        }
    };
}

function TestFeature() {
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

    /*let old_step2 = () => {
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
    };*/
}

function Loader_n_Trainer() {
    this.start = () => {
        load().then(dataset => {
            drawer.trainer.dataset.import_dataset(dataset);
        });
    };

    let load = () => {
        return new Promise((resolve, reject) => {
            let oReq = new XMLHttpRequest();
            oReq.onload = () => {
                let dataset = JSON.parse(oReq.responseText);
                resolve(dataset);
            };
            oReq.onerror = () => {
                reject("Errore");
            };
            oReq.open("GET", "http://iofurlan.github.io/nn-number-recognizer/dataset/dataset.json");
            oReq.send();
        });
    };

    /*
    * load number by number
    * augment number
    * train each augmented number
    *   |
    *   +---> max_pooling
    *   +---> training
    */

    let step_0 = () => {

    }
}


