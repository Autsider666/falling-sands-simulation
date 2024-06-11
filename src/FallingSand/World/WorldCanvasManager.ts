import {CellularMatrix} from "../../Cellular/CellularMatrix.ts";

type WorldDrawState = {
    cleared: boolean,
}

export class WorldCanvasManager {
    constructor(
    private readonly    width:number,
    private readonly   height:number,
    public readonly particleSize: number,
    ) {
    }

    update(
        ctx: CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D,
        matrix: CellularMatrix,
        {            cleared
        }: WorldDrawState
    ): number {
        if (cleared) {
            ctx.clearRect(0, 0, this.width, this.height);
            // ctx.fillStyle = transparent;
            // ctx.fillStyle = Air.baseColor;
            // ctx.fillRect(0, 0, this.width, this.height);
        }

        for (const index of matrix.changedIndexes) {
            const particle = matrix.getIndex(index);

            const {x, y} = matrix.toCoordinates(index);
            if (particle) {
                ctx.fillStyle = particle.color;
                ctx.fillRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
            } else {
                ctx.clearRect(x * this.particleSize, y * this.particleSize, this.particleSize, this.particleSize);
            }
        }

        const  particleDrawCount = matrix.changedIndexes.size;
        matrix.changedIndexes.clear(); //TODO should this be done in a draw function or outside?

        return particleDrawCount;
    }
}