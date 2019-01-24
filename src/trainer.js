const EventEmitter = require('events');
const math = require('mathjs');

const DEFAULT_MAX_SQUARES = 64;
const DEFAULT_MIN_SQUARES = 8;
const NUM_NUM = 2;

class NeuralNetwork {
    constructor(input, hidden, output) {
        this.inputLayerSize = input;
        this.hiddenLayerSize = hidden; // I don't know what is the best value
        this.outputLayerSize = output;

        this.learning_rate = 100;

        this.W1 = math.randomInt([this.inputLayerSize, this.hiddenLayerSize]).map((row) => {
            return row.map(() => {
                return Math.random();
            });
        });
        //console.log(this.W1);
        this.W2 = math.randomInt([this.hiddenLayerSize, this.outputLayerSize]).map((row) => {
            return row.map(() => {
                return Math.random();
            });
        });
        //console.log(this.W2);
    }

    static sigmoid(z) {
        let bottom = math.add(1, math.exp(math.multiply(-1, z)));
        return math.dotDivide(1, bottom);
    }

    static sigmoidPrime(z) {
        let sig = NeuralNetwork.sigmoid(z);
        return math.dotMultiply(sig, math.add(1, math.multiply(-1, sig)));
        // error found here "dotMultiply" is correct, instead of "multiply" alone
    }

    forward(X) {
        this.Z2 = math.multiply(X, this.W1);
        this.A2 = NeuralNetwork.sigmoid(this.Z2);
        this.Z3 = math.multiply(this.A2, this.W2);
        let y_hat = NeuralNetwork.sigmoid(this.Z3);
        return y_hat;
    }

    costFunction(X, y) {
        let y_hat = this.forward(X);
        let J = math.sum(math.multiply(0.5, math.square(math.subtract(y, y_hat))));
        return J;
    }

    costFunctionPrime(X, y) {
        let y_hat = this.forward(X);
        let sigprime3 = NeuralNetwork.sigmoidPrime(this.Z3);
        let ymyhat = math.subtract(y, y_hat);
        let left1 = math.multiply(-1, ymyhat);
        let delta3 = math.dotMultiply(left1, sigprime3);
        let dJdW2 = math.multiply(math.transpose(this.A2),delta3); // problem with the size
        console.log(dJdW2);

        let sigprime2 = NeuralNetwork.sigmoidPrime(this.Z2);
        let delta2 = math.dotMultiply(math.multiply(delta3, math.transpose(this.W2)), sigprime2);
        let dJdW1 = math.multiply(math.transpose(X), delta2);

        console.log(dJdW1);
        return [dJdW1, dJdW2];
    }

    train(X, y) {
        let [dJdW1, dJdW2] = this.costFunctionPrime(X, y);
        //console.log(dJdW1 + "-" + dJdW2);
        this.W2 = math.subtract(this.W2, math.multiply(this.learning_rate, dJdW2));
        this.W1 = math.subtract(this.W1, math.multiply(this.learning_rate, dJdW1));
        return this.test(X, y);
    }

    test(X, y) {
        let prediction = this.forward(X);
        let total_error = this.costFunction(X, y);
        return [prediction, total_error];
    }
}
/*let nn = new NeuralNetwork(2, 3, 2);
let [prediction, total_error] = nn.train([[1, 2]], [[0, 1]]);
console.log("pred: "+prediction+" err: " + total_error);
process.exit(0);*/

class Trainer extends EventEmitter {
    constructor(size) {
        super();
        this.X = [];
        this.size = size;
        this.X.length = this.size * this.size;
        this.X.fill(0);
        this.nn = new NeuralNetwork(64, 32, NUM_NUM);
        //TODO replace out with X, modify directly X and then pass it to the net...
    }

    /**
     * get the square convoluted n times
     * @param conv_size default:2
     */
    reduce(conv_size = 2) {
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

    get_random_y() {
        let y = Math.floor(Math.random() * NUM_NUM);
        return y;
    }

    train(y) {
        let Y = [];
        Y.length = NUM_NUM;
        Y.fill(0);
        Y[y] = 1;

        let [prediction, error] = this.nn.train([this.X], [Y]);

        // pass to other array

        let pred = [];
        for (let i=0;i<prediction[0].length;i++) {
            pred[i] = {
                number:i,
                accuracy:prediction[0][i]
            };
        }

        // sort the other array
        for (let i=0;i<pred.length-1;i++)  {
            for (let j=i+1;j<pred.length;j++) {
                if (pred[i].accuracy<pred[j].accuracy) {
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