import {Behavior} from "./Behavior";
import {Particle} from "../Particle/Particle.ts";
import {Array2D} from "../../Utility/Array2D.ts";

type onTick = (behavior: LimitedLife, particle: Particle) => void
type OnDeath = (behavior: LimitedLife, particle: Particle, grid: Array2D<Particle>) => void

type Props = {
    onTick?: onTick,
    onDeath?: OnDeath,
}

export class LimitedLife extends Behavior {
    private readonly onTick: onTick;
    private readonly onDeath: OnDeath;
    private remainingLife: number;

    constructor(
        public readonly lifetime: number,
        {onTick, onDeath}: Props = {},
    ) {
        super();
        this.remainingLife = this.lifetime;
        this.onTick = onTick ?? (() => {
        });
        this.onDeath = onDeath ?? (() => {
        });
    }

    update(particle: Particle, grid: Array2D<Particle>): void {
        if (this.remainingLife <= 0) {
            this.onDeath(this, particle, grid);
        } else {
            this.remainingLife = Math.floor(this.remainingLife - 1);
        }

        this.onTick(this, particle);
        grid.changedIndexes.add(particle.index);
    }
}
