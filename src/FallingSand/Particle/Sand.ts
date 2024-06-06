import {Particle} from "./Particle.ts";

export class Sand extends Particle {
    public static baseColor: string = '#dcb159';

    constructor() {
        super(
            Particle.varyColor(Sand.baseColor),
            // Sand.baseColor,
        );
    }
}
