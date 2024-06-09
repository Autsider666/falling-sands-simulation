import {CellularMatrix} from "../Cellular/CellularMatrix.ts";
import {ElementIdentifier} from "../Elements.ts";
import {Coordinate} from "../Utility/Traversal.ts";
import {Element} from "./Particle/Element.ts";
import {Air} from "./Particle/Air.ts";
import {Actor, Canvas, Engine, PointerAbstraction, Random, Vector} from "excalibur";
import {DirtyCanvas} from "../Utility/DirtyCanvas.ts";

export class World extends Actor {
    private readonly matrix: CellularMatrix;
    private readonly canvas: Canvas;
    private readonly random = new Random();
    private primaryPointer?: PointerAbstraction;

    private simulationSpeed: number = 1;

    private cleared: boolean = true;

    constructor(
        gridHeight: number,
        gridWidth: number,
        private readonly particleSize: number,
        private dimensionalWraparound: boolean = false,
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

        this.canvas = new DirtyCanvas({
            height: gridHeight * particleSize,
            width: gridWidth * particleSize,
            cache: true,
            draw: this.drawCanvas.bind(this),
        });

        this.graphics.use(this.canvas);
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
        if (this.cleared) {
            ctx.fillStyle = Air.baseColor;
            ctx.fillRect(0, 0, this.width, this.height);
            this.cleared = false;
        }

        for (const index of this.matrix.changedIndexes) {
            const particle = this.matrix.getIndex(index);

            const {x, y} = this.matrix.toCoordinates(index);

            ctx.fillStyle = particle ? particle.color : Air.baseColor;

            ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
        }

        this.matrix.changedIndexes.clear();
    }

    private updateGrid() {
        [-1, 1].forEach(direction => {
            this.matrix.randomWalk((particle) => {
                if (particle) {
                    particle.update(this.matrix, {direction});
                }
            }, direction < 0);
        });
    }

    public createParticles(pos: Coordinate, type: ElementIdentifier, radius: number = 1, probability: number = 1, override: boolean = false) {
        this.iterateAroundCoordinate(
            pos,
            index => {
                if (override || this.matrix.getIndex(index) === undefined) {
                    this.matrix.setIndex(index, Element.create(index, type));
                }
            },
            radius,
            probability,
        );
    }

    public removeParticles(pos: Coordinate, radius: number = 1, probability: number = 1) {
        this.iterateAroundCoordinate(
            pos,
            index => this.matrix.getIndex(index) !== undefined ? this.matrix.setIndex(index, undefined) : undefined,
            radius,
            probability,
        );
    }


    private iterateAroundCoordinate(pos: Coordinate, callback: (index: number, coordinate: Coordinate) => void, radius: number, probability: number) {
        const radiusSquared = radius * radius;
        const {x, y} = this.toGridCoordinates(pos);
        for (let dX = -radius; dX <= radius; dX++) {
            for (let dY = -radius; dY <= radius; dY++) {
                if (dX * dX + dY * dY <= radiusSquared && this.random.bool(probability)) {
                    const resultingY = y + dY;
                    if (resultingY < 0 || resultingY >= this.matrix.height - 1) {
                        continue;
                    }

                    const resultingX = x + dX;
                    if (this.dimensionalWraparound || resultingX >= 0 && resultingX < this.matrix.width - 1) {
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

    clear() {
        this.matrix.clear();
        this.cleared = true;
    }

    setSimulationSpeed(speed: number) {
        this.simulationSpeed = Math.max(0, speed);
    }

    toggleDimensionalWraparound(): void {
        this.dimensionalWraparound = !this.dimensionalWraparound;
    }
}