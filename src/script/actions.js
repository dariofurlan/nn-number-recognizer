import {Drawer, Trainer} from "./drawer";
import Dataset from "./dataset";
// import * as Plotly from "plotly.js";
const Plotly = require('plotly.js');

const msg_y = document.getElementById('msg-y');
const msg_list = document.getElementById('msg-list');
const btn_group = document.getElementById('btn-group');
const div_stats = document.createElement('div');
msg_list.parentNode.appendChild(div_stats);
const drawer = new Drawer();

/*-------------------------ACTIONS---------------------------*/
drawer.disable();
document.getElementById('canvas-header').hidden = true;

const dataset = new Dataset();

class Pages {
    constructor(root_page) {
        this.pages = [root_page];
        this.actual_page = 0;
    }

    show() {
        // this.pagesTree();
        if (this.pages.length !== 0) {
            if (this.actual_page !== 0) {
                let back = new BtnBase("<- Back", "back");

                back.create();
                back.show_stats = false;
                back.btn.className = "btn btn-warning";
                back.btn.onclick = this.backPage.bind(this);
            }
        }
        this.pages[this.actual_page].createAll();
    }

    addPage(page) {

        this.pages.push(page);
    }

    addElementToPage(pagen, element) {
        this.pages[pagen].add(element);
    }

    nextPage() {
        if (this.actual_page + 1 >= this.pages.length)
            return;
        this.pages[this.actual_page].removeAll();
        this.actual_page++;
        this.show();
    }

    backPage() {
        console.log(this.actual_page);
        if (this.actual_page - 1 < 0)
            return;
        new BtnBase("Back", "back").remove();
        this.pages[this.actual_page].removeAll();
        this.pages.pop();
        this.actual_page--;
        this.show();
    }

    pagesTree() {
        let tree = {};
        this.pages.forEach(page => {
            tree[page.name] = {};
            page.elements.forEach(element => {
                tree[page.name][element.name] = {};
            });
        });

        console.log(JSON.stringify(tree, null, 2));
    }
}

class Page {
    constructor(name, array, onremove) {
        this.elements = [];
        this.name = name;
        this.onremove = onremove;
        if (array.constructor === Array)
            array.forEach(el => this.add(el));
    }

    add(el) {
        this.elements.push(el);
    }

    createAll() {
        this.elements.forEach(el => el.create());
    }

    removeAll() {
        this.elements.forEach(el => el.remove());
        div_stats.innerText = "";
        if (this.onremove)
            this.onremove();
    }
}

class BtnBase {
    constructor(name, id) {
        if (!name || !id) {
            throw Error("Name and/or id not given!");
        }
        this.name = name;
        this.id = id;
        this.btn = document.getElementById(id);
        this.show_stats = true;
        this.keep = true;
    }

    create() {
        if (!this.btn) {
            this.btn = document.createElement('button');
            this.btn.innerText = this.name;
            this.btn.id = this.id;
            this.btn.className = "btn btn-primary";
            this.btn.onclick = this.onclick.bind(this);
            btn_group.appendChild(this.btn);
        }
    }

    onclick() {
        stats();
    }

    remove() {
        if (!this.btn)
            return;
        btn_group.removeChild(this.btn);
        this.btn = null;
    }

    stop() {
        this.keep = false;
    }
}

class Load extends BtnBase {
    constructor() {
        super("Load Dataset", "load");
    }

    create() {
        super.create();
        Trainer.load_file_check(this.btn).then(parsed_content => {
            dataset.empty();
            dataset.import_dataset(parsed_content);
            pages.addPage(new Page("LoadedFile", [new Show(), new Empty(), new Clean(), new Augment(), new Center(), new Limit(), new Download()]));
            pages.nextPage();
            stats();
        });
    }
}

class NewDataset extends BtnBase {
    constructor() {
        super("New Dataset", "new-dataset");
    }

    onclick() {
        pages.addPage(new Page("NewDatasetPage", [new Download()]));
        pages.nextPage();

        this.remove();

        document.getElementById('canvas-header').hidden = false;
        drawer.updateCanvasSize();

        let Y = Trainer.get_train_Y();
        let i = 0;

        drawer.removeAllListeners("drawing");
        drawer.removeAllListeners("timer progress");
        drawer.removeAllListeners("timer end");

        drawer.on("drawing", () => drawer.reset_timer());
        drawer.on("timer_progress", (percent) => drawer.update_progress_timer(percent));
        drawer.on("timer end", () => {
            step_2();
            drawer.update_progress_timer(0);
        });

        let step_1 = () => {
            if (i > Y.length - 1) {
                i = 0;
            }
            drawer.trainer.reset();
            msg_y.innerText = Y[i];
            drawer.enable();
        };

        let step_2 = () => {
            drawer.disable();
            dataset.add(Y[i], drawer.trainer.X);
            i++;
            stats();
            step_1();
        };

        step_1();
    }

    remove() {
        //page1.forEach(value => value.remove());
        super.remove();
    }
}

class Empty extends BtnBase {
    constructor() {
        super("Empty", "empty");
    }

    onclick() {
        dataset.empty();
        super.onclick();
    }
}

class Show extends BtnBase {
    constructor() {
        super("Show", "show");
        console.log(this.keep);
    }

    onclick() {
        pages.addPage(new Page("StopShow", [new StopAll(()=>{this.keep = false})]));
        let loop1 = () => {
            console.log(this);
            if (!this.keep)
                return;
            let epoch = epoch_cursor.fetch();
            if (!epoch)
                return;

            console.info("epoch: " + epoch_cursor.get_current_epoch() + " length: " + epoch.length);
            if (epoch.length > 1) {
                let i = 0;
                let loop2 = () => {
                    if (!this.keep)
                        return;
                    if (i < epoch.length) {
                        drawer.trainer.import_into_X(epoch.X[i]);
                        i++
                    } else {
                        setTimeout(loop1, 500);
                        return;
                    }
                    setTimeout(loop2, 50);
                };
                loop2();
            } else {
                drawer.trainer.import_into_X(epoch.X[0]);
                setTimeout(loop1, 50);
            }

        };
        let epoch_cursor = dataset.get_ordered_cursor();
        loop1();
    }
}

class Center extends BtnBase {
    constructor() {
        super('Center', 'center');
    }

    onclick() {
        dataset.center_dataset();
        super.onclick();
    }
}

class Augment extends BtnBase {
    constructor() {
        super('Augment', 'augment');
    }

    onclick() {
        dataset.augment();
        super.onclick();
    }
}

class Clean extends BtnBase {
    constructor() {
        super('Clean', 'clean');
    }

    onclick() {
        dataset.clean_duplicates();
        super.onclick();
    }
}

class Download extends BtnBase {
    constructor() {
        super('Download', 'Download');
    }

    onclick() {
        dataset.download();
        super.onclick();
    }
}

class Limit extends BtnBase {
    constructor() {
        super('Limit', 'limit');
    }

    onclick() {
        dataset.limit();// todo give  number of lines to limit
        super.onclick();
    }
}

class StopAll extends BtnBase {
    constructor(onstop) {
        super("Stop All", "stop-all");
        this.onstop = onstop;
    }

    onclick() {
        this.onstop();
    }
}

class DatasetOperations extends BtnBase {
    constructor() {
        super("Dataset Operations", "dataset-operations");
    }

    onclick() {
        pages.addPage(new Page("db-operations", [new Load(), new NewDataset()]));
        pages.nextPage();
        super.onclick();
    }
}

const pages = new Pages(new Page("root", [new DatasetOperations()]));
pages.show();


function stats() {
    console.log("stats");
    let stat = {
        num_len: {},
        total_len: 0,
    };
    for (let key in dataset.dataset) {
        stat.num_len[key] = dataset.dataset[key].length;
        stat.total_len += dataset.dataset[key].length;
    }

    div_stats.innerHTML = "";
    div_stats.innerHTML = "<b>Campioni per ciascun numero:</b><br/>";
    for (let key in stat.num_len) {
        div_stats.innerHTML += key + ": " + stat.num_len[key] + "<br/>";
    }
    div_stats.innerHTML += "<b>Numero totale di campioni: </b>" + stat.total_len + "<br/>";
}

function MergeDataset() {
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

function ApproveDataset() {
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

function TestFeature() { // TODO just for dev purpose

    let ds = new Dataset();

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
        drawer.enable();
    };
    // ended drawing: pooling
    let step_1 = () => {
        //console.log("step_1");
        drawer.disable();
        ds.add(0, drawer.trainer.X);
        ds.center_dataset();
        ds.stretch_dataset();
        setTimeout(step_2, 250);
    };
    // test and output
    let step_2 = () => {
        drawer.trainer.import_into_X(ds.dataset[0][0]);
        //step_0();
    };
}

function Loader_n_Trainer() {
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