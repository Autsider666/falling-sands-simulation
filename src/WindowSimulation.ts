import {Color, Engine, EventEmitter} from "excalibur";
import {ElementIdentifier} from "./Elements.ts";
import {WorldActor} from "./FallingSand/Browser/WorldActor.ts";
import {WorldInputManager} from "./FallingSand/Browser/WorldInputManager.ts";
import {WorldUIManager} from "./FallingSand/Browser/WorldUIManager.ts";
import {EventKey, Handler, SimulationEvents, SimulationInterface} from "./SimulationInterface.ts";
import {URLParams} from "./Utility/URLParams.ts";

export class WindowSimulation implements SimulationInterface {
    private readonly engine: Engine;

    private readonly events = new EventEmitter();

    constructor(
        defaultElement: ElementIdentifier,
        debugMode: boolean = false,
    ) {
        const screenWidth = Math.min(window.innerWidth);
        const screenHeight = Math.min(window.innerHeight);

        const particleSize = Math.max(URLParams.get('particleSize', 'number') ?? 4, 1);
        const worldWidth = Math.round(screenWidth / particleSize);
        const worldHeight = Math.round(screenHeight / particleSize);

        this.engine = new Engine({
            width: worldWidth * particleSize,
            height: worldHeight * particleSize,
            maxFps: 40,
            backgroundColor: Color.Transparent,
        });

        this.engine.add(new WorldActor(this,worldHeight, worldWidth, particleSize, debugMode));
        this.engine.add(new WorldInputManager(this, defaultElement, particleSize));
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

    async start(): Promise<void> {
        await this.engine.start();
    }
}