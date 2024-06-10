import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";
import {Moves} from "./Moves.ts";

//TODO remove when horizontal velocity is a thing
export class GasMoves extends Moves {
    // canPassThrough(particle:Particle) {
    //     return particle?.empty ?? false;
    // }

    possibleMoves(matrix:CellularMatrix, i:number) {
        const nextDelta = Math.sign(this.owner.velocity.y) * matrix.width;
        const nextVertical = i + nextDelta;
        const column = nextVertical % matrix.width;

        const nextVerticalLeft = nextVertical - 1;
        const nextVerticalRight = nextVertical + 1;

        const nextLeft = i - 1;
        const nextRight = i + 1;

        const moves = [];
        const weights = [];

        if (this.canPassThrough(matrix.getIndex(nextVertical))) {
            moves.push(nextVertical);
            weights.push(2);
        }

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

        // if (!this.burning) { //TODO this does not have burning right?
            // Check to make sure belowLeft didn't wrap to the next line
            if (this.canPassThrough(matrix.getIndex(nextLeft)) && nextLeft % matrix.width < column) {
                moves.push(nextLeft);
                weights.push(1);
            }

            // Check to make sure belowRight didn't wrap to the next line
            if (this.canPassThrough(matrix.getIndex(nextRight)) && nextRight % matrix.width > column) {
                moves.push(nextRight);
                weights.push(1);
            }
        // }

        return {moves, weights};
    }
}