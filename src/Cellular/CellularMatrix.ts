import {Particle} from "../FallingSand/Particle/Particle.ts";
import {Array2D} from "../Utility/Array2D.ts";
import {Coordinate} from "../Utility/Traversal.ts";
import {CellularChunk} from "./CellularChunk.ts";

export class CellularMatrix extends Array2D<Particle | undefined> {
    private readonly chunks: Array2D<CellularChunk>;

    private readonly chunkSize: number = 20;

    constructor(
        height: number,
        width: number,
    ) {
        super(
            height, width,
            () => undefined
        );

        this.chunks = new Array2D<CellularChunk>(
            Math.ceil(height / this.chunkSize),
            Math.ceil(width / this.chunkSize),
            () => new CellularChunk(),
        );
    }

    setIndex(index: number, item: Particle | undefined) {
        super.setIndex(index, item);

        if (!item) {
            return;
        }

        item.index = index;
        this.setChunkToActive(item);
    }

    swapIndex(indexA: number, indexB: number): void {
        const a = this.getIndex(indexA);

        if (indexB < 0 || indexB > this.length) {
            return; //TODO switch on/off if you want materials to fall offscreen?
        }

        const b = this.getIndex(indexB);
        if (a === b || a?.index === b?.index) {
            return;
        }

        this.setIndex(indexA, b);
        this.setIndex(indexB, a);
    }

    simulate(): void {
        [-1, 1].forEach(direction => {
            this.randomWalk((particle) => {
                // if (!particle || !particle.isFreeFalling) { // Does not work with behaviour that not related to movement
                //     return;
                // }

                particle?.update(this, {direction});
            }, direction < 0);
        });
    }

    randomWalk(callback: (item: Particle | undefined, data: {
        x: number,
        y: number,
        i: number
    }) => void, reverse: boolean = false): void {
        for (let row = this.height - 1; row >= 0; row--) {
            const rowOffset = row * this.width;
            const leftToRight = Math.random() > 0.5;
            for (let i = 0; i < this.width; i++) {
                // Go from right to left or left to right depending on our random value
                const columnOffset = leftToRight ? i : -i - 1 + this.width;
                let index = rowOffset + columnOffset;
                if (reverse) {
                    index = this.length - index - 1;
                }

                const {x, y} = this.toCoordinates(index);

                callback(this.getIndex(index), {x, y, i});
            }
        }
    }

    public setChunkToActive(particle: Particle): void {
        const index = particle.index;
        const {x, y} = this.toCoordinates(index);

        const dX = x % this.chunkSize;
        const dY = y % this.chunkSize;

        // Activate neighboring chunks if next to them
        if (dX === 0) {
            this.getChunkForCoordinate({x: x - 1, y: y})?.setShouldUpdateNextFrame(true);
        } else if (dX === this.chunkSize - 1) {
            this.getChunkForCoordinate({x: x + 1, y: y})?.setShouldUpdateNextFrame(true);
        }

        if (dY === 0) {
            this.getChunkForCoordinate({x: x, y: y - 1})?.setShouldUpdateNextFrame(true);
        } else if (dY === this.chunkSize - 1) {
            this.getChunkForCoordinate({x: x, y: y + 1})?.setShouldUpdateNextFrame(true);
        }

        this.getChunkForCoordinate({x, y})?.setShouldUpdateNextFrame(true);
    }

    private getChunkForCoordinate({x, y}: Coordinate): CellularChunk | undefined {
        return this.chunks.get(
            Math.floor(x / this.chunkSize),
            Math.floor(y / this.chunkSize)
        );
    }
}