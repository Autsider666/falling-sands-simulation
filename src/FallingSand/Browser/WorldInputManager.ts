import {Actor, Engine, Vector} from "excalibur";
import {ElementIdentifier, Elements} from "../../Elements.ts";
import {SimulationInterface} from "../../SimulationInterface.ts";
import {InputType} from "../../Utility/InputType.ts";
import {Coordinate, Traversal} from "../../Utility/Traversal.ts";
import {Pointer} from "../Graphic/Pointer.ts";

export enum WorldAction {
    Toggle = 'Toggle',
    Pause = 'Pause',
    Play = 'Play',
    Force = 'Force',
    IncreaseDrawSize = 'IncreaseDrawSize',
    DecreaseDrawSize = 'DecreaseDrawSize',
    Draw = 'Draw',
    Erase = 'Erase',
}

export type WorldConfig = Record<WorldAction, InputType[]>;

export class WorldInputManager extends Actor {
    private isDrawing: boolean = false;
    private overrideWorld: boolean = false;
    private isErasing: boolean = false;
    private visibleIn: number = -1;
    private lastPointerPos?: Vector;
    private config: WorldConfig = {
        [WorldAction.Toggle]: [InputType.Space],
        [WorldAction.Force]: [InputType.ShiftLeft],
        [WorldAction.Draw]: [InputType.Left],
        [WorldAction.IncreaseDrawSize]: [InputType.ScrollUp],
        [WorldAction.DecreaseDrawSize]: [InputType.ScrollDown],
        [WorldAction.Pause]: [],
        [WorldAction.Play]: [],
        [WorldAction.Erase]: [InputType.ControlLeft]
    };

    private readonly canvas: Pointer;

    private readonly actionMap: Record<WorldAction, (released?: boolean) => void>;

    constructor(
        private readonly simulation: SimulationInterface,
        private element: ElementIdentifier,
        private readonly particleSize: number,
        private drawRadius: number = 3,
        private minDrawRadius: number = 0,
        private maxDrawRadius: number = 50,
    ) {
        super({
            radius: particleSize,
        });

        this.canvas = new Pointer(
            this.maxDrawRadius,
            this.particleSize,
            {
                isErasing: this.isErasing,
                overrideWorld: this.overrideWorld,
                drawRadius: this.drawRadius,
                element: this.element,
            }
        );

        this.graphics.add(this.canvas);
        this.graphics.visible = false;

        this.actionMap = {
            [WorldAction.Toggle]: (released?: boolean) => this.simulation.emit(released ? 'start' : 'stop', undefined),
            [WorldAction.Pause]: () => this.simulation.emit('stop', undefined),
            [WorldAction.Play]: () => this.simulation.emit('start', undefined),
            [WorldAction.Force]: (released?: boolean) => this.toggleOverrideWorld(released === undefined ? undefined : !released),
            [WorldAction.IncreaseDrawSize]: () => this.setDrawRadius(this.drawRadius + 1),
            [WorldAction.DecreaseDrawSize]: () => this.setDrawRadius(this.drawRadius - 1),
            [WorldAction.Draw]: released => {
                if (released === false) {
                    this.startDrawing();
                } else if (released === true) {
                    this.stopDrawing();
                } else {
                    this.draw(this.pos);
                }
            },
            [WorldAction.Erase]: released => this.toggleErase(released === undefined ? undefined : !released),
        };

        this.simulation.on('onFocus', () => this.toggleVisible(true));
        this.simulation.on('offFocus', () => this.toggleVisible(false));
        this.simulation.on('changeElement', this.changeElement.bind(this));
    }

    onInitialize(engine: Engine) {
        engine.input.pointers.on('wheel', ({deltaY}) => this.handleInputEvent(deltaY < 0 ? InputType.ScrollUp : InputType.ScrollDown));
        engine.input.pointers.on('down', ({button}) => this.handleInputEvent(button, false));
        engine.input.pointers.on('up', ({button}) => this.handleInputEvent(button, true));
        engine.input.keyboard.on("press", ({key}) => this.handleInputEvent(key, false));
        engine.input.keyboard.on("release", ({key}) => this.handleInputEvent(key, true));
    }

    updatePointer(): void {
        this.canvas.flagDirty({
            isErasing: this.isErasing,
            overrideWorld: this.overrideWorld,
            drawRadius: this.drawRadius,
            element: this.element,
        });
    }

    toggleVisible(visible?: boolean): void {
        const isVisible = visible === undefined ? !(this.visibleIn < 0) : visible;

        if (!isVisible) {
            this.visibleIn = -1;
            this.graphics.visible = false;
            this.stopDrawing();
        } else {
            this.visibleIn = 2;
        }
    }

    setDrawRadius(radius: number): void {
        this.drawRadius = Math.max(Math.min(radius, this.maxDrawRadius), this.minDrawRadius);

        this.updatePointer();
    }

    changeElement(element: ElementIdentifier): void {
        if (Elements[element]?.canDraw === false || this.element === element) {
            return;
        }

        this.element = element;

        this.updatePointer();
    }

    onPreUpdate(engine: Engine) {
        this.pos = engine.input.pointers.primary.lastWorldPos;

        if (!this.graphics.visible && --this.visibleIn === 0) {
            this.graphics.visible = true;
        }

        if (!this.isDrawing) {
            return;
        }

        if (this.lastPointerPos) {
            Traversal.iterateBetweenTwoCoordinates(
                this.lastPointerPos,
                engine.input.pointers.primary.lastWorldPos,
                this.draw.bind(this),
            );
        }

        this.lastPointerPos = this.pos.clone();
    }

    private toggleOverrideWorld(force?: boolean): void {
        if (force === undefined) {
            this.overrideWorld = !this.overrideWorld;
        } else {
            this.overrideWorld = force;
        }

        this.updatePointer();
    }

    private toggleErase(force?: boolean): void {
        if (force === undefined) {
            this.isErasing = !this.isErasing;
        } else {
            this.isErasing = force;
        }

        this.updatePointer();
    }

    private draw({x, y}: Coordinate): void {
        this.simulation.emit(this.isErasing ? 'removeParticles' : 'createParticles', {
            coordinate: {x, y}, // To prevent vectors
            element: this.element,
            radius: this.drawRadius,
            probability: Elements[this.element].drawProbability,
            force: this.overrideWorld,
        });
    }

    private startDrawing(): void {
        if (this.isDrawing) {
            return;
        }

        this.isDrawing = true;
    }

    private stopDrawing(): void {
        if (!this.isDrawing) {
            return;
        }

        this.isDrawing = false;
        this.lastPointerPos = undefined;
    }

    private handleInputEvent(identifier: InputType, released?: boolean): void {
        for (const action of Object.keys(this.config) as WorldAction[]) {
            for (const inputType of this.config[action]) {
                if (identifier === inputType) {
                    this.actionMap[action](released);
                }
            }
        }
    }
}