import {Random} from "excalibur";
import {Particle} from "../FallingSand/Particle/Particle.ts";

// type Coordinate = { x: number, y: number };

export class Array2D<I extends Particle> { //FIXME so it's usable for everything
    private store: Array<I>;
    public readonly changedIndexes = new Set<number>();
    private readonly random = new Random(); //TODO replace with better solution

    constructor(
        readonly height: number,
        readonly width: number,
        private readonly defaultValue: (index: number) => I,
        private readonly equalityCheck: (a: I, b: I) => boolean
    ) {
        // this.store = new Array<I>(this.width * this.height).fill(this.defaultValue);
        this.store = [...Array<I>(this.width * this.height)].map((_, index) => defaultValue(index));
    }

    clear(): void {
        this.store = [...Array<I>(this.width * this.height)].map((_, index) => this.defaultValue(index));
        this.changedIndexes.clear();
    }

    get(x: number, y: number): I {
        return this.store[y * this.width + x];
    }

    getIndex(index: number) { //FIXME can be undefined
        return this.store[index];
    }

    set(x: number, y: number, item: I): void {
        this.setIndex(y * this.width + x, item);
    }

    setIndex(index: number, item: I): void {
        this.store[index] = item;
        this.changedIndexes.add(index);
        item.index = index;
    }

    // swap(coordinateA: Coordinate, coordinateB: Coordinate): void {
    //     this.swapIndex(this.to)
    // }

    swapIndex(indexA:number,indexB:number): void {
        const a = this.getIndex(indexA);
        if (a === undefined) {
            return;
        }

        const b = this.getIndex(indexB);
        if (b === undefined) {
            return;
        }

        if (this.equalityCheck(a, b)) {
            return;
        }

        this.setIndex(indexA, b);
        this.setIndex(indexB, a);
    }

    forEach(callback: (item: I, data: { x: number, y: number, i: number }) => void): void {
        this.store.forEach((item, i) => {
            const x = i % this.width;
            const y = (i - x) / this.width;
            callback(item, {x, y, i});
        });
    }

    forEachBackward(callback: (item: I, data: { x: number, y: number, i: number }) => void): void {
        for (let i = this.store.length - this.width - 1; i > 0; i--) {
            const x = i % this.width;
            const y = (i - x) / this.width;
            callback(this.get(x, y), {x, y, i});
        }
    }

    randomWalk(callback: (item: I, data: { x: number, y: number, i: number }) => void, reverse:boolean = false): void {
        for (let row = this.height - 1; row >= 0; row--) {
            const rowOffset = row * this.width;
            const leftToRight = this.random.bool();
            for (let i = 0; i < this.width; i++) {
                // Go from right to left or left to right depending on our random value
                const columnOffset = leftToRight ? i : -i - 1 + this.width;
                let index = rowOffset + columnOffset;
                if (reverse) {
                    index = this.store.length - index - 1;
                }

                const {x, y} = this.toCoordinates(index);

                callback(this.getIndex(index), {x, y, i});
            }
        }
    }

    toCoordinates(index: number): { x: number, y: number } {
        const x = index % this.width;
        const y = (index - x) / this.width;
        return {x, y};
    }

    toIndex(x: number, y: number): number {
        return y * this.width + x;
    }

    clearIndex(index: number) {
        this.store[index] = this.defaultValue(index);
    }

    modifyIndexHook(index:number) {
        return index;
    }
}