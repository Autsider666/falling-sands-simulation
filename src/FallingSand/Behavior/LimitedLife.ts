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
    protected onTick: onTick;
    protected onDeath: OnDeath;
    public remainingLife: number;

    constructor(
        owner:Particle,
        public readonly lifetime: number,
        {onTick, onDeath}: Props = {},
    ) {
        super(owner);
        this.remainingLife = this.lifetime;
        this.onTick = onTick ?? (() => {
        });
        this.onDeath = onDeath ?? ((_, particle, grid) => {
            grid.clearIndex(particle.index);
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
