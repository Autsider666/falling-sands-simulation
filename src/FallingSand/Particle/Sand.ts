import {Particle} from "./Particle.ts";

export class Sand extends Particle {
    static baseColor: string = '#dcb159';

    constructor() {
        super(
            Particle.varyColor(Sand.baseColor),
        );
    }
    get baseColor(): string {
        return Sand.baseColor;
    }
}
