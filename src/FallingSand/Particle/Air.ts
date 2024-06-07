import {Particle} from "./Particle.ts";

export class Air extends Particle {
    static baseColor: string = 'slategray';//'#FFFFFF00';

    constructor() {
        super(Air.baseColor, true);
    }

    get baseColor(): string {
        return Air.baseColor;
    }
}