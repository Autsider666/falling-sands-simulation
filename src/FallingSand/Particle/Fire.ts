import {Particle} from "./Particle.ts";
import {Flammable} from "../Behavior/Flamable.ts";

export class Fire extends Particle {
    static baseColor = "#e34f0f";

    constructor(index: number) {
        super(
            index,
            Particle.varyColor(Flammable.colors[Math.floor(Math.random() * Flammable.colors.length)])
        );

        this.addBehaviour(new Flammable(this, {burning: true}));
    }

    get baseColor(): string {
        return Fire.baseColor;
    }
}