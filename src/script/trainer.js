import * as EventEmitter from 'events';
import NeuralNetwork from "./neural_network";
import Dataset from './dataset';

const INITIAL_SIZE = 32;
const AFTER_POOL_SIZE = INITIAL_SIZE / 2;
const NUM_NUM = 10;
const HIDDEN_LAYER_SIZE = 10;
const CONV_SIZE = 2;

export default class Trainer extends EventEmitter {
    constructor() {
        super();
        this.dataset = new Dataset();
        this.X = [];
        this.size = INITIAL_SIZE;
        this.reset();
        this.nn = new NeuralNetwork(Math.pow(AFTER_POOL_SIZE, 2), HIDDEN_LAYER_SIZE, NUM_NUM);
    }

    static get_train_Y() {
        return Array.from(Array(NUM_NUM).keys());
    }

    static get_ordered_y() {
        let y = 0;
        if (this.last_y !== undefined && this.last_y < NUM_NUM - 1)
            y = this.last_y + 1;
        this.last_y = y;
        return y;
    }

    static get_test_y() {
        return Math.floor(Math.random() * NUM_NUM);
    }

    static test_file_integrity(content) {
        try {
            let parsed = JSON.parse(content);
            for (let key in parsed) {
                for (let j = 0; j < parsed[key]; j++) {
                    if (parsed[key][j].length !== INITIAL_SIZE*INITIAL_SIZE) {
                        return false;
                    }
                }
            }
        } catch (e) {
            return false;
        }
        return true;
    }

    avg_pooling() {
        if (this.X.length / (CONV_SIZE * CONV_SIZE) < AFTER_POOL_SIZE * AFTER_POOL_SIZE)
            return false;
        let average = (array) => array.reduce((a, b) => a + b) / array.length;
        let convolve = (CONV_SIZE, edge_size, x, y) => {
            let pos = y * edge_size + x;
            let K = [];
            for (let ky = 0, kn = 0; ky < CONV_SIZE; ky++) {
                for (let kx = 0; kx < CONV_SIZE; kx++, kn++) {
                    K[kn] = this.X[pos + ky * edge_size + kx];
                }
            }
            return average(K);
        };

        let edge_size = Math.sqrt(this.X.length);

        let newOut = [];
        newOut.length = this.X.length / (CONV_SIZE * CONV_SIZE);
        let new_edege_size = Math.sqrt(newOut.length);

        for (let y = 0; y < edge_size; y += CONV_SIZE) {
            for (let x = 0; x < edge_size; x += CONV_SIZE) {
                // do the avg of 4 pixels and then assign it to newOut
                let avg = convolve(CONV_SIZE, edge_size, x, y);
                let new_pos = (y) * new_edege_size + x;
                this.X[new_pos / 2] = avg;
            }
        }
        this.X.length = newOut.length;
        this.update();
        return true;
    }

    max_pooling() {
        if (this.X.length / (CONV_SIZE * CONV_SIZE) < AFTER_POOL_SIZE * AFTER_POOL_SIZE)
            return false;
        let max = (array) => {
            return Math.max.apply(null, array)
        };
        let convolve = (CONV_SIZE, edge_size, x, y) => {
            // TODO for now do a simple average, later do with the kernel
            let pos = y * edge_size + x;
            let K = [];
            for (let ky = 0, kn = 0; ky < CONV_SIZE; ky++) {
                for (let kx = 0; kx < CONV_SIZE; kx++, kn++) {
                    K[kn] = this.X[pos + ky * edge_size + kx];
                }
            }
            return max(K);
        };

        let edge_size = Math.sqrt(this.X.length);

        let newOut = [];
        newOut.length = this.X.length / (CONV_SIZE * CONV_SIZE);
        let new_edege_size = Math.sqrt(newOut.length);

        for (let y = 0; y < edge_size; y += CONV_SIZE) {
            for (let x = 0; x < edge_size; x += CONV_SIZE) {
                // do the avg of 4 pixels and then assign it to newOut
                let max = convolve(CONV_SIZE, edge_size, x, y);
                let new_pos = (y) * new_edege_size + x;
                this.X[new_pos / 2] = max;
            }
        }
        this.X.length = newOut.length;
        this.update();
        return true;
    }

    augment() {
        // calculate what types of movements its possible to do
        // do all the combination to obtain more data
        let ns = Math.sqrt(this.X.length);

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
                if (this.X[pos] !== 0) {
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

        let move = (delta_x = 0, delta_y = 0) => {
            const X = this.X.slice();
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

        let original_X = this.X.slice();
        let xl = -delta.x.left;
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
        aa();

        /*for(let xl=-delta.x.left;xl<0;xl++) {
            console.log(xl);
        }*/

        /*move(-delta.x.left,-delta.y.up);
        this.update();*/

        // randomly change opacity
    }

    update() {
        this.emit('update');
    }

    add_X(y) {
        this.dataset.add(y, this.X);
    }

    import_into_X(array) {
        if (array.length !== this.size * this.size)
            throw new Error("Array size doesn't match");
        this.reset();
        for (let i = 0; i < array.length; i++) {
            this.X[i] = array[i];
        }
    }

    test() {
        let prediction = this.nn.test(this.X);
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
        return pred;
    }

    train(y) {
        let Y = [];
        Y.length = NUM_NUM;
        Y.fill(0);
        Y[y] = 1;

        let out = this.nn.train([this.X], [Y]);
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
        return [pred, error];
    } //old one, now do batch training

    reset() {
        this.X.length = this.size * this.size;
        this.X.fill(0);
        this.update();
    }
}