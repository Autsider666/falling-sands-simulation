import {Particle} from "./Particle.ts";

export class Air extends Particle {
    static baseColor: string = 'slategray';//'#FFFFFF00';

    constructor(index: number) {
        super(index, Air.baseColor, {empty: true});
    }

    get baseColor(): string {
        return Air.baseColor;
    }
}