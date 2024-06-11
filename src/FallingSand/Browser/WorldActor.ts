import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";
import {
    SimulationInterface
} from "../../SimulationInterface.ts";
import {DirtyCanvas} from "../../Utility/DirtyCanvas.ts";
import {Coordinate} from "../../Utility/Traversal.ts";
import {Actor, Canvas, Vector} from "excalibur";
import Stats from '../../Utility/Stats/Stats.ts';
import {WorldCanvasManager} from "../World/WorldCanvasManager.ts";

export class WorldActor extends Actor {
    private readonly matrix: CellularMatrix;
    private readonly canvas: Canvas;

    private simulationSpeed: number = 1;

    private cleared: boolean = true;

    private readonly stats?: Stats;

    private particleDrawCount: number = 0;

    private worldCanvas: WorldCanvasManager;

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

        this.worldCanvas = new WorldCanvasManager(this.width, this.height, particleSize);

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
        this.simulation.on('createParticles', event => {
            this.matrix.createParticles({
                ...event,
                coordinate: this.toGridCoordinates(event.coordinate),
            });
        });
        this.simulation.on('removeParticles', event => {
            this.matrix.removeParticles({
                ...event,
                coordinate: this.toGridCoordinates(event.coordinate),
            });
        });

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

    onPreUpdate() {
        if (this.cleared || this.matrix.changedIndexes.size) {
            this.canvas.flagDirty();
        }

        if (this.simulationSpeed > 0) {
            this.updateGrid();
        }
    }

    private drawCanvas(ctx: CanvasRenderingContext2D): void {
        this.particleDrawCount = this.particleDrawCount = this.worldCanvas.update(ctx, this.matrix, {
            cleared: this.cleared,
        });

        this.cleared = false;
    }

    private updateGrid() {
        this.stats?.begin();

        this.matrix.simulate();

        this.stats?.end({draws: {value: this.particleDrawCount}});
    }

    private toGridCoordinates(coordinate: Coordinate): { x: number, y: number } {
        const x = Math.floor(coordinate.x / this.particleSize);
        const y = Math.floor(coordinate.y / this.particleSize);

        return {x, y};
    }

    restart() {
        this.matrix.clear();
        // this.cleared = true;
    }

    setSimulationSpeed(speed: number) {
        this.simulationSpeed = Math.max(0, speed);
    }
}