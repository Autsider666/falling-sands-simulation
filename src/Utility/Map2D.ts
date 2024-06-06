import {Vector} from "excalibur";

const splitter = '|';
type Entries<I> = [Vector, I][];

export default class Map2D<I> {
    private store: Map<string, I> = new Map<string, I>();
    private cachedEntries?: Entries<I>;

    get(x: number, y: number): I | undefined {
        return this.store.get(`${x}${splitter}${y}`);
    }

    has(x: number, y: number): boolean {
        return this.store.has(`${x}${splitter}${y}`);
    }

    set(x: number, y: number, item: I): void {
        this.store.set(`${x}${splitter}${y}`, item);

        this.cachedEntries = undefined;
    }

    delete(x: number, y: number): void {
        this.store.delete(`${x}${splitter}${y}`);

        this.cachedEntries = undefined;
    }

    entries(): Entries<I> {
        if (this.cachedEntries !== undefined) {
            return this.cachedEntries;
        }

        const entries: [Vector, I][] = [];
        for (const [key, item] of Array.from(this.store.entries())) {
            const keys = key.split(splitter);
            entries.push([new Vector(Number.parseInt(keys[0]), Number.parseInt(keys[1])), item]);
        }

        this.cachedEntries = entries;

        return entries;
    }
}