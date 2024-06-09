import {Coordinate} from "./Traversal.ts";

export class Array2D<I> {
    private store: Array<I>;
    public readonly changedIndexes = new Set<number>();

    constructor(
        readonly height: number,
        readonly width: number,
        private readonly defaultValue: (index: number, coordinate: Coordinate) => I,
    ) {
        this.store = [...Array<I>(this.width * this.height)].map((_, index) => defaultValue(index, this.toCoordinates(index)));
    }

    get length(): number {
        return this.height * this.width;
    }

    clear(): void {
        this.store = [...Array<I>(this.width * this.height)].map((_, index) => this.defaultValue(index, this.toCoordinates(index)));
        this.changedIndexes.clear();
    }

    get(x: number, y: number): I {
        return this.store[y * this.width + x];
    }

    getIndex(index: number): I {
        return this.store[index];
    }

    set(x: number, y: number, item: I): void {
        this.setIndex(y * this.width + x, item);
    }

    setIndex(index: number, item: I): void {
        this.store[index] = item;
        this.changedIndexes.add(index);
    }

    forEach(callback: (item: I) => void): void {
        for (const item of this.store) {
            callback(item);
        }
    }

    forEachBackward(callback: (item: I) => void): void {
        for (let i = this.store.length - this.width - 1; i > 0; i--) {
            const x = i % this.width;
            const y = (i - x) / this.width;
            callback(this.get(x, y));
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
        this.store[index] = this.defaultValue(index, this.toCoordinates(index));
    }
}