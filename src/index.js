import 'bootstrap/dist/css/bootstrap.min.css';
import './style/style.scss';
import * as Actions from './script/actions';



// TODO  sistemare il problema del disegno su chrome e cellulari, migliorare quindi gli eventi del mouse, touch, pointer quello che è
// TODO  create class that handles events in drawer
// TODO  creare un gist con un handler globale
// TODO  avviare il countdown al rilascio del mouse o alla fine del tocco
// TODO  draw_on_grid with coordinates instead of event
// TODO  finally create all error messages for the whole project
// TODO  move the augmentation function to dataset?!
// TODO  make the dataset an Array before learning phase so that is more useful to pick random in order to train the NN
// TODO  craete animation of the dataset once loaded that scroll all the array to show all the training data
// TODO  let the drawer control the overlay, the progress bar, the canvas, insomma tutto il suo riquadro
// TODO  make the first "page" with all the buttons ( 6ix buttons) with all the actions, draw new dataset, merge dataset, show dataset, approve dataset, test new feature, and loader and trainer
// TODO  make sometype of navigation bar

const btn_group = document.getElementById('btn-group');

const actions = Object.keys(Actions);
const btns = [];
let loaded = null;
for (let i=0;i<actions.length;i++) {
    let key = actions[i];
    btns[i] = document.createElement('button');
    btns[i].innerText = key;
    btns[i].id = key;
    btns[i].className = "btn btn-outline-primary";
    btns[i].onclick = () => {
        loaded = new Actions[key]().start();
        btns.every((value, index) => btn_group.removeChild(value));
    };
    btn_group.appendChild(btns[i]);
}




