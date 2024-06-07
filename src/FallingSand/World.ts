import {Particle} from "./Particle/Particle.ts";
import {Array2D} from "../Utility/Array2D.ts";
import {Air} from "./Particle/Air.ts";
import {Actor, Canvas, Engine, PointerAbstraction, Random, Vector} from "excalibur";
import {Sand} from "./Particle/Sand.ts";
import {Constructor} from "../Utility/Type.ts";
import {DirtyCanvas} from "../Utility/DirtyCanvas.ts";

export class World extends Actor {
    private readonly grid: Array2D<Particle>;
    private readonly canvas: Canvas;
    private readonly random = new Random();
    private primaryPointer?: PointerAbstraction;

    private currentParticleType: Constructor<Particle> = Sand;

    private drawRadius: number = 3;

    private isDrawing: boolean = false;

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
        this.grid = new Array2D<Particle>(gridHeight, gridWidth, new Air(), (a, b) => a.empty && b.empty);

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
                () => new this.currentParticleType(),
                this.drawRadius,
                0.5,
            );
        }

        if (this.cleared || this.grid.getLastChanges(false).length) {
            this.canvas.flagDirty();
        }

        if (this.simulationSpeed > 0) {
            this.updateGrid();
        }
    }

    public setCurrentParticle(particleCreator: Constructor<Particle>): void {
        this.currentParticleType = particleCreator;
    }

    private drawCanvas(ctx: CanvasRenderingContext2D): void {
        if (this.cleared) {
            ctx.fillStyle = Air.baseColor;
            ctx.fillRect(0, 0, this.width, this.height);
            this.cleared = false;
        }

        this.grid.getLastChanges().forEach(index => {
            const particle = this.grid.getIndex(index);
            const {x, y} = this.grid.toCoordinates(index);
            // this.grid.forEach((particle,{x,y}) => {
            // if (particle instanceof Air) { //TODO check if this is maybe better
            //     return;
            // }

            ctx.fillStyle = particle.color;

            ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
        });

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
        this.grid.randomWalk((particle, {x, y}) => {
            if (particle.empty) {
                return;
            }

            const below = y + 1;
            if (this.grid.get(x, below)?.empty === true) {
                this.grid.swap({x, y}, {x, y: below});
                return;
            }

            const randomDirection = -1;//this.random.bool() ? -1 : 1;
            const firstTry = x - randomDirection;
            const secondTry = x + randomDirection;
            if (this.grid.get(firstTry, below)?.empty === true && (this.dimensionalWraparound || firstTry >= 0 && firstTry < this.grid.width - 1)) {
                this.grid.swap({x, y}, {x: firstTry, y: below});
            } else if (this.grid.get(secondTry, below)?.empty === true && (this.dimensionalWraparound || secondTry >= 0 && secondTry < this.grid.width - 1)) {
                this.grid.swap({x, y}, {x: secondTry, y: below});
            }
        });
    }

    private createParticles(pos: Vector, creator: () => Particle, radius: number = 1, probability: number = 1) {
        const radiusSquared = radius * radius;
        const {x, y} = this.toGridCoordinates(pos);
        for (let dX = -radius; dX <= radius; dX++) {
            for (let dY = -radius; dY <= radius; dY++) {
                if (dX * dX + dY * dY <= radiusSquared && this.random.bool(probability)) {
                    const resultingY = y + dY;
                    if (resultingY < 0 || resultingY >= this.grid.height - 1) {
                        continue;
                    }

                    const resultingX = x + dX;
                    if (this.dimensionalWraparound || resultingX >= 0 && resultingX < this.grid.width - 1) {
                        this.grid.set(resultingX, resultingY, creator());
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
        this.grid.clear();
        this.cleared = true;
    }

    setSimulationSpeed(speed: number) {
        this.simulationSpeed = Math.max(0, speed);
    }

    toggleDimensionalWraparound(): void {
        this.dimensionalWraparound = !this.dimensionalWraparound;
        console.log('TOGGLE');
    }
}