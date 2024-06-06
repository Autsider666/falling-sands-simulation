import {Particle} from "./Particle.ts";

export class Air extends Particle {
    static color:string = '#FFFFFF00';
constructor() {
    super(Air.color, true);
}
}