import {Particle} from "./Particle.ts";
import {Fluid} from "../Behavior/Fluid.ts";

export class Water extends Particle {
    static baseColor = "#28A5EE37";
    static name: string = 'Water';

    constructor(index: number) {
        super(index,
            Particle.varyColor(Water.baseColor), {
                behaviours: [
                    new Fluid({
                        maxSpeed: 8,
                        acceleration: 0.6
                    }),
                ]
            });
    }

    get baseColor(): string {
        return Water.baseColor;
    }
}