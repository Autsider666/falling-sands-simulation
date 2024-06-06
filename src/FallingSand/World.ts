import {Particle} from "./Particle/Particle.ts";
import {Array2D} from "../Utility/Array2D.ts";
import {Air} from "./Particle/Air.ts";
import {Actor, Canvas, Engine, PointerAbstraction, Random, Vector} from "excalibur";
import {Sand} from "./Particle/Sand.ts";

export class World extends Actor {
    private readonly grid: Array2D<Particle>;
    private readonly canvas: Canvas;
    private readonly random = new Random();
    private primaryPointer?: PointerAbstraction;

    private drawRadius: number = 3;

    private isDrawing: boolean = false;

    constructor(
        gridHeight: number,
        gridWidth: number,
        private readonly particleSize: number,
    ) {
        super({
            height: gridHeight * particleSize,
            width: gridWidth * particleSize,
            anchor: Vector.Zero,
        });
        this.grid = new Array2D<Particle>(gridHeight, gridWidth, new Air());

        this.canvas = new Canvas({
            height: gridHeight * particleSize,
            width: gridWidth * particleSize,
            cache: true,
            draw: this.updateCanvas.bind(this),
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
            this.drawParticles(
                this.primaryPointer.lastWorldPos,
                () => new Sand(),
                this.drawRadius,
                0.5,
            );
        }

        this.updateGrid();

        this.canvas.flagDirty();
    }

    private updateCanvas(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = Air.color;
        ctx.fillRect(0, 0, this.width, this.height);

        this.grid.forEach((particle, {x, y}) => {
            if (particle instanceof Air) {
                return;
            }

            ctx.fillStyle = particle.color;

            ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
        });

        if (!this.primaryPointer) {
            return;
        }

        const {x, y} = this.primaryPointer.lastWorldPos;
        ctx.fillStyle = Sand.baseColor;

        const radiusSquared = this.drawRadius * this.drawRadius;
        for (let dX = -this.drawRadius; dX <= this.drawRadius; dX++) {
            for (let dY = -this.drawRadius; dY <= this.drawRadius; dY++) {
                if (dX * dX + dY * dY <= radiusSquared) {
                    ctx.fillRect(x + dX * this.particleSize, y + dY * this.particleSize, this.particleSize, this.particleSize);

                }
            }
        }
    }

    private updateGrid() {
        this.grid.forEachBackward((particle, {x, y}) => {
            if (particle.empty) {
                return;
            }

            const below = y + 1;
            if (this.grid.get(x, below)?.empty === true) {
                this.grid.swap({x, y}, {x, y: below});
                return;
            }

            const randomDirection = this.random.bool() ? -1 : 1;
            const firstTry = x - randomDirection;
            const secondTry = x + randomDirection;

            if (this.grid.get(firstTry, below)?.empty === true) {
                this.grid.swap({x, y}, {x: firstTry, y: below});
            } else if (this.grid.get(secondTry, below)?.empty === true) {
                this.grid.swap({x, y}, {x: secondTry, y: below});
            }
        });
    }

    private drawParticles(pos: Vector, creator: () => Particle, radius: number = 1, probability: number = 1) {
        const radiusSquared = radius * radius;
        const {x, y} = this.toGridCoordinates(pos);
        for (let dX = -radius; dX <= radius; dX++) {
            for (let dY = -radius; dY <= radius; dY++) {
                if (dX * dX + dY * dY <= radiusSquared && this.random.bool(probability)) {
                    this.grid.set(x + dX, y + dY, creator());
                }
            }
        }
    }

    private toGridCoordinates(vector: Vector): { x: number, y: number } {
        const x = Math.floor(vector.x / this.particleSize);
        const y = Math.floor(vector.y / this.particleSize);

        return {x, y};
    }
}