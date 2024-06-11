import {MessageHandler} from "./FallingSand/Worker/MessageHandler.ts";
import {WorkerMessage} from "./FallingSand/Worker/WorkerMessage.ts";
import {WorkerWorldManager} from "./FallingSand/Worker/WorkerWorldManager.ts";
import {SimulationEvents} from "./SimulationInterface.ts";

const handler = new MessageHandler<WorkerMessage & SimulationEvents>(undefined, false);


let worldManager: WorkerWorldManager;

handler.on('init', ({canvas: offscreenCanvas, particleSize, worldWidth, worldHeight}) => {
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) {
        throw new Error('No ctx?');
    }

    worldManager = new WorkerWorldManager(handler, ctx, worldHeight, worldWidth, particleSize);

    postMessage('Worker started!');

    handleUpdate();
});

const maxFPS: number = 40;
const fpsInterval: number = 1000 / maxFPS;
let then: number = 0;
let elapsed: number = 0;

const handleUpdate = () => {
    const now = Date.now();
    elapsed = now - then;

    const nextStep = elapsed > fpsInterval;
    worldManager.update(nextStep);

    if (nextStep) {
        then = now - (elapsed % fpsInterval);
        worldManager.render();
    }
    requestAnimationFrame(handleUpdate);
};

