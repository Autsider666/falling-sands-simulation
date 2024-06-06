type Coordinate = { x: number, y: number };

export class Array2D<I> {
    private store: Array<I>;

    constructor(
        private readonly height: number,
        private readonly width: number,
        private readonly defaultValue: I,
    ) {
        this.store = new Array<I>(this.width * this.height).fill(this.defaultValue);
    }

    clear(): void {
        this.store = new Array<I>(this.width * this.height).fill(this.defaultValue);
    }

    get(x: number, y: number): I {
        return this.store[y * this.width + x];
    }

    set(x: number, y: number, item: I): void {
        this.store[y * this.width + x] = item;
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
}