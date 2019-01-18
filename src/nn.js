const EventEmitter = require('events');

class NN extends EventEmitter {
    constructor(size) {
        super();
        this.size = size;
        this.X = [];
        this.out = this.X.slice(0);
        this.init();
    }

    init() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                let position = y * this.size + x;
                this.X[position] = .2;
            }
        }
    }

    /**
     * get the square convoluted n times
     * @param n
     */
    reduce(n) {
        
    }

    getOut() {
        return this.out;
    }

    update() {
        this.emit('update',)
    }
}

export {
    NN
};