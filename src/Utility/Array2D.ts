import {Random} from "excalibur";

type Coordinate = { x: number, y: number };

export class Array2D<I> {
    private store: Array<I>;
    private readonly changedIndexes = new Set<number>();
    private readonly random = new Random(); //TODO replace with better solution

    constructor(
        readonly height: number,
        readonly width: number,
        private readonly defaultValue: I,
        private readonly equalityCheck: (a: I, b: I) => boolean
    ) {
        this.store = new Array<I>(this.width * this.height).fill(this.defaultValue);
    }

    clear(): void {
        this.store = new Array<I>(this.width * this.height).fill(this.defaultValue);
        this.changedIndexes.clear();
    }

    get(x: number, y: number): I {
        return this.store[y * this.width + x];
    }

    getIndex(index: number) {
        return this.store[index];
    }

    set(x: number, y: number, item: I): void {
        // if (x < 0 || x >= this.width || y < 0 || y >= this.height) { //Prevents the warping from left to right. Should probably be configurable
        //     return;
        // }

        const index = y * this.width + x;
        this.store[index] = item;
        this.changedIndexes.add(index);
    }

    swap(coordinateA: Coordinate, coordinateB: Coordinate): void {
        const a = this.get(coordinateA.x, coordinateA.y);
        if (a === undefined) {
            return;
        }

        const b = this.get(coordinateB.x, coordinateB.y);
        if (b === undefined) {
            return;
        }

        if (this.equalityCheck(a, b)) {
            return;
        }

        this.set(coordinateA.x, coordinateA.y, b);
        this.set(coordinateB.x, coordinateB.y, a);
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

    randomWalk(callback: (item: I, data: { x: number, y: number, i: number }) => void): void {
        const rowCount = Math.floor(this.store.length / this.width);
        for (let row = rowCount - 1; row >= 0; row--) {
            const rowOffset = row * this.width;
            const leftToRight = this.random.bool();
            for (let i = 0; i < this.width; i++) {
                // Go from right to left or left to right depending on our random value
                const columnOffset = leftToRight ? i : -i - 1 + this.width;
                const index = rowOffset + columnOffset;
                const {x,y} =this.toCoordinates(index);

                callback(this.getIndex(index), {x, y, i});
            }
        }
    }

    toCoordinates(index: number): { x: number, y: number } {
        const x = index % this.width;
        const y = (index - x) / this.width;
        return {x, y};
    }

    getLastChanges(reset: boolean = true): number[] {
        const changes = Array.from(this.changedIndexes);
        if (reset) {
            this.changedIndexes.clear();
        }
        return changes;
    }
}