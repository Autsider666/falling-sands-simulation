import {Canvas, CanvasOptions, GraphicOptions, RasterOptions} from "excalibur";

export class DirtyCanvas extends Canvas {

    constructor(_options: GraphicOptions & RasterOptions & CanvasOptions) {
        super(_options);
    }

    rasterize() {
       this._bitmap.setAttribute('forceUpload', 'true');
        this.execute(this._ctx);
        this._ctx.restore();
    }
}