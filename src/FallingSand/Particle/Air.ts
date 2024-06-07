import {Particle} from "./Particle.ts";

export class Air extends Particle {
    static baseColor: string = '#0d1014';//'#FFFFFF00';

    constructor(index: number) {
        super(index, Air.baseColor, {empty: true});
    }

    get baseColor(): string {
        return Air.baseColor;
    }
}