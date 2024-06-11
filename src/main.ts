import './style.css';
import {URLParams} from "./Utility/URLParams.ts";
import {BrowserSimulation} from "./FallingSand/Browser/BrowserSimulation.ts";

// const portrait = window.matchMedia("(orientation: portrait)"); //TODO let's translate matrix on mobile phone turn
// portrait.addEventListener("change", function(e) {
//     console.log(e);
// });

const excaliburCanvas = document.querySelector<HTMLCanvasElement>('canvas#excalibur');
if (!excaliburCanvas) {
    throw new Error('No canvas with #excalibur id found.');
}

const debugMode = URLParams.get('debug', 'boolean') ?? false;
const webWorkerMode = URLParams.get('webWorker', 'boolean') ?? true;
const simulation = new BrowserSimulation('Sand', excaliburCanvas, webWorkerMode, debugMode);

await simulation.start();
