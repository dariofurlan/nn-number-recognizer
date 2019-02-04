/*
new dataset
merge dataset
approve dataset
clean duplicates todo do this in the dataset.js
show dataset
test feature
load_n_train
*/
import {Drawer, Trainer} from "./drawer";

const msg_y = document.getElementById('msg-y');
const msg_list = document.getElementById('msg-list');
const btn_group = document.getElementById('btn-group');
const drawer = new Drawer();


/*------------------------FUNCTIONS--------------------------*/

function load_dataset() {
    return new Promise(resolve => {
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
                        callback(JSON.parse(content));
                    }
                };
                reader.readAsText(f);
            }
        };
        input_file.style.display = "none";
    });
} // TODO see if it's worth it


/*-------------------------ACTIONS---------------------------*/
export function NewDataset() {
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
        step2();
        drawer.update_progress_timer(0);
    });

    this.start = () => {
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
            step_0();
        };
        //btn1.parentNode.insertBefore(hiddden_input,btn1.nextSibling);
    };

    let step_0 = () => {
        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Download Dataset";
        btn1.onclick = () => {
            drawer.trainer.dataset.export_n_download();
        };
        step_1()
    };

    let step_1 = () => {
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

    let step2 = () => {
        drawer.disable();
        drawer.update_progress_train(Math.floor((c * max_c + i + 1) * 100 / (Y.length * max_c))); // ToDo fix this percentage, please
        drawer.trainer.add_X(Y[i]);
        //trainer.augment();
        i++;
        step_1();
    };
}

export function ApproveDataset() {
    let btn1 = document.createElement('button');
    let btn2 = document.createElement('button');
    let d;

    btn_group.appendChild(btn1);

    drawer.removeAllListeners("timer progress");
    drawer.removeAllListeners("timer end");

    drawer.on("timer_progress", (percent) => drawer.update_progress_timer(percent));
    drawer.on("timer end", () => {
        drawer.update_progress_timer(0);
    });
    drawer.disable();
    document.getElementById('canvas-header').hidden = true;

    this.start = () => {
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

    let import_or_not = () => {
        btn_group.appendChild(btn2);
        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-success";
        btn1.innerText = "Import";

        btn2.hidden = false;
        btn2.disabled = false;
        btn2.className = "btn btn-danger";
        btn2.innerText = "Skip";
        let k = 0;
        let i = 0;

        function loop() {
            if (i >= d[k].length) {
                i = 0;
                k++;
            }
            if (k >= Object.keys(d).length) {
                btn1.hidden = false;
                btn1.disabled = false;
                btn1.className = "btn btn-outline-primary";
                btn1.innerText = "Download Dataset";
                btn1.onclick = () => {
                    drawer.trainer.dataset.export_n_download();
                };
                btn_group.removeChild(btn2);
                return;
            }
            let imported = drawer.trainer.dataset._import(d[k][i]);
            drawer.trainer.import_into_X(imported);
            drawer.trainer.update();
            btn1.onclick = () => {
                drawer.trainer.dataset.add(k, imported);
                loop();
            };
            btn2.onclick = () => {
                loop();
            };
            i++;
        }

        loop();
    };
}

export function MergeDataset() {
    let btn1 = document.createElement('button');
    btn_group.appendChild(btn1);

    let file1 = "";
    let file2 = "";
    this.start = () => {
        load_file1();
    };

    let load_file1 = () => {
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
                        file1 = JSON.parse(content);
                    }
                };
                reader.readAsText(f);
            }
        };
        input_file.style.display = "none";

        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Load Dataset 1";
        btn1.onclick = () => {
            input_file.click();
            load_file2();
        };
    };

    let load_file2 = () => {
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
                        file2 = JSON.parse(content);
                        merge();
                    }
                };
                reader.readAsText(f);
            }
        };
        input_file.style.display = "none";

        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Load Dataset 2";
        btn1.onclick = () => {
            input_file.click();
        };
    };

    let merge = () => {
        btn_group.removeChild(btn1);
        if (file1 !== "" && file2 !== "") {
            drawer.trainer.dataset.import_dataset(file1);
            drawer.trainer.dataset.import_dataset(file2);
            console.log("merged");
            drawer.trainer.dataset.export_n_download();
        }
    };
}

export function TestFeature() {
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

export function Loader_n_Trainer() {
    document.getElementById('canvas-header').hidden = true;

    this.start = () => {
        load().then(dataset => {
            drawer.trainer.dataset.import_dataset(dataset);
            step_0();
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
        // augment
    };

    let step_1 = () => {
        // train
    };
}