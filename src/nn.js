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
        let edge_size = Math.sqrt(this.X.length);
        for (let y = 0; y < edge_size; y++) {
            for (let x = 0; x < edge_size; x++) {
                let position = y * edge_size + x;
                this.X[position] = x/(edge_size-1);
            }
        }
        console.log(this.X);
    }

    /**
     * get the square convoluted n times
     * @param conv_size default:2
     */
    reduce(conv_size) {
        let average = (array) => array.reduce((a, b) => a + b) / array.length;
        let convolute = (conv_size, edge_size, x, y) => {
            // TODO for now do a simple average, later do with the kernel
            let pos = y * edge_size + x;
            let K = [];
            for (let ky = 0, kn = 0; ky < conv_size; ky++) {
                for (let kx = 0; kx < conv_size; kx++, kn++) {
                    K[kn] = this.out[pos+ ky*edge_size + kx];
                }
            }
            return average(K);
        };

        let convs_size = 2;
        let edge_size = Math.sqrt(this.out.length);

        let newOut = [];
        newOut.length = this.out.length / convs_size;
        let new_edege_size = Math.sqrt(newOut.length);

        for (let y = 0; y < edge_size; y += convs_size) {
            for (let x = 0; x < edge_size; x += convs_size) {
                // do the avg of 4 pixels and then assign it to newOut
                let avg = convolute(convs_size, edge_size, x, y);

                let new_pos = y * new_edege_size + x;
                this.out[new_pos] = avg;
            }
        }
        this.out.length = newOut.length;
        console.log(this.out.length);
        this.update();
    }

    update() {
        this.emit('update');
    }
}

export {
    NN
};