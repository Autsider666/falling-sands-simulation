import './style.css';
import {URLParams} from "./Utility/URLParams.ts";
import {WindowSimulation} from "./WindowSimulation.ts";



// const portrait = window.matchMedia("(orientation: portrait)"); //TODO let's translate matrix on mobile phone turn
// portrait.addEventListener("change", function(e) {
//     console.log(e);
// });


// const worker = new Worker(StringWorker);
// worker.onmessage = event => console.log(event);
// worker.onerror = (event) => console.error(event);
// worker.postMessage('hello!');

// const worker = new ViteWorker();
// worker.onmessage = event => console.log(event);
// worker.onerror = event => console.error(event);
// worker.postMessage('hello!');

// const onscreenCanvas = document.querySelector<HTMLCanvasElement>('#offscreen');
// if (!onscreenCanvas){
//     throw new Error('Nope');
// }
//
// const worker = new OffscreenCanvasWorker();
// worker.onmessage = event => console.log(event.data);
// worker.onerror = event => console.error(event);
// const offscreenCanvas = onscreenCanvas.transferControlToOffscreen();
// worker.postMessage({canvas:offscreenCanvas},[offscreenCanvas]);


const debugMode = URLParams.get('debug', 'boolean') ?? false;
const simulation = new WindowSimulation('Sand', debugMode);

await simulation.start();
