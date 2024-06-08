import {ElementData, ElementIdentifier, Elements} from "../../Elements.ts";
import {Flammable} from "../Behavior/Flamable.ts";
import {FluidMoves} from "../Behavior/FluidMoves.ts";
import {LimitedLife} from "../Behavior/LimitedLife.ts";
import {Moves} from "../Behavior/Moves.ts";
import {Particle} from "./Particle.ts";

export class Element extends Particle {
    protected constructor(index: number, public readonly name: ElementIdentifier, data: ElementData) {
        const {
            color,
            colorVariance,
            acceleration,
            duration,
            fluidity,
            burning,
            fuel,
            fireSpreadSpeedModifier,
            chanceToIgnite,
        } = data;

        let resultingColor: string = color;
        if (colorVariance !== false) {
            resultingColor = Particle.varyColor(color, colorVariance);
        }

        super(
            index,
            resultingColor,
            data
        );

        if (acceleration !== undefined) {
            if (fluidity) {
                this.addBehaviour(new FluidMoves(this));
            } else {
                this.addBehaviour(new Moves(this));
            }
        }

        if (duration !== undefined) {
            const instanceDuration = typeof duration === 'function' ? duration() : duration;
            this.addBehaviour(new LimitedLife(this, instanceDuration));
        }

        if (fuel !== undefined || burning === true) {
            const instanceFuel = fuel === undefined ? undefined : typeof fuel === 'function' ? fuel() : fuel;
            this.addBehaviour(new Flammable(this, {
                fuel: instanceFuel,
                chanceToSpread: (behavior) => (fireSpreadSpeedModifier ?? 1) * behavior.remainingLife / behavior.lifetime,
                burning,
                color,
                chanceToIgnite,
            }));
        }
    }

    get baseColor(): string {
        return this.color;
    }

    static create(index: number, name: ElementIdentifier, modifications: Partial<ElementData> = {}): Element {
        return new Element(index, name, {...Elements[name], ...modifications});
    }
}