import {HexColor} from "../../Elements.ts";
import {Particle} from "./Particle.ts";
import {LimitedLife} from "../Behavior/LimitedLife.ts";
import {Flammable} from "../Behavior/Flamable.ts";
import {GasMoves} from "../Behavior/GasMoves.ts";

type SmokeProps = {
    burning?: boolean
}

export class Smoke extends Particle {
    static baseColor:HexColor = "#4C4A4D"; //FIXME this intermingles too much with the converted colors
    static addProbability = 0.25;

    constructor(index: number, {burning}: SmokeProps = {}) {
        const life = 400 + 400 * (Math.random());
        const color = Particle.varyColor(
            Smoke.baseColor, {
                lightness: {min: -5, max: 5},
                saturation: {min: -5, max: 0},
            }
        );

        super(index, color, {
            maxSpeed: 0.25,
            acceleration: -0.05,
            density: 1,
        });

        if (burning) {
            this.addBehaviour(new Flammable(this, {
                fuel: life + 1,
                chanceToSpread: (behavior) => 0.5 * behavior.remainingLife / behavior.lifetime,
                burning: true,
                color: Smoke.baseColor
            }));
        }


        this.addBehaviors([
            new LimitedLife(
                this,
                life,
                {
                    onTick: (/**behavior, particle**/) => {
                        // TODO handle alpha
                        // particle.color.setAlpha(Math.floor(255.0 * behavior.remainingLife / behavior.lifetime));
                    },
                    // onDeath: (_, particle, grid) => {
                    //     grid.clearIndex(particle.index);
                    // }
                }
            ),
            new GasMoves(this), // FIXME Could be just Moves if horizontal movement is taken into account
        ]);

        // FIXME the fuck is happening here?
        // if (burning && Math.random() < 0.5) {
        //     this.acceleration = 0.2;
        //     this.maxSpeed = 0.4;
        // }
        //
        // this.burning = burning;
    }


    get baseColor(): string {
        return Smoke.baseColor;
    }
}