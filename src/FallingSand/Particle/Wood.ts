import {Particle} from "./Particle.ts";
import {Flammable} from "../Behavior/Flamable.ts";

export class Wood extends Particle {
    static baseColor = "#46281d";
    static name: string = 'Wood';

    constructor(index: number) {
        super(index, Particle.varyColor(Wood.baseColor));

        this.addBehaviour(new Flammable(this, {
            fuel: 200 + 100 * (Math.random()),
            chanceToSpread: (behavior) => behavior.remainingLife / behavior.lifetime,
            chanceToCatch: 0.005,
            color: Wood.baseColor,
        }));
    }

    get baseColor(): string {
        return Wood.baseColor;
    }
}