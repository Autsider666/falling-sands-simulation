import {Particle} from "./Particle.ts";
import {LimitedLife} from "../Behavior/LimitedLife.ts";
import {Flammable} from "../Behavior/Flamable.ts";
import {Random} from "excalibur";
import {GasMoves} from "../Behavior/GasMoves.ts";

type SmokeProps = {
    burning?: boolean
}

const random = new Random();//TODO should really be handled in another way

export class Smoke extends Particle {
    static baseColor = "#4C4A4D"; //FIXME this intermingles too much with the converted colors
    static addProbability = 0.25;

    constructor(index: number, {burning}: SmokeProps = {}) {
        const life = 400 + 400 * (Math.random());
        const color = Particle.varyColor(
            Smoke.baseColor, {
                lightnessModifier: () => random.integer(-5, 5),
                saturationModifier: () => random.integer(-5, 0)
            }
        );

        super(index, color, {
            airy: true,
            maxSpeed: 0.25,
            acceleration: -0.05,
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
                    onDeath: (_, particle, grid) => {
                        grid.clearIndex(particle.index);
                    }
                }
            ),
            new GasMoves(this),
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