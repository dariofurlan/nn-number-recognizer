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
    // private var
    let augmented = false; // augment only once, twice is not needed and useless

    //public var
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
        for (let num_key in dataset_obj) {
            let num_data = dataset_obj[num_key];
            for (let i = 0; i < num_data.length; i++) {
                this.add(num_key, this._import(num_data[i]));
            }
        }
    };

    this.export_dataset = () => {
        let n_dataset = {};
        for (let key in this.dataset) {
            n_dataset[key] = [];
            for (let i = 0; i < this.dataset[key].length; i++) {
                let exported = this._export(this.dataset[key][i]);
                n_dataset[key][i] = exported;
            }
        }
        return n_dataset;
    };

    this.export_n_download = () => {
        download(JSON.stringify(this.export_dataset()));
    };


    this.clean_duplicates = () => {
        for (let key in this.dataset) {
            for (let i = 0; i < this.dataset[key].length - 1; i++) {
                for (let j = i + 1; j < this.dataset[key].length; j++) {
                    if (array_equals(this.dataset[key][i], this.dataset[key][j])) {
                        console.log("dropped");
                        this.dataset[key].splice(j, 1);
                    }
                }
            }
        }
    };

    let array_equals = (arr1, arr2) => {
        return arr1.every((value, index) => value === arr2[index]);
    };

    // augmentation part

    let calculate_figure_bounds = (ns, X) => {
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
        return {bounds:bound, delta:delta};
    };

    let move = (ns, X, delta_x = 0, delta_y = 0) => {
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

    this.augment = () => {
        for (let key in this.dataset) {
            for (let i=0;i<this.dataset[key].length;i++) {
                // ns
                let X = this.dataset[key][i];
            }
        }

        let ns = Math.sqrt(this.X.length);
        let {bounds, delta} = calculate_figure_bounds(ns);


        let original_X = this.X.slice();
        let xl = -delta.x.left;
        let xr = delta.x.right;
        let aa = () => {
            if (xl >= 0)
                return;
            console.log(xl);
            this.import_into_X(original_X);
            let new_X = move(xl, 0);
            this.import_into_X(new_X);
            this.update();
            xl++;
            setTimeout(aa, 500);
        };
        for (let y = -delta.y.up; y <= delta.y.down; y++) {
            if (y === 0)
                continue;
            for (let x = -delta.x.left; x <= delta.x.right; x++) {
                if (x === 0)
                    continue;
                this.import_into_X(original_X);
                let new_X = move(x, y);
                this.import_into_X(new_X);
                this.dataset.add(9, new_X);
                this.update();
            }
        }
    };
}

/*
const dt = new Dataset();
dt.add(0, [0,0,0]);
dt.add(0, [1,1,1]);
dt.add(0,[0,0,0]);

console.log(dt.export_dataset());

dt.clean_duplicates();

console.log(dt.export_dataset());*/
