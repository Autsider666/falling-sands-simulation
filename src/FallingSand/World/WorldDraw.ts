import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";
import {Air} from "../Particle/Air.ts";

type WorldDrawState = {
    cleared: boolean,
}

export class WorldDraw {
    constructor(
    private readonly    width:number,
    private readonly   height:number,
    private readonly particleSize: number,
    ) {
    }

    drawCanvas(
        ctx: CanvasRenderingContext2D,
        matrix: CellularMatrix,
        {            cleared
        }: WorldDrawState
    ): number {
        if (cleared) {
            ctx.fillStyle = Air.baseColor;
            ctx.fillRect(0, 0, this.width, this.height);
            // this.cleared = false; //TODO make sure this is moved to World and worker
        }

        for (const index of matrix.changedIndexes) {
            const particle = matrix.getIndex(index);

            const {x, y} = matrix.toCoordinates(index);

            ctx.fillStyle = particle ? particle.color : Air.baseColor;

            ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
        }

        const  particleDrawCount = matrix.changedIndexes.size;
        matrix.changedIndexes.clear(); //TODO should this be done in a draw function or outside?

        return particleDrawCount;
    }
}