import * as math from 'mathjs';

export default class NeuralNetwork {
    constructor(input, hidden, output) {
        this.inputLayerSize = input;
        this.hiddenLayerSize = hidden; // I don't know what is the best value
        this.outputLayerSize = output;

        this.learning_rate = 5;
        this.W1 = math.randomInt([this.inputLayerSize, this.hiddenLayerSize]).map((row) => {
            return row.map(() => {
                let sign = Math.random() < 0.5 ? -1 : 1;
                return Math.random()*1.5*sign;
            });
        });
        //console.log(this.W1);
        this.W2 = math.randomInt([this.hiddenLayerSize, this.outputLayerSize]).map((row) => {
            return row.map(() => {
                let sign = Math.random() < 0.5 ? -1 : 1;
                return Math.random()*1.5*sign;
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

        /*console.log(y);
        console.log(y_hat);
        console.log(math.subtract(y, y_hat));*/

        let J = math.sum(math.multiply(0.5, math.square(math.subtract(y, y_hat))));
        return J;
    }

    costFunctionPrime(X, y) {
        let y_hat = this.forward(X);
        let sigprime3 = NeuralNetwork.sigmoidPrime(this.Z3);
        let ymyhat = math.subtract(y, y_hat);
        let left1 = math.multiply(-1, ymyhat);
        let delta3 = math.dotMultiply(left1, sigprime3);
        let dJdW2 = math.multiply(math.transpose(this.A2), delta3);

        let sigprime2 = NeuralNetwork.sigmoidPrime(this.Z2);
        let delta2 = math.dotMultiply(math.multiply(delta3, math.transpose(this.W2)), sigprime2);
        let dJdW1 = math.multiply(math.transpose(X), delta2);

        //console.log(dJdW1);
        return [dJdW1, dJdW2];
    }

    train(X, y) {
        let [dJdW1, dJdW2] = this.costFunctionPrime(X, y);
        this.W2 = math.subtract(this.W2, math.multiply(this.learning_rate, dJdW2));
        this.W1 = math.subtract(this.W1, math.multiply(this.learning_rate, dJdW1));
        /*console.log(this.W1);
        console.log(this.W2);*/
        let error = this.costFunction(X, y);
        return {
            prediction: this.test(X, y),
            error: error,
        };
    }

    test(X) {
        let prediction = this.forward(X);
        return prediction;
    }
}
