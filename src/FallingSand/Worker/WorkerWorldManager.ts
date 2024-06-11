import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";
import {CreateParticlesEvent, SimulationInterface} from "../../SimulationInterface.ts";
import {Coordinate} from "../../Utility/Traversal.ts";
import {WorldCanvasManager} from "../World/WorldCanvasManager.ts";

export class WorkerWorldManager {
    private readonly matrix: CellularMatrix;
    private readonly height: number;
    private readonly width: number;

    private readonly worldCanvas: WorldCanvasManager;

    private simulationSpeed: number = 1;

    private cleared: boolean = true;

    private creationQueue: CreateParticlesEvent[] = [];

    constructor(
        private readonly simulation: SimulationInterface,
        private readonly ctx: OffscreenCanvasRenderingContext2D,
        gridHeight: number,
        gridWidth: number,
        private readonly particleSize: number,
    ) {

        this.height = gridHeight * particleSize,
            this.width = gridWidth * particleSize,

            this.matrix = new CellularMatrix(
                gridHeight,
                gridWidth,
            );

        this.worldCanvas = new WorldCanvasManager(this.width, this.height, particleSize);

        this.simulation.on('start', () => this.setSimulationSpeed(1));
        this.simulation.on('stop', () => this.setSimulationSpeed(0));
        this.simulation.on('restart', () => this.restart());
        this.simulation.on('createParticles', event => {
            this.creationQueue.push(event);
        });
        this.simulation.on('removeParticles', event => {
            this.matrix.removeParticles({
                ...event,
                coordinate: this.toGridCoordinates(event.coordinate),
            });
        });
    }

    update(simulateNextStep: boolean = true): void {
        this.creationQueue.reverse();
        const blacklist = new Set<number>();
        for (const createParticlesEvent of this.creationQueue) {
            const coordinate = this.toGridCoordinates(createParticlesEvent.coordinate);
            this.matrix.createParticles({
                ...createParticlesEvent,
                coordinate,
            }, blacklist);
        }
        this.creationQueue.length = 0;

        if (simulateNextStep && this.simulationSpeed > 0) {
            this.matrix.simulate();
        }
    }

    render(): void {
        this.worldCanvas.update(this.ctx, this.matrix, {
            cleared: this.cleared,
        });

        this.cleared = false;
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