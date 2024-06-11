import {Flammable} from "../FallingSand/Behavior/Flamable.ts";
import {LimitedLife} from "../FallingSand/Behavior/LimitedLife.ts";
import {Element} from "../FallingSand/Particle/Element.ts";
import {Particle} from "../FallingSand/Particle/Particle.ts";
import {CreateParticlesEvent, RemoveParticlesEvent} from "../SimulationInterface.ts";
import {Array2D} from "../Utility/Array2D.ts";
import {Coordinate} from "../Utility/Traversal.ts";
import {CellularChunk} from "./CellularChunk.ts";

export class CellularMatrix extends Array2D<Particle | undefined> {
    private readonly chunks: Array2D<CellularChunk>;

    private readonly chunkSize: number = 20;

    constructor(
        height: number,
        width: number,
        private readonly randomFunction: () => number = () => Math.random()
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

    public setIndex(index: number, item: Particle | undefined) {
        super.setIndex(index, item);

        if (!item) {
            return;
        }

        item.index = index;
        this.setChunkToActive(item);
    }

    public swapIndex(indexA: number, indexB: number): void {
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

    public simulate(): void {
        [-1, 1].forEach(direction => {
            this.randomWalk((particle) => {
                if (!particle) { // Does not work with behaviour that not related to movement
                    return;
                }

                if (!particle.isFreeFalling && !particle.hasBehavior(LimitedLife) && particle.getBehavior(Flammable)?.isBurning !== true) {
                    return; //FIXME it still leaves some floating particles
                }

                particle?.update(this, {direction});
            }, direction < 0);
        });
    }

    public randomWalk(callback: (item: Particle | undefined, data: {
        x: number,
        y: number,
        i: number
    }) => void, reverse: boolean = false): void {
        for (let row = this.height - 1; row >= 0; row--) {
            const rowOffset = row * this.width;
            const leftToRight = this.getRandomBool();
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

    public createParticles({
                               coordinate,
                               element,
                               force = false,
                               radius = 1,
                               probability = 1
                           }: CreateParticlesEvent) {
        this.iterateAroundCoordinate(
            coordinate,
            index => {
                if (force || this.getIndex(index) === undefined) {
                    this.setIndex(index, Element.create(index, element));
                }
            },
            radius,
            probability,
        );
    }

    public removeParticles({
                               coordinate,
                               radius = 1,
                               probability = 1
                           }: RemoveParticlesEvent) {
        const removed: number[] = [];
        this.iterateAroundCoordinate(
            coordinate,
            index => this.getIndex(index) !== undefined ? removed.push(index) && this.setIndex(index, undefined) : undefined,
            radius,
            probability,
        );

        for (const index of removed) {
            this.iterateAroundCoordinate(
                this.toCoordinates(index),
                neighbor => {
                    if (neighbor === index) {
                        console.log('Does this happen?');
                    }

                    this.getIndex(neighbor)?.triggerFreeFalling();
                    if (this.getIndex(neighbor)) {
                        console.log(this.getIndex(neighbor));
                    }
                },
                1);
        }
    }

    private iterateAroundCoordinate(
        {x, y}: Coordinate,
        callback: (index: number, coordinate: Coordinate) => void,
        radius: number,
        probability: number = 1,
    ) {
        const radiusSquared = radius * radius;
        for (let dX = -radius; dX <= radius; dX++) {
            for (let dY = -radius; dY <= radius; dY++) {
                if (dX * dX + dY * dY <= radiusSquared && (probability >= 1 || this.getRandomBool())) {
                    const resultingY = y + dY;
                    if (resultingY < 0 || resultingY >= this.height - 1) {
                        continue;
                    }

                    const resultingX = x + dX;
                    if (resultingX >= 0 && resultingX < this.width - 1) {
                        const index = this.toIndex(resultingX, resultingY);
                        callback(index, {x: resultingX, y: resultingY});
                    }
                }
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

    private getRandomBool(chanceOfTrue: number = 0.5): boolean {
        return this.randomFunction() > chanceOfTrue;
    }
}