import {Moves} from "./Moves.ts";
import {Particle} from "../Particle/Particle.ts";
import {Array2D} from "../../Utility/Array2D.ts";

export class GasMoves extends Moves {
    canPassThrough(particle:Particle) {
        return particle?.empty ?? false;
    }

    possibleMoves(grid:Array2D<Particle>, i:number) {
        const nextDelta = Math.sign(this.owner.velocity) * grid.width;
        const nextVertical = i + nextDelta;
        const column = nextVertical % grid.width;

        const nextVerticalLeft = nextVertical - 1;
        const nextVerticalRight = nextVertical + 1;

        const nextLeft = i - 1;
        const nextRight = i + 1;

        const moves = [];
        const weights = [];

        if (this.canPassThrough(grid.getIndex(nextVertical))) {
            moves.push(nextVertical);
            weights.push(2);
        }

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

        // if (!this.burning) { //TODO this does not have burning right?
            // Check to make sure belowLeft didn't wrap to the next line
            if (this.canPassThrough(grid.getIndex(nextLeft)) && nextLeft % grid.width < column) {
                moves.push(nextLeft);
                weights.push(1);
            }

            // Check to make sure belowRight didn't wrap to the next line
            if (this.canPassThrough(grid.getIndex(nextRight)) && nextRight % grid.width > column) {
                moves.push(nextRight);
                weights.push(1);
            }
        // }

        return {moves, weights};
    }
}