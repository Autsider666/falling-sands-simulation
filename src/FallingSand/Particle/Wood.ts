import {Particle} from "./Particle.ts";

export class Wood extends Particle {
    static baseColor = "#46281d";
    static name: string = 'Wood';

    constructor(index: number) {
        super(index,
            Particle.varyColor(Wood.baseColor), {
                behaviours: []
            });
    }

    get baseColor(): string {
        return Wood.baseColor;
    }
}