import {SimulationEvents, SimulationInterface} from "../../SimulationInterface.ts";
import WebWorker from "../../WebWorker.ts?worker";
import {MessageHandler} from "./MessageHandler.ts";
import {WorkerMessage} from "./WorkerMessage.ts";

export class WorkerManager {
    private readonly worker:Worker;

    constructor(
        private readonly simulation: SimulationInterface,
        private readonly worldHeight: number,
        private readonly worldWidth: number,
        private readonly particleSize: number,
        excaliburCanvas: HTMLCanvasElement,
    ) {
        const canvas = document.querySelector<HTMLCanvasElement>('canvas#offscreen');
        if (!canvas) {
            throw new Error('No canvas with #offscreen id found.');
        }

        canvas.height = excaliburCanvas.height;
        canvas.width = excaliburCanvas.width;

        this.worker = new WebWorker();
        this.worker.onmessage = event => console.log(event.data);
        this.worker.onerror = event => console.error(event);

        const handler = new MessageHandler<WorkerMessage & SimulationEvents>(this.worker);

        const offscreenCanvas = canvas.transferControlToOffscreen();

        handler.emit('init', {
            canvas: offscreenCanvas,
            particleSize: this.particleSize,
            worldWidth: this.worldWidth,
            worldHeight: this.worldHeight,
        }, [offscreenCanvas]);

        this.simulation.pipe(handler);
    }
}