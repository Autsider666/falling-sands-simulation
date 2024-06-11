import {Color, Engine} from "excalibur";
import {ElementIdentifier} from "../../Elements.ts";
import {EventEmitterInterface} from "../../Utility/Excalibur/Event/EventEmitterInterface.ts";
import {EventHandler, EventKey, Handler} from "../../Utility/Excalibur/Event/EventHandler.ts";
import {WorkerManager} from "../Worker/WorkerManager.ts";
import {WorldActor} from "./WorldActor.ts";
import {WorldInputManager} from "./WorldInputManager.ts";
import {WorldUIManager} from "./WorldUIManager.ts";
import {SimulationEvents, SimulationInterface} from "../../SimulationInterface.ts";
import {URLParams} from "../../Utility/URLParams.ts";

export class BrowserSimulation implements SimulationInterface {
    private readonly engine: Engine;

    private readonly events = new EventHandler<SimulationEvents>();

    public readonly particleSize: number;
    public readonly worldHeight: number;
    public readonly worldWidth: number;

    constructor(
        defaultElement: ElementIdentifier,
        canvasElement: HTMLCanvasElement,
        webworkerMode:boolean = true,
        debugMode: boolean = false,
    ) {
        const screenWidth = Math.min(window.innerWidth);
        const screenHeight = Math.min(window.innerHeight);

        this.particleSize = Math.max(URLParams.get('particleSize', 'number') ?? 4, 1);
        this.worldWidth = Math.round(screenWidth / this.particleSize);
        this.worldHeight = Math.round(screenHeight / this.particleSize);

        this.engine = new Engine({
            width: this.worldWidth *  this.particleSize,
            height: this.worldHeight *  this.particleSize,
            maxFps: 30,
            backgroundColor: Color.Transparent,
            enableCanvasTransparency: true,
            canvasElement,
        });

        if (!webworkerMode) {
            this.engine.add(new WorldActor(this, this.worldHeight,  this.worldWidth,  this.particleSize, debugMode));
        } else {
            new WorkerManager(this,this.worldHeight,this.worldWidth,this.particleSize, canvasElement);
        }

        this.engine.add(new WorldInputManager(this, defaultElement,  this.particleSize));
        new WorldUIManager(this, this.engine.canvas, defaultElement); //TODO only a new?
    }

    on<TEventName extends EventKey<SimulationEvents>>(eventName: TEventName, handler: Handler<SimulationEvents[TEventName]>): void {
        this.events.on(eventName, handler);
    }

    off<TEventName extends EventKey<SimulationEvents>>(eventName: TEventName, handler: Handler<SimulationEvents[TEventName]>): void {
        this.events.off(eventName, handler);
    }

    emit<TEventName extends EventKey<SimulationEvents>>(eventName: TEventName, event: SimulationEvents[TEventName]): void {
        this.events.emit(eventName, event);
    }

    pipe(emitter: EventEmitterInterface<SimulationEvents>) :void {
        this.events.pipe(emitter);
    }

    async start(): Promise<void> {
        await this.engine.start();
    }
}