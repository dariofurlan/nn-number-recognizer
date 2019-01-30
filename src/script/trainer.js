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


        console.log(bound);
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
        console.log(delta);

        // moveX
        let move_right = (delta) => {
            if (delta === 0)
                return;
            let coll = {top: false, bottom: false, left: false, right: false};
            for (let y = 0; y < ns; y++) {
                for (let x = ns - 1; x >= 0; x--) {
                    let pos = (y * ns) + x;
                    if (this.X[pos] === 0)
                        continue;
                    if (x === ns - 1 || x + delta < 0 || x + delta > ns) {
                        // sono a destra
                        this.X[pos] = 0;
                    } else {
                        // posso spostarmi tranquillamente a destra
                        this.X[pos + delta] = this.X[pos];
                        this.X[pos] = 0;
                    }
                }
            }
        };
        let move_left = (delta) => {
            if (delta===0)
                return;
            let coll = {top: false, bottom: false, left: false, right: false};
            for (let y = 0; y < ns; y++) {
                for (let x = 0; x < ns; x++) {
                    let pos = (y * ns) + x;
                    if (this.X[pos] === 0)
                        continue;
                    if (x === 0 || x + delta < 0 || x + delta > ns) {
                        this.X[pos] = 0;
                    } else {
                        this.X[pos + delta] = this.X[pos];
                        this.X[pos] = 0;
                    }
                }
            }
        };
        let move_up = (delta) => {
        };


        /*for (let x_l = -delta.x.left; x_l < 0; x_l++) {
            console.log(x_l);
            move_left(x_l);
            this.update();
        }*/

        /*let moveY = () => {
            if (pos <= (ns - 1)) {
                coll.top = true;
            }
            if (pos >= this.X.length - (ns - 1)) {
                coll.bottom = true;
            }
        };*/
        move_left(-0);
        this.update();

        // moveY

        // randomly change opacity
    }

    update() {
        this.emit('update');
    }

    add_X(y) {
        this.add_data(y, this.X);
    }

    /**
     * Add to dataset object a draw of a number, to later download, store or use it for training
     *
     * @param y the number
     * @param X the array of the number draw
     */
    add_data(y, X) {
        this.dataset.add(y, X);
    }

    import_into_X(array) {
        if (array.length !== this.size * this.size)
            throw new Error("Array size doesn't match");
        this.reset();
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