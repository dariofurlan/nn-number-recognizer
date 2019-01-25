import * as EventEmitter from 'events';
import {NeuralNetwork} from "./neural_network";

const INITIAL_SIZE = 16;
const AFTER_POOL_SIZE = INITIAL_SIZE / 2;
const NUM_NUM = 4;
const HIDDEN_LAYER_SIZE = 10;
const CONV_SIZE = 2;

class Trainer extends EventEmitter {
    constructor() {
        super();
        this.draws = [];
        this.X = [];
        this.size = INITIAL_SIZE;
        this.reset();
        this.nn = new NeuralNetwork(Math.pow(AFTER_POOL_SIZE, 2), HIDDEN_LAYER_SIZE, NUM_NUM);
    }

    avg_pooling() {
        if (this.X.length / (CONV_SIZE * CONV_SIZE) < AFTER_POOL_SIZE * AFTER_POOL_SIZE)
            return false;
        let average = (array) => array.reduce((a, b) => a + b) / array.length;
        let convolute = (conv_size, edge_size, x, y) => {
            // TODO for now do a simple average, later do with the kernel
            let pos = y * edge_size + x;
            let K = [];
            for (let ky = 0, kn = 0; ky < conv_size; ky++) {
                for (let kx = 0; kx < conv_size; kx++, kn++) {
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
                let avg = convolute(CONV_SIZE, edge_size, x, y);
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
        let convolute = (conv_size, edge_size, x, y) => {
            // TODO for now do a simple average, later do with the kernel
            let pos = y * edge_size + x;
            let K = [];
            for (let ky = 0, kn = 0; ky < conv_size; ky++) {
                for (let kx = 0; kx < conv_size; kx++, kn++) {
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
                let max = convolute(CONV_SIZE, edge_size, x, y);
                let new_pos = (y) * new_edege_size + x;
                this.X[new_pos / 2] = max;
            }
        }
        this.X.length = newOut.length;
        this.update();
        return true;
    }

    update() {
        this.emit('update');
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
        let y = Math.floor(Math.random() * NUM_NUM);
        return y;
    }

    add_draw() {
        this.draws.push(this.X);
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
    }

    reset() {
        this.X.length = this.size * this.size;
        this.X.fill(0);
        this.update();
    }
}

export {
    Trainer
};