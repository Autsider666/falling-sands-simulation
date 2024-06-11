import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";
import {
    CreateParticlesEvent,
    RemoveParticlesEvent,
    SimulationInterface
} from "../../SimulationInterface.ts";
import {Coordinate} from "../../Utility/Traversal.ts";
import {Element} from "../Particle/Element.ts";
import {Actor, Canvas, Engine, PointerAbstraction, Random, Vector} from "excalibur";
import {DirtyCanvas} from "../../Utility/DirtyCanvas.ts";
import Stats from '../../Utility/Stats/Stats.ts';
import {WorldDraw} from "./WorldDraw.ts";

export class WorldActor extends Actor {
    private readonly matrix: CellularMatrix;
    private readonly canvas: Canvas;
    private readonly random = new Random();
    private primaryPointer?: PointerAbstraction;

    private simulationSpeed: number = 1;

    private cleared: boolean = true;

    private readonly stats?: Stats;

    private particleDrawCount: number = 0;

    private worldDraw: WorldDraw;

    constructor(
        private readonly simulation: SimulationInterface,
        gridHeight: number,
        gridWidth: number,
        private readonly particleSize: number,
        debug: boolean = false,
    ) {
        super({
            height: gridHeight * particleSize,
            width: gridWidth * particleSize,
            anchor: Vector.Zero,
        });
        this.matrix = new CellularMatrix(
            gridHeight,
            gridWidth,
        );

        this.worldDraw = new WorldDraw(this.width, this.height, particleSize);

        this.canvas = new DirtyCanvas({
            height: gridHeight * particleSize,
            width: gridWidth * particleSize,
            cache: true,
            draw: this.drawCanvas.bind(this),
        });

        this.graphics.use(this.canvas);

        this.simulation.on('start', () => this.setSimulationSpeed(1));
        this.simulation.on('stop', () => this.setSimulationSpeed(0));
        this.simulation.on('restart', () => this.restart());
        this.simulation.on('createParticles', this.createParticles.bind(this));
        this.simulation.on('removeParticles', this.removeParticles.bind(this));

        if (!debug) {
            return;
        }

        // TODO move this to UI part and handle with events?
        this.stats = new Stats({
            width: 100,
            height: 60,
            // width: 80,
            // height: 48,
            showAll: true,
            defaultPanels: {
                MS: {
                    decimals: 1,
                    maxValue: 25,
                },
            }
        });

        this.stats.addPanel('draws', '#00b2ff', '#032a50', 0, this.matrix.length);

        const statsDom = this.stats.dom;
        statsDom.style.top = '0';
        statsDom.style.right = '0';
        statsDom.style.left = '';

        document.body.appendChild(statsDom);
    }

    onPreUpdate(engine: Engine) {
        if (this.primaryPointer === undefined) {
            this.primaryPointer = engine.input.pointers.primary;
        }

        if (this.cleared || this.matrix.changedIndexes.size) {
            this.canvas.flagDirty();
        }

        if (this.simulationSpeed > 0) {
            this.updateGrid();
        }
    }

    private drawCanvas(ctx: CanvasRenderingContext2D): void {
        this.particleDrawCount = this.particleDrawCount = this.worldDraw.drawCanvas(ctx, this.matrix, {cleared: this.cleared});

        if (this.cleared) {
            this.cleared = false;
        }
    }

    private updateGrid() {
        this.stats?.begin();

        this.matrix.simulate();

        this.stats?.end({draws: {value: this.particleDrawCount}});
    }

    public createParticles({
                               coordinate,
                               element,
                               force = false,
                               radius = 1,
                               probability = 1
                           }: CreateParticlesEvent) {
        this.iterateAroundCoordinate(
            coordinate,
            index => {
                if (force || this.matrix.getIndex(index) === undefined) {
                    this.matrix.setIndex(index, Element.create(index, element));
                }
            },
            radius,
            probability,
        );
    }

    public removeParticles({
                               coordinate,
                               radius = 1,
                               probability = 1
                           }: RemoveParticlesEvent) {
        const removed: number[] = [];
        this.iterateAroundCoordinate(
            coordinate,
            index => this.matrix.getIndex(index) !== undefined ? removed.push(index) && this.matrix.setIndex(index, undefined) : undefined,
            radius,
            probability,
        );

        for (const index of removed) {
            this.iterateAroundCoordinate(
                this.matrix.toCoordinates(index),
                neighbor => {
                    if (neighbor === index) {
                        console.log('Does this happen?');
                    }

                    this.matrix.getIndex(neighbor)?.triggerFreeFalling();
                    if (this.matrix.getIndex(neighbor)) {
                        console.log(this.matrix.getIndex(neighbor));
                    }
                },
                1);
        }
    }


    private iterateAroundCoordinate(pos: Coordinate, callback: (index: number, coordinate: Coordinate) => void, radius: number, probability: number = 1) {
        const radiusSquared = radius * radius;
        const {x, y} = this.toGridCoordinates(pos);
        for (let dX = -radius; dX <= radius; dX++) {
            for (let dY = -radius; dY <= radius; dY++) {
                if (dX * dX + dY * dY <= radiusSquared && (probability >= 1 || this.random.bool(probability))) {
                    const resultingY = y + dY;
                    if (resultingY < 0 || resultingY >= this.matrix.height - 1) {
                        continue;
                    }

                    const resultingX = x + dX;
                    if (resultingX >= 0 && resultingX < this.matrix.width - 1) {
                        const index = this.matrix.toIndex(resultingX, resultingY);
                        callback(index, {x: resultingX, y: resultingY});
                    }
                }
            }
        }
    }

    private toGridCoordinates(coordinate: Coordinate): { x: number, y: number } {
        const x = Math.floor(coordinate.x / this.particleSize);
        const y = Math.floor(coordinate.y / this.particleSize);

        return {x, y};
    }

    restart() {
        this.matrix.clear();
        this.cleared = true;
    }

    setSimulationSpeed(speed: number) {
        this.simulationSpeed = Math.max(0, speed);
    }
}