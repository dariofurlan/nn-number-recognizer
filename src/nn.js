const EventEmitter = require('events');

class NN extends EventEmitter {
    constructor(size) {
        super();
        this.X = [];
        this.X.length = size * size;
        this.X.fill(0);
        this.init();
        this.out = this.X.slice(0);
    }

    init() {
        let a = 0;
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                let position = y * this.size + x;
                this.X[position] = a;
                a++;
            }
        }
    }

    /**
     * get the square convoluted n times
     * @param n
     */
    reduce(n) {
        let edge_size = Math.sqrt(this.out.length);

        let newOut = [];
        newOut.length = this.out.length / 2;
        let new_edege_size = Math.sqrt(newOut.length);

        for (let y = 0; y < edge_size; y += 2) {
            for (let x = 0; x < edge_size; x += 2) {
                // do the avg of 4 pixels and then assign it to newOut
                let pos = y * edge_size + x;
                let n1 = this.X[pos];
                let n2 = this.X[pos + 1];
                let n3 = this.X[pos + edge_size];
                let n4 = this.X[pos + edge_size + 1];
                let avg = (n1 + n2 + n3 + n4) / 4;

                console.log(avg);

                let new_pos = y * new_edege_size + x;
                newOut[new_pos] = avg;
            }
        }
    }

    update() {
        this.emit('update', 'data');
    }
}

export {
    NN
};