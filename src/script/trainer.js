import * as EventEmitter from 'events';
import NeuralNetwork from "./neural_network";
import Dataset from './dataset';

const INITIAL_SIZE = 32;
const AFTER_POOL_SIZE = INITIAL_SIZE / 2;
const NUM_NUM = 10;
const HIDDEN_LAYER_SIZE = 8;
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
                for (let j = 0; j < parsed[key].length; j++) {
                    if (parsed[key][j].length !== INITIAL_SIZE * INITIAL_SIZE) {
                        console.log(key);
                        console.log(parsed[key][j].length);
                        return false;
                    }
                }
            }
        } catch (e) {
            console.error(e);
            return false;
        }
        return true;
    }

    static load_file(btn) {
        return new Promise((resolve, reject) => {
            let input_file = document.createElement('input');
            input_file.type = "file";
            input_file.onchange = (evt) => {
                let files = evt.target.files;
                for (let i = 0; i < files.length; i++) {
                    let f = files[i];
                    let reader = new FileReader();
                    reader.onload = (e) => {
                        let content = e.target.result;
                        resolve(content);
                    };
                    reader.readAsText(f);
                }
            };
            input_file.style.display = "none";
            btn.onclick = () => {
                input_file.click();
            };
        });
    }

    static load_file_check(btn) {
        return new Promise((resolve, reject) => {
            Trainer.load_file(btn).then(content => {
                if (Trainer.test_file_integrity(content)) {
                    resolve(JSON.parse(content));
                } else {
                    reject("Error: File not integer")
                }
            });
        });
    }

    static remote_load () {
        return new Promise((resolve, reject) => {
            let oReq = new XMLHttpRequest();
            oReq.onload = () => {
                let parsed = JSON.parse(oReq.responseText);
                resolve(parsed);
            };
            oReq.onerror = () => {
                reject("Errore");
            };
            oReq.open("GET", "http://iofurlan.github.io/nn-number-recognizer/dataset/dataset.json");
            oReq.send();
        });
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

    update() {
        this.emit('update');
    }

    add_X(y) {
        this.dataset.add(y, this.X);
    }

    import_into_X(array) {
        if (array.length !== this.size * this.size) {
            throw new Error("Array size doesn't match");
        }
        this.reset();
        for (let i = 0; i < array.length; i++) {
            this.X[i] = array[i];
        }
        this.update();
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
        return {pred, error};
    } //old one, now do batch training

    reset() {
        this.X.length = this.size * this.size;
        this.X.fill(0);
        this.update();
    }
}