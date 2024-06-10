import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";
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

export class Moves<Params extends BaseBehaviourParams = BaseBehaviourParams> extends Behavior<Params> {
    resetVelocity() {
        this.owner.velocity.y = 0;
    }

    updateVelocity() {
        // let newVelocity = this.velocity + this.acceleration;
        //
        // if (Math.abs(newVelocity) > this.maxSpeed) {
        //     newVelocity = Math.sign(newVelocity) * this.maxSpeed;
        // }

        this.owner.velocity.y = this.nextVelocity();
    }

    nextVelocity(): number {
        if (this.owner.maxSpeed === 0) {
            return 0;
        }

        let newVelocity = this.owner.velocity.y + this.owner.acceleration.y;

        if (Math.abs(newVelocity) > this.owner.maxSpeed) {
            newVelocity = Math.sign(newVelocity) * this.owner.maxSpeed;
        }

        return newVelocity;
    }

    getUpdateCount(): number {
        const abs = Math.abs(this.owner.velocity.y);
        const floored = Math.floor(abs);
        const mod = abs - floored;
        // Treat a remainder (e.g. 0.5) as a random chance to update
        return floored + (Math.random() < mod ? 1 : 0);
    }

    canPassThrough(particle: Particle | undefined): boolean {
        return !particle || particle.density < this.owner.density;
    }

    possibleMoves(matrix: CellularMatrix, i: number): { moves: number[], weights: number[] } {
        const nextDelta = Math.sign(this.owner.velocity.y) * matrix.width;
        const nextVertical = i + nextDelta;
        const nextVerticalLeft = nextVertical - 1;
        const nextVerticalRight = nextVertical + 1;

        const column = nextVertical % matrix.width;

        const moves = [];
        const weights = [];

        if (this.canPassThrough(matrix.getIndex(nextVertical))) {
            moves.push(nextVertical);
            weights.push(2);
        } else {
            // Check to make sure belowLeft didn't wrap to the next line
            if (this.canPassThrough(matrix.getIndex(nextVerticalLeft)) && nextVerticalLeft % matrix.width < column) {
                moves.push(nextVerticalLeft);
                weights.push(1);
            }

            // Check to make sure belowRight didn't wrap to the next line
            if (this.canPassThrough(matrix.getIndex(nextVerticalRight)) && nextVerticalRight % matrix.width > column) {
                moves.push(nextVerticalRight);
                weights.push(1);
            }
        }

        if (moves.length === 0) {
            this.owner.isFreeFalling = false;
        } else {
            const upstairs = matrix.getIndex(i - nextDelta);
            if (upstairs) {
                upstairs.isFreeFalling = true;
            }

            const leftUpstairs = matrix.getIndex(i - nextDelta - 1);
            if (leftUpstairs) {
                leftUpstairs.isFreeFalling = true;
            }

            const rightUpstairs = matrix.getIndex(i - nextDelta + 1);
            if (rightUpstairs) {
                rightUpstairs.isFreeFalling = true;
            }

            const left = matrix.getIndex(i - 1);
            if (left) {
                left.isFreeFalling = true;
            }

            const right = matrix.getIndex(i + 1);
            if (right) {
                right.isFreeFalling = true;
            }
        }

        return {moves, weights};
    }

    updateStep(particle: Particle, matrix: CellularMatrix): void {
        const i = particle.index;
        // if (matrix.getIndex(i)?.empty !== false) {
        if (particle.density === 0) {
            this.resetVelocity();
            return;
        }

        const {moves, weights} = this.possibleMoves(matrix, i);
        if (!moves.length) {
            this.resetVelocity();
            return;
        }

        const choice = choose<number>(moves, weights);
        matrix.swapIndex(i, choice);
    }

    shouldUpdate({direction}: { direction?: number }) {
        // direction = direction ?? 1;
        return /** this.owner.isFreeFalling && **/ direction === Math.sign(this.nextVelocity());
    }

    update(particle: Particle, matrix: CellularMatrix, params: Params): void {
        if (!this.shouldUpdate(params)) {
            return;
        }

        let index = particle.index;

        this.updateVelocity();
        const updateCount = this.getUpdateCount();

        // Update the number of times the particle instructs us to
        for (let v = 0; v < updateCount; v++) {
            this.updateStep(particle, matrix);
            const newIndex = particle.index;

            // If we swapped the particle to a new location,
            // we need to update our index to be that new one.
            // As we are repeatedly updating the same this.
            if (newIndex !== index) {
                // We can add the same index multiple times, it's a set.
                matrix.changedIndexes.add(index);
                matrix.changedIndexes.add(newIndex);

                this.owner.dirty = true;
            } else {
                this.resetVelocity();
                break;
            }

            index = particle.index;
        }

    }
}