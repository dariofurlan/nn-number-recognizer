import NeuralNetwork from "./neural_network";

const Plotly = require('plotly.js');

// todo center all the data
// todo zoom all the data so that it fits onto the full matrix

function download(text) {
    let element = document.createElement('a');
    let date = new Date().toISOString().replace(/:/g, "-");
    let filename = "dataset_" + date;
    filename += ".json";
    console.log(filename);
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

export default function Dataset() {
    let augmented = false; // augment only once, twice is not needed and useless
    this.dataset = {};

    this._export = (arr) => {
        return arr.join("");
    };
    this._import = (array_str) => {
        return array_str.split("").map(Number);
    };
    this._center = (X) => {
        let ns = Math.sqrt(X.length);
        let bounds = calculate_figure_bounds(X, ns);
        let dx = Math.floor((bounds.delta.x.right - bounds.delta.x.left) / 2);
        let dy = Math.floor((bounds.delta.y.down - bounds.delta.y.up) / 2);
        return this._move(X, ns, dx, dy);
    };
    this._move = (X, ns, delta_x = 0, delta_y = 0) => {
        if (delta_x === 0 && delta_y === 0)
            return X;
        let loop_y = {
            start: (delta_y > 0) ? (ns - 1) : 0,
            condition: (delta_y > 0) ? (y) => {
                return y >= 0
            } : (y) => {
                return y < ns
            },
            border_check: (delta_y > 0) ? (y) => {
                return y + delta_y > (ns - 1)
            } : (y) => {
                return y + delta_y < 0
            },
            inc: (delta_y > 0) ? -1 : +1,
        };
        let loop_x = {
            start: (delta_x > 0) ? (ns - 1) : 0,
            condition: (delta_x > 0) ? (x) => {
                return x >= 0
            } : (x) => {
                return x < ns
            },
            border_check: (delta_x > 0) ? (x) => {
                return x + delta_x > (ns - 1)
            } : (x) => {
                return x + delta_x < 0
            },
            inc: (delta_x > 0) ? -1 : +1,
        };
        for (let y = loop_y.start; loop_y.condition(y); y += loop_y.inc) {
            for (let x = loop_x.start; loop_x.condition(x); x += loop_x.inc) {
                let pos = (y * ns) + x;
                if (X[pos] === 0)
                    continue;
                if (delta_x !== 0) {
                    if (loop_x.border_check(x)) {
                        X[pos] = 0;
                    } else {
                        X[pos + delta_x] = X[pos];
                        X[pos] = 0;
                        pos += delta_x;
                    }
                }
                if (delta_y !== 0) {
                    if (loop_y.border_check(y)) {
                        X[pos] = 0;
                    } else {
                        X[pos + (delta_y * ns)] = X[pos];
                        X[pos] = 0;
                    }
                }
            }
        }
        return X;
    };

    this.add = (y, X) => {
        if (y === undefined)
            throw new Error("y can't be undefined");
        if (this.dataset[y] === undefined) {
            this.dataset[y] = [];
        }
        this.dataset[y].push(X.slice());
    };
    this.import_dataset = (dataset_obj) => {
        for (let key in dataset_obj) {
            if (dataset_obj.hasOwnProperty(key))
                for (let i = 0; i < dataset_obj[key].length; i++) {
                    this.add(key, this._import(dataset_obj[key][i]));
                }
        }
    };
    this.export_dataset = () => {
        let exported_dataset = {};
        for (let key in this.dataset) {
            exported_dataset[key] = [];
            for (let i = 0; i < this.dataset[key].length; i++) {
                exported_dataset[key][i] = this._export(this.dataset[key][i]);
            }
        }
        return exported_dataset;
    };
    this.download = () => {
        download(JSON.stringify(this.export_dataset()));
    };
    this.clean_duplicates = () => {
        for (let key in this.dataset) {
            if (this.dataset.hasOwnProperty(key))
                for (let i = 0; i < this.dataset[key].length - 1; i++) {
                    for (let j = i + 1; j < this.dataset[key].length; j++) {
                        if (array_equals(this.dataset[key][i], this.dataset[key][j])) {
                            console.log("dropped");
                            this.dataset[key].splice(i, 1);
                        }
                    }
                }
        }
    };
    this.center_dataset = () => {
        let cursor = this.get_ordered_cursor();
        let epoch;
        while ((epoch = cursor.fetch())) {
            for (let i = 0; i < epoch.length; i++) {
                this._center(epoch.X[i]);
            }
        }
    };
    this.flatten_dataset = () => {
        const flattened_dataset = {X: [], Y: [], length: 0};
        let y_size = Object.keys(this.dataset).length;
        for (let key in this.dataset) {
            flattened_dataset.X.push(...this.dataset[key]);
            let Ys = new Array(this.dataset[key].length).fill(key);
            Ys.forEach((value, index, array) => {
                let Y = new Array(y_size).fill(0);
                Y[key] = 1;
                array[index] = Y;
            });
            flattened_dataset.Y.push(...Ys);
            flattened_dataset.length += this.dataset[key].length;
        }
        return flattened_dataset;
    };
    this.shuffle_dataset = () => {
        const shuffled_dataset = this.flatten_dataset();
        for (let i = shuffled_dataset.X.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled_dataset.X[i], shuffled_dataset.X[j]] = [shuffled_dataset.X[j], shuffled_dataset.X[i]];
            [shuffled_dataset.Y[i], shuffled_dataset.Y[j]] = [shuffled_dataset.Y[j], shuffled_dataset.Y[i]];
        }
        return shuffled_dataset
    };
    this.get_ordered_cursor = (num_epochs) => {
        return new Cursor(this.flatten_dataset(), num_epochs);
    };
    this.get_random_cursor = (num_epochs) => {
        return new Cursor(this.shuffle_dataset(), num_epochs);
    };
    this.empty = () => {
        for (let key in this.dataset) {
            this.dataset[key] = [];
        }
    };
    let array_equals = (arr1, arr2) => {
        return arr1.every((value, index) => value === arr2[index]);
    };

    /* ----------------------AUGMENTATION---------------------- */
    let calculate_figure_bounds = (X, ns) => {
        let bound = {
            x: {
                min: ns,
                max: 0
            }, y: {
                min: ns,
                max: 0
            }
        };
        for (let y = ns - 1; y >= 0; y--) {
            for (let x = ns - 1; x >= 0; x--) {
                let pos = (y * ns) + x;
                if (X[pos] !== 0) {
                    if (x > bound.x.max)
                        bound.x.max = x;
                    if (x < bound.x.min)
                        bound.x.min = x;
                    if (y > bound.y.max)
                        bound.y.max = y;
                    if (y < bound.y.min)
                        bound.y.min = y;
                }
            }
        }
        let max = ns - 1;
        let delta = {
            x: {
                right: max - bound.x.max,
                left: bound.x.min
            }, y: {
                down: max - bound.y.max,
                up: bound.y.min
            }
        };
        return {bounds: bound, delta: delta};
    };
    let all_possible_movements = (y, X) => {
        const new_dataset = [];
        const ns = Math.sqrt(X.length);
        const {delta} = calculate_figure_bounds(X, ns);
        for (let dy = -delta.y.up; dy <= delta.y.down; dy++) {
            for (let dx = -delta.x.left; dx <= delta.x.right; dx++) {
                if (dx === 0 && dy === 0)
                    continue;
                let new_X = this._move(X.slice(), ns, dx, dy);
                new_dataset.push(this._export(new_X));
            }
        }
        return new_dataset;
    };
    this.augment = () => {
        if (augmented)
            throw new Error("Already Augmented");
        let new_dataset = {};
        for (let key in this.dataset) {
            new_dataset[key] = [];
            for (let i = 0; i < this.dataset[key].length; i++) {
                const X = this.dataset[key][i];
                all_possible_movements(key, X).forEach(value => new_dataset[key].push(value));
            }
        }
        this.import_dataset(new_dataset);
        augmented = true;
    };
    this.limit = (limit = 200) => {
        for (let key in this.dataset) {
            if (this.dataset[key].length > limit) {
                while (this.dataset[key].length > limit) {
                    let ran = Math.floor(Math.random() * this.dataset[key].length);
                    this.dataset[key].splice(ran, 1);
                }
            }
        }
    };

    /* ----------------------AUGMENTATION---------------------- */
    this.train = () => {
        // TODO  creare un array con il dataset a random
        // TODO  per ogni X il rispettivo Y
        // TODO  avviare l'allenamento in batch, stabilire quindi la dimensione di una batch, ogni tanto aggiornare la grafica con un callback
        // TODO  magari all'inizio aggiornarla ad ogni step, deve essere quindi flessibile
        // TODO  nella fase di allenamento bisogna fare il max_pooling di ogni valore
    }
}

function Cursor(ds, num_epochs) {
    const dataset = ds;
    let i = 0;

    if (!num_epochs || num_epochs < 1 || num_epochs > dataset.length)
        num_epochs = dataset.X.length;

    let batch_size = Math.floor(dataset.X.length / num_epochs);
    console.info("Batch size setted to: " + batch_size);
    if (dataset.X.length % num_epochs !== 0) {
        console.warn("Batch size rounded to " + batch_size + " because dataset's length is not multiple of number of epochs");
    }

    this.fetch = () => {
        if (i >= dataset.X.length)
            return;

        let X = dataset.X.slice(i, i + batch_size);
        let Y = dataset.Y.slice(i, i + batch_size);
        i += batch_size;
        return {X: X, Y: Y, length: batch_size};
    };
    this.get_batch_size = () => {
        return batch_size;
    };

    this.get_current_epoch = () => {
        return i / batch_size
    }
}

function pretest() {
    dt = new Dataset();
    nn = new NeuralNetwork(2, 3, 2);
    setTimeout(test, 200);
}

let dt;
let nn;

// pretest();
function test() {
    let tracesW1 = [];
    let tracesW2 = [];
    nn.W1.map((row, i) => {
        row.map((weight, ii) => {
            let trace = {
                y: [weight],
                x: [0],
                name: 'W' + (i + 1) + '-' + (ii + 1),
                mode: 'line'
            };
            tracesW1.push(trace);
        });
    });
    nn.W2.map((row, i) => {
        row.map((weight, ii) => {
            let trace = {
                y: [weight],
                x: [0],
                name: 'W' + (i + 1) + '-' + (ii + 1),
                type: 'line'
            };
            tracesW2.push(trace);
        });
    });
    let error_trace = {
        y: [],
        x: [],
        name: "Error",
        type: 'line'
    };
    Plotly.newPlot('graph-W1', tracesW1, {title: "Weights Input->Hidden"}, {responsive: true});
    Plotly.newPlot('graph-W2', tracesW2, {title: "Weights Hidden->Output"}, {responsive: true});
    Plotly.newPlot('graph-error', [error_trace], {title: "Total Error"}, {responsive: true});

    for (let i = 0; i < 1; i++) {
        dt.add(0, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        dt.add(1, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        dt.add(2, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    //train();
}

function train() {

    const cursor = dt.get_random_cursor();


    let epoch;
    let x = 1, e = 0;
    while ((epoch = cursor.fetch())) {
        //console.log(row);
        console.info("epoch: " + cursor.get_current_epoch());
        let y = [];

        let out = nn.train(epoch.X, epoch.Y);
        let ext = {
            y: [],
            x: []
        };
        let n = [];
        x++;
        nn.W1.map((row, i) => {
            row.map((weight, ii) => {
                ext.y.push([weight]);
                ext.x.push([x]);
                n.push(n.length);
            });
        });
        let ext2 = {
            y: [],
            x: []
        };
        let n2 = [];
        nn.W2.map((row, i) => {
            row.map((weight, ii) => {
                ext2.y.push([weight]);
                ext2.x.push([x]);
                n2.push(n2.length);
            });
        });
        let ext_error = {
            y: [[out.error]],
            x: [[e]]
        };
        Plotly.extendTraces('graph-W1', ext, n);
        Plotly.extendTraces('graph-W2', ext2, n2);
        Plotly.extendTraces('graph-error', ext_error, [0]);
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
        console.info("X: " + JSON.stringify(epoch.X) + "real :" + JSON.stringify(epoch.Y));
        console.info("prediction: " + JSON.stringify(pred));
        console.info("error: " + JSON.stringify(error));
        console.log();
    }

    function calc_pred(prediction, expected) {
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
        console.log("expected: " + expected + " got: " + Math.round(pred[0].number) + "(" + Math.round(pred[0].accuracy * 10000) / 100 + "%)");
    }

    calc_pred(nn.test([1, 1]), 1);
    calc_pred(nn.test([1, 0]), 0);
    calc_pred(nn.test([0, 1]), 0);
    calc_pred(nn.test([0, 0]), 0);
}

// pretest();