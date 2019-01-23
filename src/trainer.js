const EventEmitter = require('events');
const math = require('mathjs');

const DEFAULT_MAX_SQUARES = 64;
const DEFAULT_MIN_SQUARES = 8;

//let a = math.dot([[1,2],[4,3]], [[1,2,3],[3,-4,7]]);     // returns number 15
let b = math.multiply([[1,2],[4,3]], [[1,2,3],[3,-4,7]]); // returns number 15
//console.log(a);
console.log(b);



class NeuralNetwork {
    constructor(inputLayerSize) {
        this.inputLayerSize = inputLayerSize;
        this.hiddenLayerSize = 16; // I don't know what is the best value
        this.outputLayerSize = 10;

        this.learning_rate = 5;

        this.W1 = math.randomInt([this.inputLayerSize, this.hiddenLayerSize]).map((row) => {
            return row.map(() => {
                return Math.random();
            });
        });
        console.log("w:");
        console.log(this.W1);
        this.W2 = math.randomInt([this.hiddenLayerSize, this.outputLayerSize]).map((row) => {
            return row.map(() => {
                return Math.random();
            });
        });
    }

    static relu(x) {
        return x > 0 ? x : 0;
    }

    static sigmoid(z) {
        let bottom = math.add(1, math.exp(math.multiply(-1, z)));
        return math.dotDivide(1, bottom);
    }

    static sigmoidPrime(z) {
        let top = math.exp(math.multiply(-1, z));
        let bottom = math.add(1, top);
        return math.dotDivide(top, bottom);
    }

    forward(X) {
        this.Z2 = math.multiply(X, this.W1);
        console.log(this.Z2);
        this.A2 = NeuralNetwork.sigmoid(this.Z2);
        console.log(this.A2);
        this.Z3 = math.multiply(this.A2, this.W2);
        let y_hat = NeuralNetwork.sigmoid(this.Z3);
        return y_hat;
    }

    costFunction(X, y) {
        let y_hat = this.forward(X);
        let error_diff = math.subtract(y, y_hat);
        let error_squared = math.square(error_diff);
        if (error_squared.constructor !== Array) {
            error_squared = error_squared._data;
        }
        let summed = error_squared.reduce((a, v) => {
            return math.add(a, b);
        });

        let J = math.multiply(0.5, summed);
        return J;
    }

    costFunctionPrime(X, y) {
        let y_hat = this.forward(X);
        let sigprime3 = NeuralNetwork.sigmoidPrime(this.Z3);
        let ymyhat = math.subtract(y, y_hat);
        let left1 = math.multiply(-1, ymyhat);

        let delta3 = math.dotMultiply(left1, sigprime3);

        let a2t = math.transpose(this.A2);

        let dJdW2;
        if (math.size(a2t).length === 1 && math.size(delta3).length === 1) {
            dJdW2 = math.dot(a2t, delta3);
        } else {
            dJdW2 = math.multiply(a2t, delta3);
        }

        let sigprime2 = NeuralNetwork.sigmoidPrime(this.Z2);
        let w2trans = math.transpose(this.W2);
        let left2;
        if (math.size(delta3).length === 1 && math.size(w2trans).length === 1) {
            left2 = math.dot(delta3, w2trans);
        } else {
            left2 = math.multiply(delta3, w2trans);
        }

        let delta2 = math.dotMultiply(left2, sigprime2);

        let xtrans = math.transpose(X);

        let dJdW1;
        if (math.size(xtrans).length === 1 && math.size(delta2).length === 1) {
            dJdW1 = math.dot(xtrans, delta2);
        } else {
            dJdW1 = math.multiply(xtrans, delta2);
        }
        return [dJdW1, dJdW2];
    }

    train(X, y) {
        let [dJdW1, dJdW2] = this.costFunctionPrime(X, y);
        console.log(dJdW1+"-"+dJdW2);
        this.W2 = math.subtract(this.W2, math.multiply(-this.learning_rate, dJdW2));
        this.W1 = math.subtract(this.W1, math.multiply(-this.learning_rate, dJdW1));
        return this.test(X,y);
    }

    test(X, y) {
        let prediction = this.forward(X);
        let error = this.costFunction(X, y);
        return [prediction, error];
    }
}

class Trainer extends EventEmitter {
    constructor(size) {
        super();
        this.X = [];
        this.X.length = size * size;
        this.X.fill(0);
        this.nn = new NeuralNetwork(64);
        //TODO replace out with X, modify directly X and then pass it to the net...
    }

    /**
     * get the square convoluted n times
     * @param conv_size default:2
     */
    reduce(conv_size=2) {
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
        newOut.length = this.X.length / (conv_size * conv_size);
        let new_edege_size = Math.sqrt(newOut.length);

        for (let y = 0; y < edge_size; y += conv_size) {
            for (let x = 0; x < edge_size; x += conv_size) {
                // do the avg of 4 pixels and then assign it to newOut
                let avg = convolute(conv_size, edge_size, x, y);
                let new_pos = (y) * new_edege_size + x;
                this.X[new_pos / 2] = avg;
            }
        }
        this.X.length = newOut.length;
        this.update();
    }

    update() {
        this.emit('update');
    }

    static get_random_y() {
        let y = Math.floor(Math.random()*10);
        return y;
    }

    train(y) {
        let Y = [];
        Y.length=10;
        Y.fill(0);
        Y[y] = 1;

        let [prediction, error] = this.nn.train(this.X,Y);
        console.log("expected = "+prediction);
        console.log("error = "+error);
    }
}

/*
export {
    Trainer
};*/