import {Array2D} from "../../Utility/Array2D.ts";
import {Particle} from "../Particle/Particle.ts";
import {MovesDown} from "./MovesDown.ts";
import {Random} from "excalibur";

const random = new Random();

export class Fluid extends MovesDown {
    private lastHeight:number = 0;
    private heightCounter: number = 1;

    possibleMoves(grid: Array2D<Particle>, i: number): { moves: number[]; weights: number[] } {
        const result =  super.possibleMoves(grid, i);

        if(result.weights.length === 0) {
            const dir =random.integer(1,5);
            const {y} = grid.toCoordinates(i);

            if (this.lastHeight !== y) {
                this.lastHeight = y;
                this.heightCounter = 50;
            } else if (--this.heightCounter <= 0 && random.bool(10/Math.abs(this.heightCounter))) {
                return result;
            }

            let leftBlocked = false;
            let rightBlocked = false;

            const column = i % grid.width;
            for (let j = 1; j < dir; j++) {
                const nextHorizontalLeft = i - j;
                const nextHorizontalRight = i + j;
                if (!leftBlocked && this.canPassThrough(grid.getIndex(nextHorizontalLeft)) && nextHorizontalLeft % grid.width < column) {
                    result.moves.push(nextHorizontalLeft);
                    result.weights.push(1);
                } else {
                    leftBlocked = true;
                }

                // Check to make sure belowRight didn't wrap to the next line
                if (!rightBlocked && this.canPassThrough(grid.getIndex(nextHorizontalRight)) && nextHorizontalRight % grid.width > column) {
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