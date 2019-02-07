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

//TODO  functions that loop through the dataset in order and randomly with a thing similar to the "fetch_assoc"
//TODO  so it will be while(let res = dataset.fetch...) {[...]}
//TODO  in the random loop it must take care of all the previously choosen randomly numbers

export default function Dataset() {
    let augmented = false; // augment only once, twice is not needed and useless
    this.dataset = {};

    this._export = (arr) => {
        return arr.join("");
    };
    this._import = (array_str) => {
        return array_str.split("").map(Number);
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
    this.get_ordered_cursor = () => {
        return new DatasetCursor(this.dataset);
    };
    this.get_random_cursor = () => {
        return new DatasetRandomCursor(this.dataset);
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
    let move = (X, ns, delta_x = 0, delta_y = 0) => {
        const nX = X.slice();
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
                if (nX[pos] === 0)
                    continue;
                if (delta_x !== 0) {
                    if (loop_x.border_check(x)) {
                        nX[pos] = 0;
                    } else {
                        nX[pos + delta_x] = nX[pos];
                        nX[pos] = 0;
                        pos += delta_x;
                    }
                }
                if (delta_y !== 0) {
                    if (loop_y.border_check(y)) {
                        nX[pos] = 0;
                    } else {
                        nX[pos + (delta_y * ns)] = nX[pos];
                        nX[pos] = 0;
                    }
                }
            }
        }
        return nX;
    };
    let all_possible_movements = (y, X) => {
        const new_dataset = [];
        const ns = Math.sqrt(X.length);
        const {delta} = calculate_figure_bounds(X, ns);
        for (let dy = -delta.y.up; dy <= delta.y.down; dy++) {
            for (let dx = -delta.x.left; dx <= delta.x.right; dx++) {
                if (dx === 0 && dy === 0)
                    continue;
                let new_X = move(X, ns, dx, dy);
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
        this.download();
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

function DatasetCursor(ds) {
    const dataset = ds;
    let KEYS = Object.keys(dataset);
    let k = 0;
    let i = 0;

    this.fetch = () => {
        if (i >= dataset[KEYS[k]].length) {
            k++;
            i = 0;
        }
        if (k >= KEYS.length)
            return;
        let ret = dataset[KEYS[k]][i];
        if (i < dataset[KEYS[k]].length) {
            i++;
        }
        return ret;
    };
}

function DatasetRandomCursor(ds) {
    const dataset = ds;

    let KEYS = Object.keys(dataset);
    let k = 0;
    let i = 0;

    let already_fetched = {};
    KEYS.forEach(value => {
        already_fetched[value] = [];
        already_fetched[value].length = dataset[value].length;
    });

    let random_pair = () => {
        let _k,_i;
        do {
            _k = Math.floor(Math.random() * KEYS.length);
            _i = Math.floor(Math.random() * dataset[KEYS[_k]].length);
        } while (already_fetched[KEYS[_k]][_i]);
        already_fetched[KEYS[_k]][_i] = true;
        return {k: _k,i: _i};
    };

    this.fetch = () => {
        if (i >= dataset[KEYS[k]].length) {
            k++;
            i = 0;
        }
        if (k >= KEYS.length)
            return;
        let ret = random_pair();
        console.log(already_fetched);
        if (i < dataset[KEYS[k]].length) {
            i++;
        }
        return ret;
        // random k random i then put add it to already fetched if doesn't exist yet, if it exist recalculate
    }
}

const dt = new Dataset();

dt.add("0", [1,1,0,0]);
dt.add("0", [1,0,1,0]);
dt.add( 1, [0,0,0,0]);
dt.add(1, [1,0,0,0]);
dt.add(1, [0,1,0,0]);

// console.log(dt.export_dataset());

const cursor = dt.get_random_cursor();
for (let row=cursor.fetch();row;row=cursor.fetch()) {
    // console.log(row);
}

// console.log(dt.export_dataset());
