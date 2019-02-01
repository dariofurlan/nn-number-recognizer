
function download(text) {
    let element = document.createElement('a');
    let date = new Date().toISOString().replace(/:/g,"-");
    let filename = "dataset_" + date;
    filename += ".json";
    console.log(filename);
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

export default function Dataset() {
    // private var
    let augmented = false; // augment only once, twice is not needed and useless

    //public var
    this.dataset = {};

    this._export = (arr) => {
        return arr.join("");
    };

    this._import = (array_str) => {
        return array_str.split("");
    };

    this.add = (y, X)=> {
        if (y === undefined)
            throw new Error("y can't be undefined");
        if (this.dataset[y] === undefined) {
            this.dataset[y] = [];
        }
        this.dataset[y].push(X.slice());
    };

    this.import_dataset = (dataset_obj) => {
        for (let num_key in dataset_obj) {
            let num_data = dataset_obj[num_key];
            for (let i = 0; i < num_data.length; i++) {
                this.add(num_key, this._import(num_data[i]))
            }
        }
    };

    this.export_dataset = () => {
        let n_dataset = {};
        for (let key in this.dataset) {
            n_dataset[key] = [];
            for (let i = 0; i < this.dataset[key].length; i++) {
                let exported = this.dataset[key][i].join('');
                console.log(exported);
                n_dataset[key][i] = exported;
            }
        }
        return n_dataset;
    };

    this.export_n_download = () => {
        download(JSON.stringify(this.export_dataset()));
    };
}