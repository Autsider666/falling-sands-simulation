import {Array2D} from "../../Utility/Array2D.ts";
import {MovesDown} from "./MovesDown.ts";
import {Particle} from "../Particle/Particle.ts";

export class Moves<Params extends { direction?: number }= { direction?: number }> extends MovesDown<Params> {
    shouldUpdate({direction}: { direction?: number }) {
        // direction = direction ?? 1;
        return direction === Math.sign(this.nextVelocity());
    }

    update(particle: Particle, grid: Array2D<Particle>, params: Params):void {
        if (!this.shouldUpdate(params)) {
            return;
        }
        super.update(particle, grid, params);
    }
}
