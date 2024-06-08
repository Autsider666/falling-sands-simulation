import {Particle} from "./Particle.ts";
import {FluidMoves} from "../Behavior/FluidMoves.ts";

export class Water extends Particle {
    static baseColor = "#28A5EE"; //#28A5EE37
    static name: string = 'Water';

    constructor(index: number) {
        super(index,
            Particle.varyColor(Water.baseColor, {lightness: {value: 0}}),
            {
                maxSpeed: 8,
                acceleration: 0.4,
                density: 100,
            });

        this.addBehaviour(new FluidMoves(this));
    }

    get baseColor(): string {
        return Water.baseColor;
    }
}