import {Drawer, Trainer} from "./drawer";
import Dataset from "./dataset";
// import * as Plotly from "plotly.js";
const Plotly = require('plotly.js');

const msg_y = document.getElementById('msg-y');
const msg_list = document.getElementById('msg-list');
const btn_group = document.getElementById('btn-group');
const drawer = new Drawer();

/*-------------------------ACTIONS---------------------------*/
drawer.disable();
document.getElementById('canvas-header').hidden = true;

export function ShowDataset() {
    let btn1 = document.createElement("button");
    btn_group.appendChild(btn1);

    let loaded_ds = new Dataset();

    this.start = () => {
        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Load Dataset";
        Trainer.load_file_check(btn1).then(parsed_content => {
            ;
            loaded_ds.import_dataset(parsed_content);
            btn1.outerHTML = "";
            stats(parsed_content);
        });
    };

    let stats = (loaded) => {
        const div_stats = document.createElement('div');
        msg_list.parentNode.appendChild(div_stats);

        let stat = {
            num_len: {},
            total_len: 0,
        };
        for (let key in loaded) {
            stat.num_len[key] = loaded[key].length;
            stat.total_len += loaded[key].length;
        }
        div_stats.innerHTML = "<b>Campioni per ciascun numero</b><br/>";
        for (let key in stat.num_len) {
            div_stats.innerHTML += key + ": " + stat.num_len[key] + "<br/>";
        }
        div_stats.innerHTML += "<b>Numero totale di campioni: </b>" + stat.total_len + "<br/>";
        step_0();
    };

    let step_0 = () => {
        let ab = () => {
            let epoch = epoch_cursor.fetch();
            if (!epoch)
                return;

            console.info("epoch: " + epoch_cursor.get_current_epoch() + " length: " + epoch.length);
            if (epoch.length > 1) {
                let i = 0;
                let ac = () => {
                    if (i < epoch.length) {
                        drawer.trainer.import_into_X(epoch.X[i]);
                        drawer.trainer.max_pooling();
                        i++
                    } else {
                        setTimeout(ab, 1000);
                        return;
                    }
                    setTimeout(ac, 50);
                };
                ac();
            } else {
                drawer.trainer.import_into_X(epoch.X[0]);
                drawer.trainer.max_pooling();
                setTimeout(ab, 100);
            }

        };
        let epoch_cursor = loaded_ds.get_ordered_cursor(10);
        ab();
    };
}

export function AugmentDataset() {
    let btn1 = document.createElement("button");
    alert("browser may slow down, or even exit!");
    btn_group.appendChild(btn1);

    let loaded_ds = new Dataset();

    this.start = () => {
        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Load Dataset";
        Trainer.load_file_check(btn1).then(parsed_content => {
            loaded_ds.import_dataset(parsed_content);
            btn1.outerHTML = "";
            step_0();
        });
    };

    let step_0 = () => {
        console.log("augmenting");
        loaded_ds.augment();
        console.log("limiting");
        loaded_ds.limit(500);
        console.log("downloading...");
        loaded_ds.download();
    };
}

export function NewDataset() {
    document.getElementById('canvas-header').hidden = false;
    drawer.updateCanvasSize();
    let btn1 = document.createElement("button");
    btn_group.appendChild(btn1);

    let ds = new Dataset();

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
        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Load Dataset";
        Trainer.load_file_check(btn1).then(parsed_content => {
            ds.import_dataset(parsed_content);
            step_0();
        });
    };

    let step_0 = () => {
        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Download Dataset";
        btn1.onclick = () => {
            ds.download();
        };
        step_1()
    };

    let step_1 = () => {
        if (i > Y.length - 1) {
            c++;
            i = 0;
        }
        if (c === max_c) {
            drawer.trainer.reset();
            ds.download();
            return;
        }
        drawer.trainer.reset();
        msg_y.innerText = Y[i];
        drawer.enable();
    };

    let step2 = () => {
        drawer.disable();
        drawer.update_progress_train(Math.floor((c * max_c + i + 1) * 100 / (Y.length * max_c))); // ToDo fix this percentage, please
        ds.add(Y[i], drawer.trainer.X);
        //trainer.augment();
        i++;
        step_1();
    };
}

export function MergeDataset() {
    let btn1 = document.createElement('button');
    btn_group.appendChild(btn1);

    let file1 = null;
    let file2 = null;
    this.start = () => {
        load_file1();
    };

    let load_file1 = () => {
        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Load Dataset 1";
        Trainer.load_file_check(btn1).then((parsed_content) => {
            file1 = parsed_content;
            load_file2();
        });
    };

    let load_file2 = () => {
        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Load Dataset 2";
        Trainer.load_file_check(btn1).then((parsed_content) => {
            file2 = parsed_content;
            merge();
        });
    };

    let merge = () => {
        btn_group.removeChild(btn1);
        if (file1 && file2) {
            drawer.trainer.dataset.import_dataset(file1);
            drawer.trainer.dataset.import_dataset(file2);
            console.log("merged");
            drawer.trainer.dataset.clean_duplicates();
            drawer.trainer.dataset.download();
        } else {
            console.log(file1);
            console.log(file2);
        }
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
        btn1.hidden = false;
        btn1.disabled = false;
        btn1.className = "btn btn-outline-primary";
        btn1.innerText = "Load Dataset";
        Trainer.load_file_check(btn1).then((parsed_content) => {
            d = parsed_content;
            import_or_not();
        });
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
                    drawer.trainer.dataset.download();
                };
                btn_group.removeChild(btn2);
                return;
            }
            let imported = drawer.trainer.dataset._import(d[k][i]);
            msg_list.innerHTML = "This should be a: <h1>" + k + "</h1>";
            drawer.trainer.import_into_X(imported);
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

export function TestFeature() { // TODO just for dev purpose
    let y;

    let trace1 = {x: [1, 2, 3, 4], y: [1, 2, 3, 4], type: 'scatter', name: 'Error'};
    let trace2 = {x: [1, 2, 3, 4], y: [2, 3, 4, 5], type: 'scatter'};

    let ds;

    document.getElementById('canvas-header').hidden = true;
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
        ds.add(y, drawer.trainer.X);
        ds.augment();
        //setTimeout(step_2, 250);
    };
    // test and output
    let step_2 = () => {
        step_0();
    };
}

export function Loader_n_Trainer() {
    let dataset = new Dataset;
    let nn = drawer.trainer.nn;
    let e = 0, x = 1;

    this.start = () => {
        Trainer.remote_load().then(parsed => {
            dataset.import_dataset(parsed);
            console.info("Browser may slow down: Augmenting...");
            dataset.augment();
            dataset.limit(100);
            prepare();
        }).catch(reason => console.error(reason));
    };
    // train
    let prepare = () => {
        let tracesW1 = [];
        let tracesW2 = [];
        /*nn.W1.map((row, i) => {
            row.map((weight, ii) => {
                let trace = {
                    y:[weight],
                    x:[0],
                    name: 'W'+(i+1)+'-'+(ii+1),
                    mode: 'line'
                };
                tracesW1.push(trace);
            });
        });*/
        /*nn.W2.map((row, i) => {
            row.map((weight, ii) => {
                let trace = {
                    y:[weight],
                    x:[0],
                    name: 'W'+(i+1)+'-'+(ii+1),
                    type:'line'
                };
                tracesW2.push(trace);
            });
        });*/
        /*let error_trace = [];
        for (let i = 0; i < nn.outputLayerSize; i++) {
            error_trace.push({
                y: [],
                x: [],
                name: "Error - " + i,
                type: 'line',
                line: {
                    width: 1
                }
            });
        }*/
        let error_trace = [{
            y: [],
            x: [],
            name: "Error",
            type: 'line',
            line: {
                width: 1
            }
        }];
        // Plotly.newPlot('graph-W1', tracesW1, {title:"Weights Input->Hidden"}, {responsive:true});
        // Plotly.newPlot('graph-W2', tracesW2, {title:"Weights Hidden->Output"}, {responsive:true});
        Plotly.newPlot('graph-error', error_trace, {title: "Avg Error"}, {responsive: true});
        step_0();
    };

    let step_0 = () => {
        let train_step = (X, Y) => {
            drawer.trainer.import_into_X(X);
            drawer.trainer.max_pooling();

            let out = nn.train([drawer.trainer.X], [Y]);
            let ext = {
                y: [],
                x: []
            };
            let n = [];
            x++;
            /*nn.W1.map((row) => {
                row.map((weight) => {
                    ext.y.push([weight]);
                    ext.x.push([x]);
                    n.push(n.length);
                });
            });*/
            let ext2 = {
                y: [],
                x: []
            };
            let n2 = [];
            /*nn.W2.map((row) => {
                row.map((weight) => {
                    ext2.y.push([weight]);
                    ext2.x.push([x]);
                    n2.push(n2.length);
                });
            });*/

            /*let ext_error = {
                y:[],
                x:[]
            };
            let ne = [];
            for (let i=0; i<nn.outputLayerSize;i++) {
                ext_error.y.push([out.error[0][i]]);
                ext_error.x.push([e]);
                ne.push(ne.length);
            }*/
            const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
            let ext_error = {
                y: [[average(out.error[0])]],
                x: [[e]]
            };
            let ne = [0];
            //Plotly.extendTraces('graph-W1', ext, n);
            //Plotly.extendTraces('graph-W2', ext2, n2);
            Plotly.extendTraces('graph-error', ext_error, ne);
            e++;
            x++;

            let prediction = out.prediction[0];
            let error = out.error;


            let pred = [];
            for (let i = 0; i < prediction.length; i++) {
                pred[i] = {
                    number: i,
                    accuracy: prediction[i]
                };
            }

            // sort the other array
            for (let i = 0; i < pred.length - 1; i++) {
                for (let j = i + 1; j < pred.length; j++) {
                    if (pred[i].accuracy < pred[j].accuracy) {
                        let s = pred[i];
                        pred[i] = pred[j];
                        pred[j] = s;
                    }
                }
            }

            console.info("prediction: " + JSON.stringify(pred));
            console.info("error: " + JSON.stringify(error));
            console.log();
        };
        let ab = () => {
            let epoch = epoch_cursor.fetch();
            if (!epoch) {
                step_1();
                return;
            }
            // console.clear(); // todo check if is needed
            console.info("epoch: " + epoch_cursor.get_current_epoch() + " length: " + epoch.length);
            if (epoch.length > 1) {
                let i = 0;
                let ac = () => {
                    if (i < epoch.length) {
                        train_step(epoch.X[i], epoch.Y[i]);
                        i++
                    } else {
                        setTimeout(ab, 500);
                        return;
                    }
                    setTimeout(ac, 50);
                };
                ac();
            } else {
                train_step(epoch.X[0], epoch.Y[0]);
                setTimeout(ab, 50);
            }
        };
        let epoch_cursor = dataset.get_random_cursor();
        ab();

        /*let dt = drawer.trainer.dataset;
        /!*Object.keys(dataset).map(function(num_key, j){
            let nums = dataset[num_key];
            nums.map(function(value, i) {
                let X = nums[i];
            });
        });*!/
        for (let key in dt.dataset) {
            for (let i = 0; i < dt.dataset[key].length; i++) {
                drawer.trainer.import_into_X(dt.dataset[key][i]);
                drawer.trainer.update();
                drawer.trainer.max_pooling();
                let {pred, error} = drawer.trainer.train(key);
                //error = Math.round(error * 1000000) / 10000;
                msg_list.innerHTML = "";
                for (let i = 0; i < pred.length; i++) {
                    let acc = Math.round(pred[i].accuracy * 1000000) / 10000;
                    msg_list.innerHTML += pred[i].number + ") " + acc + "<br/>";
                }
                let acc = Math.round(pred[0].accuracy * 10000) / 100;
                let best_pred = pred[0].number;
                msg_list.innerHTML = "al <b>" + acc + "</b>% il numero disegnato è: <b>" + best_pred + "</b>";
                msg_list.innerHTML += "<br/>Errore: <b>" + error + "</b>";
                console.log("k:" + key + ":" + error);
            }
        }
        step_1();*/
    };

    // test
    drawer.on("drawing", () => drawer.reset_timer());
    drawer.on("timer_progress", (percent) => drawer.update_progress_timer(percent));
    drawer.on("timer end", () => {
        step_2();
        drawer.update_progress_timer(0);
    });

    let step_1 = () => {
        drawer.trainer.reset();
        drawer.enable();
    };
    let step_2 = () => {
        drawer.disable();
        drawer.trainer.max_pooling();
        let pred = drawer.trainer.test();
        msg_list.innerText = JSON.stringify(pred);
        console.log(pred);
        step_1();
        //setTimeout(step_2, 250);
    };
}