import {Particle} from "./Particle.ts";
import {Moves} from "../Behavior/Moves.ts";

export class Sand extends Particle {
    static baseColor: string = '#dcb159';
    static addProbability: number = 0.5;
    static name: string = 'Sand';

    constructor(index:number) {
        super(
            index,
            Particle.varyColor(Sand.baseColor),
            {
                behaviours: [
                    new Moves({
                        maxSpeed: 8,
                        acceleration: 0.4
                    }),
                ]
            }
        );
    }

    get baseColor(): string {
        return Sand.baseColor;
    }
}
