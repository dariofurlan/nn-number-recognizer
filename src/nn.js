const EventEmitter = require('events');

class NN extends EventEmitter {
    constructor(size) {
        super();
        this.size = size;
        this.callbacks = [];
        this.X = [];
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

    getX() {
        return this.X;
    }

    update() {
        this.emit('update',)
    }
}

export {
    NN
};