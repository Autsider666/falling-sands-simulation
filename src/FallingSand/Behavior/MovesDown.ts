import {Array2D} from "../../Utility/Array2D.ts";
import {BaseBehaviourParams, Behavior} from "./Behavior.ts";
import {Particle} from "../Particle/Particle.ts";

function choose<T>(array: T[], weights: number[]): T { //TODO better position
    if (array.length !== weights.length) {
        throw new Error("Array and weights must be the same length");
    }
    const sum = weights.reduce((sum, a) => sum + a, 0);
    const r = Math.random() * sum;
    let threshold = 0;
    for (let i = 0; i < array.length; i++) {
        threshold += weights[i];
        if (threshold >= r) {
            return array[i];
        }
    }
    throw new Error("Shouldn't get here.");
}

export class MovesDown<Params extends BaseBehaviourParams = BaseBehaviourParams> extends Behavior<Params> {
    // private readonly maxSpeed: number;
    // private readonly acceleration: number;
    // protected velocity: number;

    // constructor(owner:Particle) {
    //     super(owner);
    //
    //     // this.maxSpeed = maxSpeed ?? 0;
    //     // this.acceleration = acceleration ?? 0;
    //     // this.velocity = velocity ?? 0;
    // }

    resetVelocity() {
        this.owner.velocity = 0;
    }

    updateVelocity() {
        // let newVelocity = this.velocity + this.acceleration;
        //
        // if (Math.abs(newVelocity) > this.maxSpeed) {
        //     newVelocity = Math.sign(newVelocity) * this.maxSpeed;
        // }

        this.owner.velocity = this.nextVelocity();
    }

    nextVelocity(): number {
        if (this.owner.maxSpeed === 0) {
            return 0;
        }

        let newVelocity = this.owner.velocity + this.owner.acceleration;

        if (Math.abs(newVelocity) > this.owner.maxSpeed) {
            newVelocity = Math.sign(newVelocity) * this.owner.maxSpeed;
        }

        return newVelocity;
    }

    getUpdateCount(): number {
        const abs = Math.abs(this.owner.velocity);
        const floored = Math.floor(abs);
        const mod = abs - floored;
        // Treat a remainder (e.g. 0.5) as a random chance to update
        return floored + (Math.random() < mod ? 1 : 0);
    }

    canPassThrough(particle: Particle): boolean {
        return (particle?.empty || particle?.airy) ?? false;
    }

    possibleMoves(grid: Array2D<Particle>, i: number): { moves: number[], weights: number[] } {
        const nextDelta = Math.sign(this.owner.velocity) * grid.width;
        const nextVertical = i + nextDelta;
        const nextVerticalLeft = nextVertical - 1;
        const nextVerticalRight = nextVertical + 1;

        const column = nextVertical % grid.width;

        const moves = [];
        const weights = [];

        if (this.canPassThrough(grid.getIndex(nextVertical))) {
            moves.push(nextVertical);
            weights.push(2);
        } else {
            // Check to make sure belowLeft didn't wrap to the next line
            if (this.canPassThrough(grid.getIndex(nextVerticalLeft)) && nextVerticalLeft % grid.width < column) {
                moves.push(nextVerticalLeft);
                weights.push(1);
            }

            // Check to make sure belowRight didn't wrap to the next line
            if (this.canPassThrough(grid.getIndex(nextVerticalRight)) && nextVerticalRight % grid.width > column) {
                moves.push(nextVerticalRight);
                weights.push(1);
            }
        }

        return {moves, weights};
    }

    step(particle: Particle, grid: Array2D<Particle>): void {
        const i = particle.index;
        if (grid.getIndex(i)?.empty !== false) {
            this.resetVelocity();
            return;
        }

        const {moves, weights} = this.possibleMoves(grid, i);
        if (!moves.length) {
            this.resetVelocity();
            return;
        }

        const choice = choose<number>(moves, weights);
        grid.swapIndex(i, choice);
    }

    // @ts-expect-error because of current setup
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(particle: Particle, grid: Array2D<Particle>, params: Params): void {
        let index = particle.index;
        // let modified = false; // TODO not needed?

        this.updateVelocity();
        const updateCount = this.getUpdateCount();

        // Update the number of times the particle instructs us to
        for (let v = 0; v < updateCount; v++) {
            this.step(particle, grid);
            const newIndex = particle.index;

            // If we swapped the particle to a new location,
            // we need to update our index to be that new one.
            // As we are repeatedly updating the same this.
            if (newIndex !== index) {
                // We can add the same index multiple times, it's a set.
                grid.changedIndexes.add(index);
                grid.changedIndexes.add(newIndex);
                // modified = true;
            } else {
                this.resetVelocity();
                break;
            }

            index = particle.index;
        }

        if (updateCount === 0) {
            grid.changedIndexes.add(index);
        }
    }

}