import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";
import {Random} from "excalibur";
import {Moves} from "./Moves.ts";

const random = new Random();

export class FluidMoves extends Moves {
    private lastHeight:number = 0;
    private heightCounter: number = 1;

    possibleMoves(matrix: CellularMatrix, i: number): { moves: number[]; weights: number[] } {
        const result =  super.possibleMoves(matrix, i);

        if(result.weights.length === 0) {
            const dir =random.integer(1,5);
            const {y} = matrix.toCoordinates(i);

            if (this.lastHeight !== y) {
                this.lastHeight = y;
                this.heightCounter = 50;
            } else if (--this.heightCounter <= 0 && random.bool(10/Math.abs(this.heightCounter))) {
                return result;
            }

            let leftBlocked = false;
            let rightBlocked = false;

            const column = i % matrix.width;
            for (let j = 1; j < dir; j++) {
                const nextHorizontalLeft = i - j;
                const nextHorizontalRight = i + j;
                if (!leftBlocked && this.canPassThrough(matrix.getIndex(nextHorizontalLeft)) && nextHorizontalLeft % matrix.width < column) {
                    result.moves.push(nextHorizontalLeft);
                    result.weights.push(1);
                } else {
                    leftBlocked = true;
                }

                // Check to make sure belowRight didn't wrap to the next line
                if (!rightBlocked && this.canPassThrough(matrix.getIndex(nextHorizontalRight)) && nextHorizontalRight % matrix.width > column) {
                    result.moves.push(nextHorizontalRight);
                    result.weights.push(1);
                } else {
                    rightBlocked = true;
                }
            }
        }

        return result;
    }
}