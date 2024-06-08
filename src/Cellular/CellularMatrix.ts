import {Random} from "excalibur";
import {Particle} from "../FallingSand/Particle/Particle.ts";
import {Array2D} from "../Utility/Array2D.ts";

export class CellularMatrix extends Array2D<Particle | undefined> {

    private readonly random = new Random();

    constructor(
        height: number,
        width: number,
        defaultValue: (index: number) => Particle | undefined = () => undefined,
    ) {
        super(
            height, width,
            defaultValue
        );
    }

    setIndex(index: number, item: Particle | undefined) {
        super.setIndex(index, item);

        if (item) {
            item.index = index;
        }
    }

    swapIndex(indexA:number,indexB:number): void {
        const a = this.getIndex(indexA);

        if (indexB <0 || indexB > this.width * this.height) {
            return; //TODO switch on/off if you want materials to fall offscreen?
        }

        const b = this.getIndex(indexB);
        if (a === b || a?.index === b?.index) {
            return;
        }

        this.setIndex(indexA, b);
        this.setIndex(indexB, a);
    }

    randomWalk(callback: (item: Particle | undefined, data: { x: number, y: number, i: number }) => void, reverse:boolean = false): void {
        for (let row = this.height - 1; row >= 0; row--) {
            const rowOffset = row * this.width;
            const leftToRight = this.random.bool();
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
}