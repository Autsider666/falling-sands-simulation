import {CellularMatrix} from "../Cellular/CellularMatrix.ts";
import {ElementIdentifier} from "../Elements.ts";
import {Element} from "./Particle/Element.ts";
import {Particle} from "./Particle/Particle.ts";
import {Air} from "./Particle/Air.ts";
import {Actor, Canvas, Engine, PointerAbstraction, Random, Vector} from "excalibur";
import {DirtyCanvas} from "../Utility/DirtyCanvas.ts";

export class World extends Actor {
    private readonly matrix: CellularMatrix;
    private readonly canvas: Canvas;
    private readonly random = new Random();
    private primaryPointer?: PointerAbstraction;

    private drawRadius: number = 3;

    private isDrawing: boolean = false;

    private simulationSpeed: number = 1;

    private cleared: boolean = true;

    constructor(
        gridHeight: number,
        gridWidth: number,
        private readonly particleSize: number,
        private currentParticleType: ElementIdentifier,
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

        this.on<'pointerdown'>('pointerdown', () => this.isDrawing = true);
        this.on<'pointerup'>('pointerup', () => this.isDrawing = false);
    }

    onPreUpdate(engine: Engine) {
        if (this.primaryPointer === undefined) {
            this.primaryPointer = engine.input.pointers.primary;
        }

        if (this.isDrawing) {
            this.createParticles(
                this.primaryPointer.lastWorldPos,
                (index: number) => Element.create(index, this.currentParticleType),
                this.drawRadius,
                0.5,
            );
        }

        if (this.cleared || this.matrix.changedIndexes.size) {
            this.canvas.flagDirty();
        }

        if (this.simulationSpeed > 0) {
            this.updateGrid();
        }
    }

    public setCurrentParticle(element: ElementIdentifier): void {
        this.currentParticleType = element;
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

        // if (!this.primaryPointer) { //TODO replace with actor to mimic this
        //     return;
        // }
        //
        // const {x, y} = this.primaryPointer.lastWorldPos;
        // ctx.fillStyle = this.currentParticleType.prototype.baseColor;
        //
        // const radiusSquared = this.drawRadius * this.drawRadius;
        // for (let dX = -this.drawRadius; dX <= this.drawRadius; dX++) {
        //     for (let dY = -this.drawRadius; dY <= this.drawRadius; dY++) {
        //         if (dX * dX + dY * dY <= radiusSquared) {
        //             ctx.fillRect(x + dX * this.particleSize, y + dY * this.particleSize, this.particleSize, this.particleSize);
        //
        //         }
        //     }
        // }
    }

    private updateGrid() {
        [-1, 1].forEach(direction => {
            this.matrix.randomWalk((particle) => {
                if (particle){
                    particle.update(this.matrix, {direction});
                }
            }, direction < 0);
        });
    }

    private createParticles(pos: Vector, creator: (index: number) => Particle, radius: number = 1, probability: number = 1) {
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
                        this.matrix.set(resultingX, resultingY, creator(this.matrix.toIndex(resultingX, resultingY)));
                    }
                }
            }
        }
    }

    private toGridCoordinates(vector: Vector): { x: number, y: number } {
        const x = Math.floor(vector.x / this.particleSize);
        const y = Math.floor(vector.y / this.particleSize);

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