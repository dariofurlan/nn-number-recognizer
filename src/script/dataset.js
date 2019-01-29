
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
    this.dataset = {};

    Dataset.prototype.export = (arr) => {
        return arr.join("");
    };

    Dataset.prototype.import = (array_str) => {
        return array_str.split("");
    };

    this.add = (y, X)=> {
        if (y === undefined)
            throw new Error("y can't be undefined");
        if (this.dataset[y] === undefined) {
            this.dataset[y] = [];
        }
        console.log(X);
        this.dataset[y].push(X);
        console.log(this.dataset[y][0]);
    };

    this.import_dataset = (dataset_obj) => {
        this.dataset = {};
        for (let num_key in dataset_obj) {
            let num_data = dataset_obj[num_key];
            for (let i = 0; i < num_data.length; i++) {
                this.add_data(num_key, Dataset.import(num_data[i]))
            }
        }
    };

    this.export_dataset = () => {
        let n_dataset = {};
        for (let key in this.dataset) {
            n_dataset[key] = [];
            for (let i = 0; i < this.dataset[key].length; i++) {
                n_dataset[key][i] = Dataset.export(this.dataset[key][i]);
            }
        }
        return JSON.stringify(n_dataset);
    };

    this.export_n_download = () => {
        download(JSON.stringify(this.export_dataset()));
    };
}